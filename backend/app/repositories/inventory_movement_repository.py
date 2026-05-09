# repositories/inventory_movement_repository.py
# InventoryMovement tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory_movement import InventoryMovement

from .base import BaseRepository


class InventoryMovementRepository(BaseRepository[InventoryMovement]):
    """InventoryMovement tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(InventoryMovement, session)

    async def get_by_product(
        self,
        product_id: int,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[InventoryMovement]:
        """Ürün ID'sine göre stok hareketlerini getirir."""
        result = await self.session.execute(
            select(InventoryMovement)
            .where(InventoryMovement.product_id == product_id)
            .offset(skip)
            .limit(limit)
            .order_by(InventoryMovement.id.desc())
        )
        return list(result.scalars().all())

    async def get_by_order(self, order_id: int) -> list[InventoryMovement]:
        """Sipariş ID'sine göre stok hareketlerini getirir."""
        result = await self.session.execute(
            select(InventoryMovement)
            .where(InventoryMovement.order_id == order_id)
            .order_by(InventoryMovement.id.desc())
        )
        return list(result.scalars().all())

    async def get_by_type(
        self,
        movement_type: str,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[InventoryMovement]:
        """Hareket tipine göre kayıtları getirir."""
        result = await self.session.execute(
            select(InventoryMovement)
            .where(InventoryMovement.movement_type == movement_type)
            .offset(skip)
            .limit(limit)
            .order_by(InventoryMovement.id.desc())
        )
        return list(result.scalars().all())
