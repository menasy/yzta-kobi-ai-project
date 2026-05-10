# models/user.py
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

if TYPE_CHECKING:
    from .audit_log import AuditLog
    from .notification import Notification
    from .inventory_movement import InventoryMovement
    from .order_status_history import OrderStatusHistory

class User(Base, IDMixin, TimestampMixin):
    """Sisteme giriş yapan admin/operatör kullanıcılar."""
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), server_default="admin")
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # İlişkiler
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")
    inventory_movements: Mapped[list["InventoryMovement"]] = relationship(back_populates="created_by_user")
    order_status_history: Mapped[list["OrderStatusHistory"]] = relationship(back_populates="changed_by_user")
