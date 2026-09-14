import datetime
import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class OrderStatus(str, enum.Enum):
    ORDER_RECEIVED = "ORDER_RECEIVED"
    IN_KITCHEN = "IN_KITCHEN"
    SENT_TO_DELIVERY = "SENT_TO_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    status = Column(SQLEnum(OrderStatus), default=OrderStatus.ORDER_RECEIVED, nullable=False)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)

    subtotal = Column(Float, nullable=False, default=0.0)
    delivery_fee = Column(Float, nullable=False, default=0.0)
    tax = Column(Float, nullable=False, default=0.0)
    grand_total = Column(Float, nullable=False, default=0.0)

    delivery_address = Column(Text, nullable=True)
    customer_name = Column(String(100), nullable=True)
    customer_phone = Column(String(20), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow,
                        onupdate=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False,
                           cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    pizza_id = Column(Integer, ForeignKey("pizzas.id", ondelete="SET NULL"), nullable=True)

    pizza_name = Column(String(150), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    is_custom = Column(Boolean, default=False, nullable=False)

    order = relationship("Order", back_populates="items")
    pizza = relationship("Pizza", back_populates="order_items")
    customization = relationship("OrderCustomization", back_populates="order_item", uselist=False, cascade="all, delete-orphan")


class OrderCustomization(Base):
    __tablename__ = "order_customizations"

    id = Column(Integer, primary_key=True, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id", ondelete="CASCADE"), unique=True, nullable=False)

    base_id = Column(Integer, ForeignKey("pizza_bases.id"), nullable=False)
    sauce_id = Column(Integer, ForeignKey("sauces.id"), nullable=False)
    cheese_id = Column(Integer, ForeignKey("cheeses.id"), nullable=False)

    vegetable_ids_json = Column(Text, nullable=False, default="[]")  # JSON list of int IDs
    vegetable_names_json = Column(Text, nullable=False, default="[]")  # JSON list of string names
    customization_price = Column(Float, nullable=False, default=0.0)

    order_item = relationship("OrderItem", back_populates="customization")
    base = relationship("PizzaBase")
    sauce = relationship("Sauce")
    cheese = relationship("Cheese")