# models/user_address.py
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

from .base_model import IDMixin, TimestampMixin

if TYPE_CHECKING:
    from .user import User


class UserAddress(Base, IDMixin, TimestampMixin):
    """Kullanıcının varsayılan teslimat adresi."""

    __tablename__ = "user_addresses"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    address: Mapped[str] = mapped_column(String(1000), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str | None] = mapped_column(String(20))
    country: Mapped[str] = mapped_column(String(100), server_default="Türkiye", nullable=False)
    note: Mapped[str | None] = mapped_column(String(1000))
    is_default: Mapped[bool] = mapped_column(Boolean, server_default="true", nullable=False)

    user: Mapped["User"] = relationship(back_populates="addresses")
