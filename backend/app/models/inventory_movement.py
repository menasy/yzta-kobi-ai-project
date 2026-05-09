# models/inventory_movement.py
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

if TYPE_CHECKING:
    from .product import Product
    from .order import Order
    from .user import User

class InventoryMovement(Base, IDMixin, TimestampMixin):
    """Stok hareket geçmişi (giriş, çıkış, rezervasyon vb.)."""
    __tablename__ = "inventory_movements"

    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    order_id: Mapped[Optional[int]] = mapped_column(ForeignKey("orders.id"))
    
    # stock_in, stock_out, order_reserved, order_deducted, order_cancelled, adjustment
    movement_type: Mapped[str] = mapped_column(String(50), nullable=False)
    
    quantity_change: Mapped[int] = mapped_column(Integer, nullable=False)
    previous_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    new_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(String(255))
    created_by_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))

    # İlişkiler
    product: Mapped["Product"] = relationship(back_populates="inventory_movements")
    order: Mapped[Optional["Order"]] = relationship(back_populates="inventory_movements")
    created_by_user: Mapped[Optional["User"]] = relationship(back_populates="inventory_movements")
