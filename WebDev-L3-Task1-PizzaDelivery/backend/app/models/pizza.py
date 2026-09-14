import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class IngredientMixin:
    """Shared fields for all pizza ingredient tables."""
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    stock = Column(Integer, nullable=False, default=100)
    threshold = Column(Integer, nullable=False, default=20)
    is_available = Column(Boolean, default=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow,
                        onupdate=datetime.datetime.utcnow, nullable=False)


class PizzaBase(IngredientMixin, Base):
    __tablename__ = "pizza_bases"


class Sauce(IngredientMixin, Base):
    __tablename__ = "sauces"


class Cheese(IngredientMixin, Base):
    __tablename__ = "cheeses"


class Vegetable(IngredientMixin, Base):
    __tablename__ = "vegetables"


class Pizza(Base):
    __tablename__ = "pizzas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, default="veg")
    base_price = Column(Float, nullable=False)
    image_url = Column(String(255), nullable=True)

    # FK to ingredient tables (for pre-built pizzas)
    base_id = Column(Integer, ForeignKey("pizza_bases.id"), nullable=True)
    sauce_id = Column(Integer, ForeignKey("sauces.id"), nullable=True)
    cheese_id = Column(Integer, ForeignKey("cheeses.id"), nullable=True)

    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow,
                        onupdate=datetime.datetime.utcnow, nullable=False)

    base = relationship("PizzaBase")
    sauce = relationship("Sauce")
    cheese = relationship("Cheese")
    order_items = relationship("OrderItem", back_populates="pizza")