# repositories/order_item_repository.py
# OrderItem tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

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
