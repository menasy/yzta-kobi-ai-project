# models/order_status_history.py
from typing import TYPE_CHECKING, Optional

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

if TYPE_CHECKING:
    from .order import Order
    from .user import User

class OrderStatusHistory(Base, IDMixin, TimestampMixin):
    """Sipariş durum değişim geçmişi."""
    __tablename__ = "order_status_history"

    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    old_status: Mapped[Optional[str]] = mapped_column(String(50))
    new_status: Mapped[str] = mapped_column(String(50), nullable=False)
    changed_by_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    reason: Mapped[Optional[str]] = mapped_column(String(255))

    # İlişkiler
    order: Mapped["Order"] = relationship(back_populates="status_history")
    changed_by_user: Mapped[Optional["User"]] = relationship(back_populates="order_status_history")
