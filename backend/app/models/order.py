# models/order.py
from decimal import Decimal
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import String, ForeignKey, Numeric, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

if TYPE_CHECKING:
    from .customer import Customer
    from .order_item import OrderItem
    from .shipment import Shipment
    from .order_status_history import OrderStatusHistory
    from .inventory_movement import InventoryMovement
    from .notification import Notification

class Order(Base, IDMixin, TimestampMixin):
    """Sipariş ana tablosu."""
    __tablename__ = "orders"

    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)
    
    # pending, processing, shipped, delivered, cancelled
    status: Mapped[str] = mapped_column(String(50), server_default="pending")
    
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), server_default="0.00")
    notes: Mapped[Optional[str]] = mapped_column(String(1000))
    placed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # İlişkiler
    customer: Mapped["Customer"] = relationship(back_populates="orders")
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")
    shipment: Mapped[Optional["Shipment"]] = relationship(back_populates="order", uselist=False)
    status_history: Mapped[list["OrderStatusHistory"]] = relationship(back_populates="order", cascade="all, delete-orphan")
    inventory_movements: Mapped[list["InventoryMovement"]] = relationship(back_populates="order")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="order")
