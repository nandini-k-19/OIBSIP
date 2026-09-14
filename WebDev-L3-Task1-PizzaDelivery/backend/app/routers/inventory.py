from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.jwt import get_current_admin
from app.models.user import User
from app.schemas.inventory import InventoryItem, InventoryUpdate
from app.services.inventory_service import get_all_inventory_items, update_inventory_item

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])


@router.get("", response_model=List[InventoryItem])
def list_inventory(db: Session = Depends(get_db)):
    """Fetch complete list of inventory items (bases, sauces, cheeses, vegetables) with live stock."""
    return get_all_inventory_items(db)


@router.patch("/update", response_model=InventoryItem)
def update_stock(
    update_data: InventoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin only: Add/reduce or set inventory item stock, threshold, and price."""
    return update_inventory_item(db, update_data)
