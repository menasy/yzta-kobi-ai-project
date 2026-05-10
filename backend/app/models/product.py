# models/product.py
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import String, Boolean, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .base_model import TimestampMixin, IDMixin

from app.models.inventory import Inventory

if TYPE_CHECKING:
    from .inventory import Inventory
    from .order_item import OrderItem
    from .inventory_movement import InventoryMovement
    from .notification import Notification

class Product(Base, IDMixin, TimestampMixin):
    """Satılan ürün tanımları."""
    __tablename__ = "products"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(1000))
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")

    # İlişkiler
    inventory: Mapped["Inventory"] = relationship(back_populates="product", uselist=False, cascade="all, delete-orphan")
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="product")
    inventory_movements: Mapped[list["InventoryMovement"]] = relationship(back_populates="product")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="product")


