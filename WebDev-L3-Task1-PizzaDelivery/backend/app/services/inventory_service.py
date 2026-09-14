import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.pizza import PizzaBase, Sauce, Cheese, Vegetable, Pizza
from app.models.order import Order, OrderItem
from app.schemas.inventory import InventoryItem, InventoryUpdate

def get_all_inventory_items(db: Session) -> List[InventoryItem]:
    items: List[InventoryItem] = []

    def map_status(stock: int, threshold: int) -> str:
        if stock <= 0:
            return "OUT_OF_STOCK"
        elif stock < threshold:
            return "LOW_STOCK"
        return "IN_STOCK"

    # Pizza Bases
    for b in db.query(PizzaBase).all():
        items.append(InventoryItem(
            id=b.id,
            category="base",
            name=b.name,
            price=b.price,
            stock=b.stock,
            threshold=b.threshold,
            status=map_status(b.stock, b.threshold),
            is_available=b.is_available,
            updated_at=b.updated_at
        ))

    # Sauces
    for s in db.query(Sauce).all():
        items.append(InventoryItem(
            id=s.id,
            category="sauce",
            name=s.name,
            price=s.price,
            stock=s.stock,
            threshold=s.threshold,
            status=map_status(s.stock, s.threshold),
            is_available=s.is_available,
            updated_at=s.updated_at
        ))

    # Cheeses
    for c in db.query(Cheese).all():
        items.append(InventoryItem(
            id=c.id,
            category="cheese",
            name=c.name,
            price=c.price,
            stock=c.stock,
            threshold=c.threshold,
            status=map_status(c.stock, c.threshold),
            is_available=c.is_available,
            updated_at=c.updated_at
        ))

    # Vegetables
    for v in db.query(Vegetable).all():
        items.append(InventoryItem(
            id=v.id,
            category="vegetable",
            name=v.name,
            price=v.price,
            stock=v.stock,
            threshold=v.threshold,
            status=map_status(v.stock, v.threshold),
            is_available=v.is_available,
            updated_at=v.updated_at
        ))

    return items

def update_inventory_item(db: Session, update_data: InventoryUpdate) -> InventoryItem:
    cat = update_data.category.lower()
    item_id = update_data.item_id
    model_map = {
        "base": PizzaBase,
        "sauce": Sauce,
        "cheese": Cheese,
        "vegetable": Vegetable
    }

    if cat not in model_map:
        raise HTTPException(status_code=400, detail=f"Invalid inventory category: {cat}")

    model = model_map[cat]
    item = db.query(model).filter(model.id == item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail=f"Item with ID {item_id} not found in category {cat}")

    if update_data.is_absolute:
        new_stock = update_data.stock_change
    else:
        new_stock = item.stock + update_data.stock_change

    if new_stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative.")

    item.stock = new_stock
    item.is_available = (new_stock > 0)

    if update_data.threshold is not None:
        if update_data.threshold < 0:
            raise HTTPException(status_code=400, detail="Threshold cannot be negative.")
        item.threshold = update_data.threshold

    if update_data.price is not None:
        if update_data.price < 0:
            raise HTTPException(status_code=400, detail="Price cannot be negative.")
        item.price = update_data.price

    db.commit()
    db.refresh(item)

    status_str = "OUT_OF_STOCK" if item.stock <= 0 else ("LOW_STOCK" if item.stock < item.threshold else "IN_STOCK")
    return InventoryItem(
        id=item.id,
        category=cat,
        name=item.name,
        price=item.price,
        stock=item.stock,
        threshold=item.threshold,
        status=status_str,
        is_available=item.is_available,
        updated_at=item.updated_at
    )

def deduct_inventory_for_order(db: Session, order: Order):
    """
    Safely deduct inventory for all items in an order within a database transaction.
    If stock is insufficient, raises HTTPException and triggers a rollback.
    """
    # Track required quantities per ingredient model & ID
    base_counts: Dict[int, int] = {}
    sauce_counts: Dict[int, int] = {}
    cheese_counts: Dict[int, int] = {}
    veg_counts: Dict[int, int] = {}

    for item in order.items:
        qty = item.quantity
        if item.is_custom and item.customization:
            c = item.customization
            base_counts[c.base_id] = base_counts.get(c.base_id, 0) + qty
            sauce_counts[c.sauce_id] = sauce_counts.get(c.sauce_id, 0) + qty
            cheese_counts[c.cheese_id] = cheese_counts.get(c.cheese_id, 0) + qty

            try:
                veg_ids = json.loads(c.vegetable_ids_json)
                for v_id in veg_ids:
                    veg_counts[v_id] = veg_counts.get(v_id, 0) + qty
            except Exception:
                pass
        elif item.pizza_id:
            pizza = db.query(Pizza).filter(Pizza.id == item.pizza_id).first()
            if pizza:
                if pizza.base_id:
                    base_counts[pizza.base_id] = base_counts.get(pizza.base_id, 0) + qty
                if pizza.sauce_id:
                    sauce_counts[pizza.sauce_id] = sauce_counts.get(pizza.sauce_id, 0) + qty
                if pizza.cheese_id:
                    cheese_counts[pizza.cheese_id] = cheese_counts.get(pizza.cheese_id, 0) + qty

    # 1. Verify availability first
    for base_id, req in base_counts.items():
        base = db.query(PizzaBase).filter(PizzaBase.id == base_id).with_for_update().first()
        if not base or base.stock < req:
            name = base.name if base else f"Base #{base_id}"
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for pizza base '{name}'. Required: {req}, Available: {base.stock if base else 0}")

    for sauce_id, req in sauce_counts.items():
        sauce = db.query(Sauce).filter(Sauce.id == sauce_id).with_for_update().first()
        if not sauce or sauce.stock < req:
            name = sauce.name if sauce else f"Sauce #{sauce_id}"
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for sauce '{name}'. Required: {req}, Available: {sauce.stock if sauce else 0}")

    for cheese_id, req in cheese_counts.items():
        cheese = db.query(Cheese).filter(Cheese.id == cheese_id).with_for_update().first()
        if not cheese or cheese.stock < req:
            name = cheese.name if cheese else f"Cheese #{cheese_id}"
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for cheese '{name}'. Required: {req}, Available: {cheese.stock if cheese else 0}")

    for veg_id, req in veg_counts.items():
        veg = db.query(Vegetable).filter(Vegetable.id == veg_id).with_for_update().first()
        if not veg or veg.stock < req:
            name = veg.name if veg else f"Vegetable #{veg_id}"
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for vegetable '{name}'. Required: {req}, Available: {veg.stock if veg else 0}")

    # 2. Perform safe stock deduction
    for base_id, req in base_counts.items():
        base = db.query(PizzaBase).filter(PizzaBase.id == base_id).first()
        base.stock -= req
        if base.stock <= 0:
            base.is_available = False

    for sauce_id, req in sauce_counts.items():
        sauce = db.query(Sauce).filter(Sauce.id == sauce_id).first()
        sauce.stock -= req
        if sauce.stock <= 0:
            sauce.is_available = False

    for cheese_id, req in cheese_counts.items():
        cheese = db.query(Cheese).filter(Cheese.id == cheese_id).first()
        cheese.stock -= req
        if cheese.stock <= 0:
            cheese.is_available = False

    for veg_id, req in veg_counts.items():
        veg = db.query(Vegetable).filter(Vegetable.id == veg_id).first()
        veg.stock -= req
        if veg.stock <= 0:
            veg.is_available = False
