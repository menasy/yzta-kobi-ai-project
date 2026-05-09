# models/customer.py
from typing import TYPE_CHECKING, Optional

from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

if TYPE_CHECKING:
    from .order import Order
    from .conversation import Conversation

class Customer(Base, IDMixin, TimestampMixin):
    """Sipariş veren müşteri bilgileri."""
    __tablename__ = "customers"

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    source_channel: Mapped[str] = mapped_column(String(50), server_default="web") # web, whatsapp, agent
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")

    # İlişkiler
    orders: Mapped[list["Order"]] = relationship(back_populates="customer")
    conversations: Mapped[list["Conversation"]] = relationship(back_populates="customer")
