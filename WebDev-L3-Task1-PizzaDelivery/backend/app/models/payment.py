import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    order_id = Column(
        Integer,
        ForeignKey("orders.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    razorpay_order_id = Column(
        String(100),
        unique=True,
        nullable=True
    )

    razorpay_payment_id = Column(
        String(100),
        unique=True,
        nullable=True
    )

    razorpay_signature = Column(
        String(255),
        nullable=True
    )

    amount = Column(
        Float,
        nullable=False
    )

    currency = Column(
        String(10),
        default="INR",
        nullable=False
    )

    status = Column(
        String(30),
        default="CREATED",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False
    )

    order = relationship(
        "Order",
        back_populates="payment"
    )