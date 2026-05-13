# models/conversation.py
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

if TYPE_CHECKING:
    from .customer import Customer

class Conversation(Base, IDMixin, TimestampMixin):
    """AI agent konuşma oturum metadata tablosu."""
    __tablename__ = "conversations"

    # Redis'teki mesajları eşleştirmek için unique session_id
    session_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    
    customer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("customers.id"))
    user_identifier: Mapped[Optional[str]] = mapped_column(String(255)) # IP veya cihaz ID gibi
    
    channel: Mapped[str] = mapped_column(String(50), server_default="web")
    status: Mapped[str] = mapped_column(String(50), server_default="active")
    
    last_message_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # İlişkiler
    customer: Mapped[Optional["Customer"]] = relationship(back_populates="conversations")
