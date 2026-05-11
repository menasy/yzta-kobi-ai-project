# models/order.py
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

from .base_model import IDMixin, TimestampMixin

if TYPE_CHECKING:
    from .inventory_movement import InventoryMovement
    from .order_item import OrderItem
    from .order_status_history import OrderStatusHistory
    from .shipment import Shipment
    from .user import User


class Order(Base, IDMixin, TimestampMixin):
    """Sipariş ana tablosu."""

    __tablename__ = "orders"

    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    # pending, processing, shipped, delivered, cancelled
    status: Mapped[str] = mapped_column(String(50), server_default="pending")

    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), server_default="0.00")
    notes: Mapped[str | None] = mapped_column(String(1000))
    shipping_full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    shipping_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    shipping_address: Mapped[str] = mapped_column(String(1000), nullable=False)
    shipping_city: Mapped[str] = mapped_column(String(100), nullable=False)
    shipping_district: Mapped[str] = mapped_column(String(100), nullable=False)
    shipping_postal_code: Mapped[str | None] = mapped_column(String(20))
    shipping_country: Mapped[str] = mapped_column(String(100), server_default="Türkiye")
    shipping_note: Mapped[str | None] = mapped_column(String(1000))
    placed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # İlişkiler
    customer: Mapped["User"] = relationship(back_populates="orders")
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")
    shipment: Mapped[Optional["Shipment"]] = relationship(back_populates="order", uselist=False)
    status_history: Mapped[list["OrderStatusHistory"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
    inventory_movements: Mapped[list["InventoryMovement"]] = relationship(back_populates="order")
