# models/customer.py
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

from .base_model import IDMixin, TimestampMixin

if TYPE_CHECKING:
    from .conversation import Conversation


class Customer(Base, IDMixin, TimestampMixin):
    """Sipariş veren müşteri bilgileri."""

    __tablename__ = "customers"

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    source_channel: Mapped[str] = mapped_column(String(50), server_default="web")  # web, whatsapp, agent
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")

    # İlişkiler
    conversations: Mapped[list["Conversation"]] = relationship(back_populates="customer")
