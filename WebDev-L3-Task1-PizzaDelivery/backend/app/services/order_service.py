import json
import uuid
from typing import List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.pizza import PizzaBase, Sauce, Cheese, Vegetable, Pizza
from app.models.order import Order, OrderItem, OrderCustomization, OrderStatus, PaymentStatus
from app.models.payment import Payment
from app.models.user import User
from app.schemas.order import OrderCreate, OrderItemCreate
from app.services.inventory_service import deduct_inventory_for_order

def calculate_item_price(db: Session, item: OrderItemCreate) -> Tuple[float, float, str, dict]:
    """
    Returns (unit_price, customization_price, pizza_name, customization_details_dict)
    """
    if item.is_custom and item.customization:
        c = item.customization
        base = db.query(PizzaBase).filter(PizzaBase.id == c.base_id).first()
        sauce = db.query(Sauce).filter(Sauce.id == c.sauce_id).first()
        cheese = db.query(Cheese).filter(Cheese.id == c.cheese_id).first()

        if not base or not base.is_available:
            raise HTTPException(status_code=400, detail=f"Selected pizza base is unavailable.")
        if not sauce or not sauce.is_available:
            raise HTTPException(status_code=400, detail=f"Selected sauce is unavailable.")
        if not cheese or not cheese.is_available:
            raise HTTPException(status_code=400, detail=f"Selected cheese is unavailable.")

        veg_names = []
        veg_price_total = 0.0
        for v_id in c.vegetable_ids:
            veg = db.query(Vegetable).filter(Vegetable.id == v_id).first()
            if not veg or not veg.is_available:
                raise HTTPException(status_code=400, detail=f"Selected vegetable ID {v_id} is unavailable.")
            veg_names.append(veg.name)
            veg_price_total += veg.price

        customization_price = base.price + sauce.price + cheese.price + veg_price_total
        unit_price = customization_price
        name = f"Custom Pizza ({base.name}, {sauce.name})"

        cust_details = {
            "base_id": base.id,
            "sauce_id": sauce.id,
            "cheese_id": cheese.id,
            "vegetable_ids_json": json.dumps(c.vegetable_ids),
            "vegetable_names_json": json.dumps(veg_names),
            "customization_price": customization_price
        }
        return unit_price, customization_price, name, cust_details
    else:
        if not item.pizza_id:
            raise HTTPException(status_code=400, detail="Standard pizza selection requires a valid pizza_id.")
        pizza = db.query(Pizza).filter(Pizza.id == item.pizza_id).first()
        if not pizza or not pizza.is_available:
            raise HTTPException(status_code=400, detail="Selected pizza is unavailable.")
        return pizza.base_price, 0.0, pizza.name, {}

def create_pending_order(db: Session, user: User, order_data: OrderCreate) -> Order:
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item.")

    subtotal = 0.0
    order_items_to_create = []

    for item in order_data.items:
        unit_price, cust_price, name, cust_details = calculate_item_price(db, item)
        total_price = unit_price * item.quantity
        subtotal += total_price

        order_items_to_create.append({
            "pizza_id": item.pizza_id if not item.is_custom else None,
            "pizza_name": name,
            "quantity": item.quantity,
            "unit_price": unit_price,
            "total_price": total_price,
            "is_custom": item.is_custom,
            "cust_details": cust_details
        })

    delivery_fee = 40.0 if subtotal < 500.0 else 0.0
    tax = round(subtotal * 0.05, 2)  # 5% tax
    grand_total = round(subtotal + delivery_fee + tax, 2)

    order_number = f"PH-{uuid.uuid4().hex[:8].upper()}"

    new_order = Order(
        order_number=order_number,
        user_id=user.id,
        status=OrderStatus.ORDER_RECEIVED,
        payment_status=PaymentStatus.PENDING,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        tax=tax,
        grand_total=grand_total,
        delivery_address=order_data.delivery_address,
        customer_name=order_data.customer_name,
        customer_phone=order_data.customer_phone
    )

    db.add(new_order)
    db.flush()

    for oi in order_items_to_create:
        item_obj = OrderItem(
            order_id=new_order.id,
            pizza_id=oi["pizza_id"],
            pizza_name=oi["pizza_name"],
            quantity=oi["quantity"],
            unit_price=oi["unit_price"],
            total_price=oi["total_price"],
            is_custom=oi["is_custom"]
        )
        db.add(item_obj)
        db.flush()

        if oi["is_custom"] and oi["cust_details"]:
            cd = oi["cust_details"]
            cust_obj = OrderCustomization(
                order_item_id=item_obj.id,
                base_id=cd["base_id"],
                sauce_id=cd["sauce_id"],
                cheese_id=cd["cheese_id"],
                vegetable_ids_json=cd["vegetable_ids_json"],
                vegetable_names_json=cd["vegetable_names_json"],
                customization_price=cd["customization_price"]
            )
            db.add(cust_obj)

    db.commit()
    db.refresh(new_order)
    return new_order

def confirm_order_payment(db: Session, order_id: int, rzp_order_id: str, rzp_payment_id: str, rzp_signature: str) -> Order:
    """
    Confirms payment, updates order & payment records, and safely deducts inventory inside a database transaction block.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    if order.payment_status == PaymentStatus.COMPLETED:
        return order

    # Perform inventory deduction inside explicit transaction
    try:
        deduct_inventory_for_order(db, order)

        order.payment_status = PaymentStatus.COMPLETED
        order.status = OrderStatus.ORDER_RECEIVED

        payment = db.query(Payment).filter(Payment.order_id == order_id).first()
        if not payment:
            payment = Payment(
                order_id=order.id,
                razorpay_order_id=rzp_order_id,
                razorpay_payment_id=rzp_payment_id,
                razorpay_signature=rzp_signature,
                amount=order.grand_total,
                status="SUCCESS"
            )
            db.add(payment)
        else:
            payment.razorpay_order_id = rzp_order_id
            payment.razorpay_payment_id = rzp_payment_id
            payment.razorpay_signature = rzp_signature
            payment.status = "SUCCESS"

        db.commit()
        db.refresh(order)
        return order
    except Exception as e:
        db.rollback()
        order.payment_status = PaymentStatus.FAILED
        db.commit()
        raise e
