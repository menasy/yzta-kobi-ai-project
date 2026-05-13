# models/conversation.py
# AI agent konuşma oturum metadata tablosu.
# Kalıcı sohbet geçmişi: user_id ile kullanıcıya bağlı, soft delete destekli.
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

if TYPE_CHECKING:
    from .customer import Customer
    from .user import User
    from .conversation_message import ConversationMessage


class Conversation(Base, IDMixin, TimestampMixin):
    """AI agent konuşma oturum metadata tablosu."""
    __tablename__ = "conversations"

    # Redis'teki mesajları eşleştirmek için unique session_id
    session_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)

    # Kalıcı sohbet geçmişi — kullanıcı sahipliği
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), index=True)

    # Eski customer ilişkisi korunur (geriye uyumluluk)
    customer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("customers.id"))
    user_identifier: Mapped[Optional[str]] = mapped_column(String(255))  # IP veya cihaz ID gibi

    channel: Mapped[str] = mapped_column(String(50), server_default="web")
    status: Mapped[str] = mapped_column(String(50), server_default="active")

    # Sohbet başlığı ve özet bilgileri
    title: Mapped[Optional[str]] = mapped_column(String(255))
    last_message_preview: Mapped[Optional[str]] = mapped_column(String(500))
    message_count: Mapped[int] = mapped_column(Integer, server_default="0")

    last_message_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Soft delete
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), index=True)

    # İlişkiler
    customer: Mapped[Optional["Customer"]] = relationship(back_populates="conversations")
    user: Mapped[Optional["User"]] = relationship(back_populates="conversations")
    messages: Mapped[list["ConversationMessage"]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ConversationMessage.created_at.asc()",
    )
