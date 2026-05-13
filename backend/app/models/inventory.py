# models/inventory.py
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import IDMixin

if TYPE_CHECKING:
    from .product import Product

class Inventory(Base, IDMixin):
    """Ürünlerin anlık stok bilgisi."""
    __tablename__ = "inventory"

    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), unique=True, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, server_default="0")
    reserved_quantity: Mapped[int] = mapped_column(Integer, server_default="0")
    low_stock_threshold: Mapped[int] = mapped_column(Integer, server_default="10")
    
    # Sadece bu model için özel last_updated_at (manual set için)
    last_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # İlişkiler
    product: Mapped["Product"] = relationship(back_populates="inventory")

    @property
    def available_quantity(self) -> int:
        """Kullanılabilir net stok miktarı."""
        return self.quantity - self.reserved_quantity
