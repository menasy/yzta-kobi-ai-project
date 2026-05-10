# models/shipment_event.py
from datetime import datetime
from typing import TYPE_CHECKING, Optional, Any

from sqlalchemy import String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

if TYPE_CHECKING:
    from .shipment import Shipment

class ShipmentEvent(Base, IDMixin, TimestampMixin):
    """Kargo durum güncellemeleri ve olay geçmişi."""
    __tablename__ = "shipment_events"

    shipment_id: Mapped[int] = mapped_column(ForeignKey("shipments.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(String(500))
    event_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    raw_payload: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON)

    # İlişkiler
    shipment: Mapped["Shipment"] = relationship(back_populates="events")
