# services/product_service.py
# Ürün CRUD iş mantığı servisi.
# Repository katmanı üzerinden ürün işlemlerini yönetir.

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    """Ürün yönetimi iş mantığı servisi."""

    def __init__(self, db: AsyncSession) -> None:
        self._product_repo = ProductRepository(db)

    async def get_all_products(self) -> list[Product]:
        """Tüm ürünleri döndürür."""
        return await self._product_repo.get_all()

    async def create_product(self, product_data: ProductCreate) -> Product:
        """Yeni ürün oluşturur."""
        return await self._product_repo.create(product_data.model_dump())

    async def get_low_stock_products(self) -> list[Product]:
        """Kritik stok seviyesindeki ürünleri döndürür."""
        return await self._product_repo.get_low_stock_products()

    async def update_product(self, product_id: int, update_data: ProductUpdate) -> Product:
        """Ürünü günceller, yoksa NotFoundError fırlatır."""
        product = await self._product_repo.update(
            product_id,
            update_data.model_dump(exclude_unset=True),
        )
        if product is None:
            raise NotFoundError(message=f"{product_id} numaralı ürün bulunamadı.")
        return product

    async def delete_product(self, product_id: int) -> None:
        """Ürünü siler, yoksa NotFoundError fırlatır."""
        deleted = await self._product_repo.delete(product_id)
        if not deleted:
            raise NotFoundError(message=f"{product_id} numaralı ürün bulunamadı.")
