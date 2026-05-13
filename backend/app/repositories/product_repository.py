# repositories/product_repository.py
# Product tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import Inventory
from app.models.product import Product

from .base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    """Product tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Product, session)

    async def get_by_sku(self, sku: str) -> Product | None:
        """SKU koduna göre ürün getirir."""
        result = await self.session.execute(
            select(Product).where(Product.sku == sku)
        )
        return result.scalar_one_or_none()

    async def search(
        self,
        query: str,
        *,
        skip: int = 0,
        limit: int = 20,
    ) -> list[Product]:
        """İsim veya SKU üzerinden arama yapar (case-insensitive)."""
        pattern = f"%{query}%"
        result = await self.session.execute(
            select(Product)
            .where(
                or_(
                    Product.name.ilike(pattern),
                    Product.sku.ilike(pattern),
                )
            )
            .offset(skip)
            .limit(limit)
            .order_by(Product.name)
        )
        return list(result.scalars().all())

    async def get_active_products(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Product]:
        """Aktif ürünleri sayfalı listeler."""
        result = await self.session.execute(
            select(Product)
            .where(Product.is_active.is_(True))
            .offset(skip)
            .limit(limit)
            .order_by(Product.id.desc())
        )
        return list(result.scalars().all())

    async def get_all_active_products(self) -> list[Product]:
        """Analiz/dashboards için tüm aktif ürünleri getirir."""
        result = await self.session.execute(
            select(Product)
            .where(Product.is_active.is_(True))
            .order_by(Product.id.asc())
        )
        return list(result.scalars().all())

    async def count_active(self) -> int:
        """Aktif ürün sayısını döndürür."""
        result = await self.session.execute(
            select(func.count())
            .select_from(Product)
            .where(Product.is_active.is_(True))
        )
        return result.scalar_one()

    async def get_by_category(
        self,
        category: str,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Product]:
        """Kategoriye göre ürünleri getirir."""
        result = await self.session.execute(
            select(Product)
            .where(
                Product.category == category,
                Product.is_active.is_(True),
            )
            .offset(skip)
            .limit(limit)
            .order_by(Product.name)
        )
        return list(result.scalars().all())

    async def sku_exists(self, sku: str, *, exclude_id: int | None = None) -> bool:
        """SKU zaten kullanılıyor mu kontrol eder."""
        stmt = select(func.count()).select_from(Product).where(Product.sku == sku)
        if exclude_id is not None:
            stmt = stmt.where(Product.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one() > 0

    async def get_low_stock_products(self) -> list[Product]:
        """Stoku kritik eşik değerinin altında olan ürünleri getirir."""
        result = await self.session.execute(
            select(Product)
            .join(Inventory, Inventory.product_id == Product.id)
            .where(Inventory.quantity <= Inventory.low_stock_threshold)
            .order_by(Product.id.desc())
        )
        return list(result.scalars().all())
