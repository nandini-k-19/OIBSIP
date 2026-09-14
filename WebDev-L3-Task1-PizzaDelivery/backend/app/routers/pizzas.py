from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.pizza import Pizza, PizzaBase, Sauce, Cheese, Vegetable
from app.schemas.pizza import PizzaResponse, CustomPizzaOptionsResponse, PizzaBaseResponse, SauceResponse, CheeseResponse, VegetableResponse

router = APIRouter(prefix="/pizzas", tags=["Pizzas & Custom Builder"])

@router.get("", response_model=List[PizzaResponse])
def get_all_pizzas(db: Session = Depends(get_db)):
    pizzas = db.query(Pizza).filter(Pizza.is_available == True).all()
    return pizzas

@router.get("/custom-options", response_model=CustomPizzaOptionsResponse)
def get_custom_pizza_options(db: Session = Depends(get_db)):
    bases = db.query(PizzaBase).filter(PizzaBase.is_available == True).all()
    sauces = db.query(Sauce).filter(Sauce.is_available == True).all()
    cheeses = db.query(Cheese).filter(Cheese.is_available == True).all()
    vegetables = db.query(Vegetable).filter(Vegetable.is_available == True).all()

    return CustomPizzaOptionsResponse(
        bases=[PizzaBaseResponse.model_validate(b) for b in bases],
        sauces=[SauceResponse.model_validate(s) for s in sauces],
        cheeses=[CheeseResponse.model_validate(c) for c in cheeses],
        vegetables=[VegetableResponse.model_validate(v) for v in vegetables]
    )
