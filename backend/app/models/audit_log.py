# models/audit_log.py
from typing import TYPE_CHECKING, Optional, Any

from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

if TYPE_CHECKING:
    from .user import User

class AuditLog(Base, IDMixin, TimestampMixin):
    """Kritik sistem olayları ve admin işlem geçmişi."""
    __tablename__ = "audit_logs"

    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False) # user, product, order vb.
    entity_id: Mapped[Optional[str]] = mapped_column(String(100))
    
    old_values: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON)
    new_values: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON)
    
    ip_address: Mapped[Optional[str]] = mapped_column(String(50))
    user_agent: Mapped[Optional[str]] = mapped_column(String(500))
    request_id: Mapped[Optional[str]] = mapped_column(String(100))

    # İlişkiler
    user: Mapped[Optional["User"]] = relationship(back_populates="audit_logs")
