# models/notification.py
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

if TYPE_CHECKING:
    from .user import User
    from .product import Product
    from .order import Order
    from .shipment import Shipment

class Notification(Base, IDMixin, TimestampMixin):
    """Sistem, stok, kargo ve sipariş uyarıları."""
    __tablename__ = "notifications"

    # low_stock, shipment_delayed, order_created, system
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(String(1000), nullable=False)
    
    # info, warning, critical
    severity: Mapped[str] = mapped_column(String(50), server_default="info")
    
    # unread, read, archived
    status: Mapped[str] = mapped_column(String(50), server_default="unread")
    
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[Optional[int]] = mapped_column(ForeignKey("products.id"))
    order_id: Mapped[Optional[int]] = mapped_column(ForeignKey("orders.id"))
    shipment_id: Mapped[Optional[int]] = mapped_column(ForeignKey("shipments.id"))
    
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # İlişkiler
    user: Mapped[Optional["User"]] = relationship(back_populates="notifications")
    product: Mapped[Optional["Product"]] = relationship(back_populates="notifications")
    order: Mapped[Optional["Order"]] = relationship(back_populates="notifications")
    shipment: Mapped[Optional["Shipment"]] = relationship(back_populates="notifications")
