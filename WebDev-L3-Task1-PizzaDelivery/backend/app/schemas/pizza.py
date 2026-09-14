from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class IngredientBase(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    threshold: int
    is_available: bool

    model_config = ConfigDict(from_attributes=True)

class PizzaBaseResponse(IngredientBase):
    pass

class SauceResponse(IngredientBase):
    pass

class CheeseResponse(IngredientBase):
    pass

class VegetableResponse(IngredientBase):
    pass

class PizzaResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: str = "veg"
    base_price: float
    image_url: Optional[str] = None
    is_available: bool = True
    base_id: Optional[int] = None
    sauce_id: Optional[int] = None
    cheese_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class CustomPizzaOptionsResponse(BaseModel):
    bases: List[PizzaBaseResponse]
    sauces: List[SauceResponse]
    cheeses: List[CheeseResponse]
    vegetables: List[VegetableResponse]
