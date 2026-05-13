# models/user.py
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

from .base_model import IDMixin, TimestampMixin

if TYPE_CHECKING:
    from .audit_log import AuditLog
    from .conversation import Conversation
    from .conversation_message import ConversationMessage
    from .inventory_movement import InventoryMovement
    from .order import Order
    from .order_status_history import OrderStatusHistory
    from .user_address import UserAddress


class User(Base, IDMixin, TimestampMixin):
    """Sisteme giriş yapan kullanıcılar."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), server_default="customer")
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # İlişkiler
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    inventory_movements: Mapped[list["InventoryMovement"]] = relationship(back_populates="created_by_user")
    orders: Mapped[list["Order"]] = relationship(back_populates="customer")
    order_status_history: Mapped[list["OrderStatusHistory"]] = relationship(back_populates="changed_by_user")
    addresses: Mapped[list["UserAddress"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    conversations: Mapped[list["Conversation"]] = relationship(back_populates="user")
    conversation_messages: Mapped[list["ConversationMessage"]] = relationship(back_populates="user")
