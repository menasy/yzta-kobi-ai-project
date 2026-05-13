# repositories/shipment_repository.py
# Shipment tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from datetime import datetime

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.shipment import Shipment

from .base import BaseRepository


class ShipmentRepository(BaseRepository[Shipment]):
    """Shipment tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Shipment, session)

    async def get_by_order(self, order_id: int) -> Shipment | None:
        """Sipariş ID'sine göre kargo kaydını getirir."""
        result = await self.session.execute(
            select(Shipment).where(Shipment.order_id == order_id)
        )
        return result.scalar_one_or_none()

    async def get_by_tracking(self, tracking_number: str) -> Shipment | None:
        """Takip numarasına göre kargo kaydını getirir."""
        result = await self.session.execute(
            select(Shipment).where(func.upper(Shipment.tracking_number) == tracking_number.upper())
        )
        return result.scalar_one_or_none()

    async def get_by_tracking_with_events(self, tracking_number: str) -> Shipment | None:
        """Public takip sorgusu için takip numarasına göre kargo ve olayları getirir."""
        result = await self.session.execute(
            select(Shipment)
            .where(func.upper(Shipment.tracking_number) == tracking_number.upper())
            .options(joinedload(Shipment.events), joinedload(Shipment.order))
        )
        return result.unique().scalar_one_or_none()

    async def get_with_events(self, shipment_id: int) -> Shipment | None:
        """Kargo olaylarıyla birlikte detay getirir."""
        result = await self.session.execute(
            select(Shipment)
            .where(Shipment.id == shipment_id)
            .options(joinedload(Shipment.events))
        )
        return result.unique().scalar_one_or_none()

    async def list_shipments(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
        carrier: str | None = None,
    ) -> list[Shipment]:
        """Filtrelenmiş kargo listesini getirir."""
        stmt = select(Shipment).options(joinedload(Shipment.events)).order_by(Shipment.id.desc())
        if status is not None:
            stmt = stmt.where(Shipment.status == status)
        if carrier is not None:
            stmt = stmt.where(func.lower(Shipment.carrier) == carrier.lower())
        stmt = stmt.offset(skip).limit(limit)

        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_delayed(
        self,
        *,
        now: datetime,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Shipment]:
        """Geciken kargo kayıtlarını listeler."""
        result = await self.session.execute(
            select(Shipment)
            .options(joinedload(Shipment.events))
            .where(
                or_(
                    Shipment.status == "delayed",
                    (
                        Shipment.estimated_delivery_date < now
                    )
                    & Shipment.status.notin_(["delivered", "cancelled", "failed"]),
                )
            )
            .order_by(Shipment.id.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().unique().all())

    async def get_active_shipments(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Shipment]:
        """Teslim edilmemiş kargo kayıtlarını listeler."""
        result = await self.session.execute(
            select(Shipment)
            .where(Shipment.status.notin_(["delivered", "cancelled"]))
            .offset(skip)
            .limit(limit)
            .order_by(Shipment.id.desc())
        )
        return list(result.scalars().all())
