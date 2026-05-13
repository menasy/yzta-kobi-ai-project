# repositories/order_status_history_repository.py
# OrderStatusHistory tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order_status_history import OrderStatusHistory

from .base import BaseRepository


class OrderStatusHistoryRepository(BaseRepository[OrderStatusHistory]):
    """OrderStatusHistory tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(OrderStatusHistory, session)

    async def get_by_order(self, order_id: int) -> list[OrderStatusHistory]:
        """Sipariş ID'sine göre durum geçmişini getirir (kronolojik)."""
        result = await self.session.execute(
            select(OrderStatusHistory)
            .where(OrderStatusHistory.order_id == order_id)
            .order_by(OrderStatusHistory.id.asc())
        )
        return list(result.scalars().all())

    async def get_latest_by_order(self, order_id: int) -> OrderStatusHistory | None:
        """Siparişin en son durum değişikliğini getirir."""
        result = await self.session.execute(
            select(OrderStatusHistory)
            .where(OrderStatusHistory.order_id == order_id)
            .order_by(OrderStatusHistory.id.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
