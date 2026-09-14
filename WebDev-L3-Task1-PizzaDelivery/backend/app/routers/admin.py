from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.jwt import get_current_admin
from app.models.user import User
from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.pizza import PizzaBase, Sauce, Cheese, Vegetable
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.schemas.inventory import DashboardStats, InventoryItem, InventoryUpdate
from app.services.inventory_service import get_all_inventory_items, update_inventory_item
from app.websocket.connection_manager import ws_manager

router = APIRouter(prefix="/admin", tags=["Admin Operations"])


@router.get("/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    orders = db.query(Order).all()
    inventory_items = get_all_inventory_items(db)

    total_revenue = sum(o.grand_total for o in orders if o.payment_status == PaymentStatus.COMPLETED)
    pending_orders = sum(1 for o in orders if o.status == OrderStatus.ORDER_RECEIVED)
    in_kitchen_orders = sum(1 for o in orders if o.status == OrderStatus.IN_KITCHEN)
    sent_to_delivery_orders = sum(1 for o in orders if o.status == OrderStatus.SENT_TO_DELIVERY)
    delivered_orders = sum(1 for o in orders if o.status == OrderStatus.DELIVERED)
    low_stock_count = sum(1 for i in inventory_items if i.stock < i.threshold)

    return DashboardStats(
        total_orders=len(orders),
        pending_orders=pending_orders,
        in_kitchen_orders=in_kitchen_orders,
        sent_to_delivery_orders=sent_to_delivery_orders,
        delivered_orders=delivered_orders,
        total_revenue=round(total_revenue, 2),
        low_stock_count=low_stock_count
    )


@router.get("/orders", response_model=List[OrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return db.query(Order).order_by(Order.created_at.desc()).all()


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    order.status = status_data.status
    db.commit()
    db.refresh(order)

    # Real-time WebSocket broadcast to listening customer clients
    await ws_manager.broadcast_order_update(order.id, {
        "order_id": order.id,
        "order_number": order.order_number,
        "status": order.status.value,
        "payment_status": order.payment_status.value
    })

    return order


@router.get("/inventory", response_model=List[InventoryItem])
def get_inventory(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_all_inventory_items(db)


@router.patch("/inventory/update", response_model=InventoryItem)
def update_inventory(
    update_data: InventoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return update_inventory_item(db, update_data)
