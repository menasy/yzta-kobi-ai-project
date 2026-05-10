# repositories/shipment_event_repository.py
# ShipmentEvent tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.shipment_event import ShipmentEvent

from .base import BaseRepository


class ShipmentEventRepository(BaseRepository[ShipmentEvent]):
    """ShipmentEvent tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(ShipmentEvent, session)

    async def get_by_shipment(
        self,
        shipment_id: int,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[ShipmentEvent]:
        """Kargo ID'sine göre olayları kronolojik sırada getirir."""
        result = await self.session.execute(
            select(ShipmentEvent)
            .where(ShipmentEvent.shipment_id == shipment_id)
            .offset(skip)
            .limit(limit)
            .order_by(ShipmentEvent.id.asc())
        )
        return list(result.scalars().all())

    async def get_latest_by_shipment(self, shipment_id: int) -> ShipmentEvent | None:
        """Kargonun en son olayını getirir."""
        result = await self.session.execute(
            select(ShipmentEvent)
            .where(ShipmentEvent.shipment_id == shipment_id)
            .order_by(ShipmentEvent.id.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
