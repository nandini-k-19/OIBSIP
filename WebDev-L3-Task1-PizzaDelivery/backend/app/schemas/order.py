from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus, PaymentStatus

class CustomPizzaSelection(BaseModel):
    base_id: int
    sauce_id: int
    cheese_id: int
    vegetable_ids: List[int] = []

class OrderItemCreate(BaseModel):
    pizza_id: Optional[int] = None
    pizza_name: str
    quantity: int = Field(..., ge=1)
    is_custom: bool = False
    customization: Optional[CustomPizzaSelection] = None

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    delivery_address: str
    items: List[OrderItemCreate]

class OrderCustomizationResponse(BaseModel):
    id: int
    base_id: int
    sauce_id: int
    cheese_id: int
    vegetable_ids_json: str
    vegetable_names_json: str
    customization_price: float

    model_config = ConfigDict(from_attributes=True)

class OrderItemResponse(BaseModel):
    id: int
    pizza_id: Optional[int] = None
    pizza_name: str
    quantity: int
    unit_price: float
    total_price: float
    is_custom: bool
    customization: Optional[OrderCustomizationResponse] = None

    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    status: OrderStatus
    payment_status: PaymentStatus
    subtotal: float
    delivery_fee: float
    tax: float
    grand_total: float
    delivery_address: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
