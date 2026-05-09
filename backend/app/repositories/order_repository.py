# repositories/order_repository.py
# Order tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.order import Order

from .base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    """Order tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Order, session)

    async def get_with_items(self, order_id: int) -> Order | None:
        """Sipariş kalemlerini eager-load ederek siparişi getirir."""
        result = await self.session.execute(
            select(Order)
            .where(Order.id == order_id)
            .options(
                joinedload(Order.order_items),
                joinedload(Order.customer),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_order_number(self, order_number: str) -> Order | None:
        """Sipariş numarasına göre sipariş getirir."""
        result = await self.session.execute(
            select(Order).where(Order.order_number == order_number)
        )
        return result.scalar_one_or_none()

    async def get_by_status(
        self,
        status: str,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Order]:
        """Duruma göre siparişleri listeler."""
        result = await self.session.execute(
            select(Order)
            .where(Order.status == status)
            .offset(skip)
            .limit(limit)
            .order_by(Order.id.desc())
        )
        return list(result.scalars().all())

    async def get_by_customer(
        self,
        customer_id: int,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Order]:
        """Müşteriye ait siparişleri listeler."""
        result = await self.session.execute(
            select(Order)
            .where(Order.customer_id == customer_id)
            .offset(skip)
            .limit(limit)
            .order_by(Order.id.desc())
        )
        return list(result.scalars().all())

    async def get_today_orders(self) -> list[Order]:
        """Bugünün siparişlerini getirir."""
        today_start = datetime.now(tz=timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0,
        )
        result = await self.session.execute(
            select(Order)
            .where(Order.placed_at >= today_start)
            .order_by(Order.id.desc())
        )
        return list(result.scalars().all())

    async def count_by_status(self, status: str) -> int:
        """Belirli durumdaki sipariş sayısını döndürür."""
        result = await self.session.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.status == status)
        )
        return result.scalar_one()

    async def get_today_revenue(self) -> float:
        """Bugünün toplam gelirini hesaplar."""
        today_start = datetime.now(tz=timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0,
        )
        result = await self.session.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0))
            .where(
                Order.placed_at >= today_start,
                Order.status != "cancelled",
            )
        )
        return float(result.scalar_one())
