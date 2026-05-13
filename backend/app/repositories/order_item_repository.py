# repositories/order_item_repository.py
# OrderItem tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.models.order_item import OrderItem

from .base import BaseRepository


class OrderItemRepository(BaseRepository[OrderItem]):
    """OrderItem tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(OrderItem, session)

    async def get_by_order(self, order_id: int) -> list[OrderItem]:
        """Sipariş ID'sine göre kalemleri getirir."""
        result = await self.session.execute(
            select(OrderItem)
            .where(OrderItem.order_id == order_id)
            .order_by(OrderItem.id)
        )
        return list(result.scalars().all())

    async def get_by_product(
        self,
        product_id: int,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[OrderItem]:
        """Ürün ID'sine göre sipariş kalemlerini getirir."""
        result = await self.session.execute(
            select(OrderItem)
            .where(OrderItem.product_id == product_id)
            .offset(skip)
            .limit(limit)
            .order_by(OrderItem.id.desc())
        )
        return list(result.scalars().all())

    async def get_sales_rows_by_product_id(self, product_id: int) -> list[tuple[int, int, datetime]]:
        """Tahminleme için ürün bazlı satış satırlarını getirir."""
        result = await self.session.execute(
            select(
                OrderItem.product_id,
                OrderItem.quantity,
                Order.placed_at,
            )
            .join(Order, OrderItem.order_id == Order.id)
            .where(OrderItem.product_id == product_id)
            .order_by(Order.placed_at.asc())
        )
        return [(product_id, quantity, placed_at) for product_id, quantity, placed_at in result.all()]
