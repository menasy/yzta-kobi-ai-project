# repositories/inventory_repository.py
# Inventory tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.inventory import Inventory

from .base import BaseRepository


class InventoryRepository(BaseRepository[Inventory]):
    """Inventory tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Inventory, session)

    async def get_by_product_id(self, product_id: int) -> Inventory | None:
        """Ürün ID'sine göre stok kaydı getirir."""
        result = await self.session.execute(
            select(Inventory).where(Inventory.product_id == product_id)
        )
        return result.scalar_one_or_none()

    async def get_low_stock_items(self) -> list[Inventory]:
        """Kritik stok seviyesinin altındaki kayıtları getirir."""
        result = await self.session.execute(
            select(Inventory)
            .where(Inventory.quantity <= Inventory.low_stock_threshold)
            .options(joinedload(Inventory.product))
            .order_by(Inventory.quantity.asc())
        )
        return list(result.scalars().unique().all())

    async def get_all_with_product(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Inventory]:
        """Tüm stok kayıtlarını ürün bilgisiyle birlikte getirir."""
        result = await self.session.execute(
            select(Inventory)
            .options(joinedload(Inventory.product))
            .offset(skip)
            .limit(limit)
            .order_by(Inventory.product_id)
        )
        return list(result.scalars().unique().all())
