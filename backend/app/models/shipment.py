# models/shipment.py
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

if TYPE_CHECKING:
    from .order import Order
    from .shipment_event import ShipmentEvent

class Shipment(Base, IDMixin, TimestampMixin):
    """Kargo ana tablosu."""
    __tablename__ = "shipments"

    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), unique=True, nullable=False)
    
    # yurtici, aras, mng, ptt, mock
    carrier: Mapped[str] = mapped_column(String(50), nullable=False)
    tracking_number: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True)
    
    # created, in_transit, delivered, delayed, failed, cancelled
    status: Mapped[str] = mapped_column(String(50), server_default="created")
    
    estimated_delivery_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_checked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # İlişkiler
    order: Mapped["Order"] = relationship(back_populates="shipment")
    events: Mapped[list["ShipmentEvent"]] = relationship(back_populates="shipment", cascade="all, delete-orphan")
