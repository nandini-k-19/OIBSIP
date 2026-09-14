from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class InventoryItem(BaseModel):
    id: int
    category: str  # "base", "sauce", "cheese", "vegetable"
    name: str
    price: float
    stock: int
    threshold: int
    status: str  # "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"
    is_available: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InventoryUpdate(BaseModel):
    category: str  # "base", "sauce", "cheese", "vegetable"
    item_id: int
    stock_change: int  # e.g., +10 or set new stock
    is_absolute: bool = False  # If true, set stock = stock_change directly
    threshold: Optional[int] = None
    price: Optional[float] = None

class DashboardStats(BaseModel):
    total_orders: int
    pending_orders: int
    in_kitchen_orders: int
    sent_to_delivery_orders: int
    delivered_orders: int
    total_revenue: float
    low_stock_count: int
