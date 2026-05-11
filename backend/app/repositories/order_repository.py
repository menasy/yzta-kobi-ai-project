# repositories/order_repository.py
# Order tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.order import Order
from app.models.order_item import OrderItem

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
        return result.unique().scalar_one_or_none()

    async def create_order_with_items(
        self,
        order_data: dict[str, Any],
        items_data: list[dict[str, Any]],
    ) -> Order:
        """Order ve OrderItem kayıtlarını aynı session içinde oluşturur."""
        order = Order(**order_data)
        self.session.add(order)
        await self.session.flush()

        for item_data in items_data:
            self.session.add(OrderItem(order_id=order.id, **item_data))

        await self.session.flush()
        await self.session.refresh(order)
        return order

    async def get_by_order_number(self, order_number: str) -> Order | None:
        """Sipariş numarasına göre sipariş getirir."""
        result = await self.session.execute(select(Order).where(Order.order_number == order_number))
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
            select(Order).where(Order.status == status).offset(skip).limit(limit).order_by(Order.id.desc())
        )
        return list(result.scalars().all())

    async def get_customer_orders(
        self,
        customer_id: int,
        *,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
    ) -> list[Order]:
        """Müşteriye ait siparişleri listeler."""
        stmt = (
            select(Order)
            .where(Order.customer_id == customer_id)
            .options(joinedload(Order.order_items))
            .offset(skip)
            .limit(limit)
            .order_by(Order.id.desc())
        )
        if status is not None:
            stmt = stmt.where(Order.status == status)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_by_customer(
        self,
        customer_id: int,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Order]:
        """Eski agent sorguları için müşteri siparişlerini listeler."""
        return await self.get_customer_orders(
            customer_id=customer_id,
            skip=skip,
            limit=limit,
        )

    async def get_customer_order_by_id(self, customer_id: int, order_id: int) -> Order | None:
        """Customer scope içinde tek siparişi kalemleriyle getirir."""
        result = await self.session.execute(
            select(Order)
            .where(Order.id == order_id, Order.customer_id == customer_id)
            .options(
                joinedload(Order.order_items),
                joinedload(Order.customer),
            )
        )
        return result.unique().scalar_one_or_none()

    async def get_admin_orders(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
    ) -> list[Order]:
        """Admin için tüm siparişleri listeler."""
        stmt = (
            select(Order)
            .options(
                joinedload(Order.order_items),
                joinedload(Order.customer),
            )
            .offset(skip)
            .limit(limit)
            .order_by(Order.id.desc())
        )
        if status is not None:
            stmt = stmt.where(Order.status == status)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_admin_order_by_id(self, order_id: int) -> Order | None:
        """Admin için tek siparişi kalemleri ve kullanıcıyla getirir."""
        return await self.get_with_items(order_id)

    async def update_order_status(self, order_id: int, status: str) -> Order | None:
        """Sipariş status alanını günceller."""
        order = await self.get(order_id)
        if order is None:
            return None
        order.status = status
        if status == "cancelled":
            order.cancelled_at = datetime.now(tz=UTC)
        elif order.cancelled_at is not None:
            order.cancelled_at = None
        await self.session.flush()
        await self.session.refresh(order)
        return order

    async def count_customer_orders(self, customer_id: int, *, status: str | None = None) -> int:
        """Customer scope içindeki sipariş sayısını döndürür."""
        stmt = select(func.count()).select_from(Order).where(Order.customer_id == customer_id)
        if status is not None:
            stmt = stmt.where(Order.status == status)
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def count_admin_orders(self, *, status: str | None = None) -> int:
        """Admin listeleme için toplam sipariş sayısını döndürür."""
        stmt = select(func.count()).select_from(Order)
        if status is not None:
            stmt = stmt.where(Order.status == status)
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def get_today_orders(self) -> list[Order]:
        """Bugünün siparişlerini getirir."""
        today_start = datetime.now(tz=UTC).replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )
        result = await self.session.execute(
            select(Order).where(Order.placed_at >= today_start).order_by(Order.id.desc())
        )
        return list(result.scalars().all())

    async def count_by_status(self, status: str) -> int:
        """Belirli durumdaki sipariş sayısını döndürür."""
        result = await self.session.execute(select(func.count()).select_from(Order).where(Order.status == status))
        return result.scalar_one()

    async def get_today_revenue(self) -> float:
        """Bugünün toplam gelirini hesaplar."""
        today_start = datetime.now(tz=UTC).replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )
        result = await self.session.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0)).where(
                Order.placed_at >= today_start,
                Order.status != "cancelled",
            )
        )
        return float(result.scalar_one())
