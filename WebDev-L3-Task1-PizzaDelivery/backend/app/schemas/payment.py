from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class RazorpayOrderCreate(BaseModel):
    order_id: int

class RazorpayOrderResponse(BaseModel):
    razorpay_order_id: str
    amount: float
    currency: str
    key_id: str
    order_id: int
    is_mock: bool = False

class RazorpayPaymentVerify(BaseModel):
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: Optional[str] = "mock_signature"

class PaymentResponse(BaseModel):
    id: int
    order_id: int
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    amount: float
    currency: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
