import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
)

from app.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    ingredient_name = Column(
        String(100),
        unique=True,
        nullable=False
    )

    quantity = Column(
        Float,
        nullable=False,
        default=0.0
    )

    unit = Column(
        String(30),
        nullable=False,
        default="kg"
    )

    low_stock_threshold = Column(
        Float,
        nullable=False,
        default=5.0
    )

    is_available = Column(
        Boolean,
        default=True,
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