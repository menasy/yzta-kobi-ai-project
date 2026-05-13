# models/conversation_message.py
# Kalıcı sohbet mesajları tablosu.
# Her mesaj bir conversation'a ve user'a bağlıdır.
# Redis kısa süreli LLM context memory'si için kullanılırken,
# bu tablo tüm sohbet geçmişini kalıcı olarak tutar.
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import IDMixin

# TimestampMixin yerine sadece created_at kullanıyoruz (mesajlar immutable)
from datetime import datetime
from sqlalchemy import DateTime, func


if TYPE_CHECKING:
    from .conversation import Conversation
    from .user import User


class ConversationMessage(Base, IDMixin):
    """Kalıcı sohbet mesajı. Conversation'a bağlı, kronolojik sıralı."""
    __tablename__ = "conversation_messages"

    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user, assistant, system, tool
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )

    # İlişkiler
    conversation: Mapped["Conversation"] = relationship(back_populates="messages")
    user: Mapped["User"] = relationship(back_populates="conversation_messages")
