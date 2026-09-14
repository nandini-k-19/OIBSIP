from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.jwt import get_current_user
from app.models.user import User
from app.models.order import Order
from app.schemas.payment import (
    RazorpayOrderCreate,
    RazorpayOrderResponse,
    RazorpayPaymentVerify,
    PaymentResponse
)
from app.schemas.order import OrderResponse
from app.services.payment_service import create_razorpay_order_for_db_order, verify_razorpay_signature
from app.services.order_service import confirm_order_payment
from app.websocket.connection_manager import ws_manager

router = APIRouter(prefix="/payments", tags=["Payments & Checkout"])


@router.post("/create", response_model=RazorpayOrderResponse)
def create_payment_order(
    data: RazorpayOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    rzp_data = create_razorpay_order_for_db_order(order)
    return RazorpayOrderResponse(**rzp_data)


@router.post("/verify", response_model=OrderResponse)
async def verify_payment(
    data: RazorpayPaymentVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    is_valid = verify_razorpay_signature(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature. Verification failed."
        )

    # Confirm order and deduct inventory atomically inside db transaction
    confirmed_order = confirm_order_payment(
        db=db,
        order_id=order.id,
        rzp_order_id=data.razorpay_order_id,
        rzp_payment_id=data.razorpay_payment_id,
        rzp_signature=data.razorpay_signature
    )

    # Broadcast real-time order update to any listening WebSocket clients
    await ws_manager.broadcast_order_update(order.id, {
        "order_id": order.id,
        "order_number": order.order_number,
        "status": confirmed_order.status.value,
        "payment_status": confirmed_order.payment_status.value
    })

    return confirmed_order
