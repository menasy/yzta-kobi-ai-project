# services/product_service.py
# Ürün CRUD iş mantığı servisi.
# Repository katmanı üzerinden ürün işlemlerini yönetir.

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate


class ProductService:
    """Ürün yönetimi iş mantığı servisi."""

    def __init__(self, db: AsyncSession) -> None:
        self._product_repo = ProductRepository(db)

    async def get_all_products(self) -> list[ProductResponse]:
        """Tüm ürünleri döndürür."""
        products = await self._product_repo.get_all()
        return [ProductResponse.model_validate(product) for product in products]

    async def get_product_by_id(self, product_id: int) -> ProductResponse:
        """ID ile tek ürün getirir, yoksa NotFoundError fırlatır."""
        product = await self._product_repo.get(product_id)
        if product is None:
            raise NotFoundError(message=f"{product_id} numaralı ürün bulunamadı.")
        return ProductResponse.model_validate(product)

    async def create_product(self, product_data: ProductCreate) -> ProductResponse:
        """Yeni ürün oluşturur."""
        product = await self._product_repo.create(product_data.model_dump())
        return ProductResponse.model_validate(product)

    async def get_low_stock_products(self) -> list[ProductResponse]:
        """Kritik stok seviyesindeki ürünleri döndürür."""
        products = await self._product_repo.get_low_stock_products()
        return [ProductResponse.model_validate(product) for product in products]

    async def update_product(self, product_id: int, update_data: ProductUpdate) -> ProductResponse:
        """Ürünü günceller, yoksa NotFoundError fırlatır."""
        product = await self._product_repo.update(
            product_id,
            update_data.model_dump(exclude_unset=True),
        )
        if product is None:
            raise NotFoundError(message=f"{product_id} numaralı ürün bulunamadı.")
        return ProductResponse.model_validate(product)

    async def delete_product(self, product_id: int) -> None:
        """Ürünü siler, yoksa NotFoundError fırlatır."""
        deleted = await self._product_repo.delete(product_id)
        if not deleted:
            raise NotFoundError(message=f"{product_id} numaralı ürün bulunamadı.")
