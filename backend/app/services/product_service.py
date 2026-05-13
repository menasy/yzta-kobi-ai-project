# services/product_service.py
# Ürün CRUD iş mantığı servisi.
# Repository katmanı üzerinden ürün işlemlerini yönetir.

from decimal import Decimal, ROUND_HALF_UP
from typing import Any

from sqlalchemy.exc import NoSuchTableError, OperationalError, ProgrammingError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, ConflictError, DatabaseNotReadyError, NotFoundError
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate

MAX_BULK_PRICE_UPDATE_ITEMS = 10
MAX_PRICE_CHANGE_PERCENT = Decimal("30")
PRICE_QUANT = Decimal("0.01")


class ProductService:
    """Ürün yönetimi iş mantığı servisi."""

    def __init__(self, db: AsyncSession) -> None:
        self._product_repo = ProductRepository(db)

    @staticmethod
    def _is_missing_table_error(error: Exception) -> bool:
        message = str(error).lower()
        return (
            "does not exist" in message
            or "undefined table" in message
            or "no such table" in message
        )

    async def get_all_products(self) -> list[ProductResponse]:
        """Tüm ürünleri döndürür."""
        try:
            products = await self._product_repo.get_all()
        except (NoSuchTableError, ProgrammingError, OperationalError) as exc:
            if self._is_missing_table_error(exc):
                raise DatabaseNotReadyError() from exc
            raise
        return [ProductResponse.model_validate(product) for product in products]

    async def get_product_by_id(self, product_id: int) -> ProductResponse:
        """ID ile tek ürün getirir, yoksa NotFoundError fırlatır."""
        try:
            product = await self._product_repo.get(product_id)
        except (NoSuchTableError, ProgrammingError, OperationalError) as exc:
            if self._is_missing_table_error(exc):
                raise DatabaseNotReadyError() from exc
            raise
        if product is None:
            raise NotFoundError(message=f"{product_id} numaralı ürün bulunamadı.")
        return ProductResponse.model_validate(product)

    async def get_products_by_ids(self, product_ids: list[int]) -> list[ProductResponse]:
        """ID listesine göre ürünleri getirir ve eksik kayıtları doğrular."""
        unique_ids = sorted(set(product_ids))
        if not unique_ids:
            return []
        products = await self._product_repo.get_by_ids(unique_ids)
        product_map = {product.id: product for product in products}
        missing_ids = [product_id for product_id in unique_ids if product_id not in product_map]
        if missing_ids:
            raise NotFoundError(message=f"Ürün bulunamadı: {', '.join(map(str, missing_ids))}.")
        return [ProductResponse.model_validate(product_map[product_id]) for product_id in unique_ids]

    async def create_product(self, product_data: ProductCreate) -> ProductResponse:
        """Yeni ürün oluşturur."""
        product = await self._product_repo.create(product_data.model_dump())
        return ProductResponse.model_validate(product)

    async def get_low_stock_products(self) -> list[ProductResponse]:
        """Kritik stok seviyesindeki ürünleri döndürür."""
        try:
            products = await self._product_repo.get_low_stock_products()
        except (NoSuchTableError, ProgrammingError, OperationalError) as exc:
            if self._is_missing_table_error(exc):
                raise DatabaseNotReadyError() from exc
            raise
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

    async def bulk_update_prices(
        self,
        updates: list[dict[str, Any]],
    ) -> list[ProductResponse]:
        """
        Birden fazla ürünün fiyatını drift kontrolüyle günceller.

        Beklenen input:
            {"product_id": int, "expected_old_price": Decimal, "new_price": Decimal}
        """
        if not updates:
            raise BadRequestError(message="Güncellenecek ürün belirtilmedi.")
        if len(updates) > MAX_BULK_PRICE_UPDATE_ITEMS:
            raise BadRequestError(
                message=f"Tek seferde en fazla {MAX_BULK_PRICE_UPDATE_ITEMS} ürün fiyatı güncellenebilir."
            )

        product_ids = [int(item["product_id"]) for item in updates]
        if len(set(product_ids)) != len(product_ids):
            raise BadRequestError(message="Aynı ürün tek aksiyonda birden fazla kez güncellenemez.")

        products = await self._product_repo.get_by_ids_for_update(sorted(product_ids))
        product_map = {product.id: product for product in products}
        missing_ids = [product_id for product_id in product_ids if product_id not in product_map]
        if missing_ids:
            raise NotFoundError(message=f"Ürün bulunamadı: {', '.join(map(str, missing_ids))}.")

        updated_products = []
        for item in updates:
            product_id = int(item["product_id"])
            product = product_map[product_id]
            if not product.is_active:
                raise BadRequestError(message=f"{product.name} ürünü aktif olmadığı için fiyatı güncellenemez.")

            expected_old_price = self._normalize_price(item["expected_old_price"])
            new_price = self._normalize_price(item["new_price"])
            current_price = self._normalize_price(product.price)

            if current_price != expected_old_price:
                raise ConflictError(
                    message=(
                        f"{product.name} fiyatı bekleyen aksiyon oluşturulduktan sonra değişmiş. "
                        "Lütfen yeni fiyat önizlemesi oluşturup tekrar onaylayın."
                    )
                )

            self._validate_price_change(
                product_name=product.name,
                old_price=current_price,
                new_price=new_price,
            )
            product.price = new_price
            updated_products.append(product)

        await self._product_repo.session.flush()
        for product in updated_products:
            await self._product_repo.session.refresh(product)
        return [ProductResponse.model_validate(product) for product in updated_products]

    async def delete_product(self, product_id: int) -> None:
        """Ürünü siler, yoksa NotFoundError fırlatır."""
        deleted = await self._product_repo.delete(product_id)
        if not deleted:
            raise NotFoundError(message=f"{product_id} numaralı ürün bulunamadı.")

    @staticmethod
    def _normalize_price(value: Any) -> Decimal:
        price = Decimal(str(value)).quantize(PRICE_QUANT, rounding=ROUND_HALF_UP)
        if price <= 0:
            raise BadRequestError(message="Ürün fiyatı sıfır veya negatif olamaz.")
        return price

    @staticmethod
    def _validate_price_change(
        *,
        product_name: str,
        old_price: Decimal,
        new_price: Decimal,
    ) -> None:
        if old_price <= 0:
            raise BadRequestError(message=f"{product_name} için mevcut fiyat geçersiz.")
        change_percent = ((new_price - old_price) / old_price * Decimal("100")).copy_abs()
        if change_percent > MAX_PRICE_CHANGE_PERCENT:
            raise BadRequestError(
                message=(
                    f"{product_name} için fiyat değişimi %{MAX_PRICE_CHANGE_PERCENT} sınırını aşıyor."
                )
            )
