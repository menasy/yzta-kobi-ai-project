# services/inventory_service.py
# Stok güncelleme iş mantığı ve threshold trigger.
# Stok değiştiren tüm akışlar bu servis üzerinden yürütülür.
# Threshold kontrolü ve notification oluşturma bu katmanda yapılır.
# Repository'ye doğrudan erişim yerine InventoryRepository kullanılır.

from collections.abc import Mapping

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import InsufficientStockError, NotFoundError
from app.core.logger import get_logger
from app.models.inventory import Inventory
from app.models.product import Product
from app.repositories.inventory_movement_repository import InventoryMovementRepository
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.product_repository import ProductRepository
from app.services.notification_service import NotificationService

logger = get_logger(__name__)


class InventoryService:
    """Stok yönetimi iş mantığı servisi."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._inventory_repo = InventoryRepository(db)
        self._movement_repo = InventoryMovementRepository(db)
        self._product_repo = ProductRepository(db)
        self._notification_service = NotificationService(db)

    async def get_by_product_id(self, product_id: int) -> Inventory:
        """
        Ürün ID'sine göre stok kaydı getirir.
        Bulunamazsa NotFoundError fırlatır.
        """
        inventory = await self._inventory_repo.get_by_product_id(product_id)
        if inventory is None:
            raise NotFoundError(message=f"Ürün #{product_id} için stok kaydı bulunamadı.")
        return inventory

    async def update_stock(
        self,
        product_id: int,
        *,
        quantity: int | None = None,
        low_stock_threshold: int | None = None,
    ) -> Inventory:
        """
        Stok miktarı ve/veya eşik değerini günceller.

        Akış:
            1. Mevcut inventory kaydını bul (yoksa NotFoundError).
            2. Gelen alanları güncelle.
            3. Flush ile DB'ye yansıt.
            4. Threshold kontrolü yap — gerekirse notification oluştur.
            5. Güncel inventory'yi döndür.
        """
        inventory = await self._inventory_repo.get_by_product_id_for_update(product_id)
        if inventory is None:
            raise NotFoundError(message=f"Ürün #{product_id} için stok kaydı bulunamadı.")

        if quantity is not None:
            inventory.quantity = quantity
        if low_stock_threshold is not None:
            inventory.low_stock_threshold = low_stock_threshold

        await self._db.flush()
        await self._db.refresh(inventory)

        # Threshold kontrolü — stok değişikliği sonrası
        await self._check_low_stock_threshold(inventory)

        return inventory

    async def validate_and_deduct_stock_for_order(
        self,
        *,
        order_id: int,
        items: Mapping[int, int],
        created_by_user_id: int | None = None,
    ) -> dict[int, Product]:
        """
        Sipariş için stokları güvenli şekilde kontrol eder ve düşer.

        Inventory satırları product_id sırasıyla SELECT FOR UPDATE ile kilitlenir.
        Stok yetersizliği veya ürün problemi olduğunda exception fırlatılır; request
        transaction'ı üst katmanda rollback olur.
        """
        products: dict[int, Product] = {}

        for product_id in sorted(items):
            quantity = items[product_id]
            inventory = await self._inventory_repo.get_by_product_id_for_update(product_id)
            if inventory is None:
                raise NotFoundError(message=f"Ürün #{product_id} için stok kaydı bulunamadı.")

            product = await self._product_repo.get(product_id)
            if product is None or not product.is_active:
                raise NotFoundError(message=f"{product_id} numaralı ürün bulunamadı.")

            if inventory.available_quantity < quantity:
                raise InsufficientStockError(
                    message=(
                        f"{product.name} için yeterli stok yok. "
                        f"Talep: {quantity}, mevcut: {inventory.available_quantity}."
                    )
                )

            previous_quantity = inventory.quantity
            inventory.quantity -= quantity

            await self._movement_repo.create(
                {
                    "product_id": product_id,
                    "order_id": order_id,
                    "movement_type": "order_deducted",
                    "quantity_change": -quantity,
                    "previous_quantity": previous_quantity,
                    "new_quantity": inventory.quantity,
                    "reason": f"Sipariş #{order_id} stok düşümü",
                    "created_by_user_id": created_by_user_id,
                }
            )

            await self._db.flush()
            await self._db.refresh(inventory)
            await self._check_low_stock_threshold(inventory)
            products[product_id] = product

        return products

    async def _check_low_stock_threshold(self, inventory: Inventory) -> None:
        """
        Stok miktarının eşik değerinin altına düşüp düşmediğini kontrol eder.
        Düştüyse NotificationService üzerinden low stock notification oluşturur.

        Bu kontrol service layer'da yapılır; endpoint veya repository'de değil.
        """
        if inventory.quantity > inventory.low_stock_threshold:
            return

        # Product bilgisini al (notification mesajı için)
        product = await self._product_repo.get(inventory.product_id)
        product_name = product.name if product else f"Ürün #{inventory.product_id}"
        product_sku = product.sku if product else "N/A"

        logger.info(
            "Stok kritik seviyeye düştü. Notification oluşturuluyor.",
            extra={
                "product_id": inventory.product_id,
                "quantity": inventory.quantity,
                "threshold": inventory.low_stock_threshold,
            },
        )

        await self._notification_service.create_low_stock_notification(
            product_id=inventory.product_id,
            product_name=product_name,
            sku=product_sku,
            current_quantity=inventory.quantity,
            threshold=inventory.low_stock_threshold,
        )

    async def get_low_stock_items(self) -> list[Inventory]:
        """Kritik stok seviyesinin altındaki tüm stok kayıtlarını getirir."""
        return await self._inventory_repo.get_low_stock_items()

    async def get_all_with_product(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Inventory]:
        """Tüm stok kayıtlarını ürün bilgisiyle birlikte getirir."""
        return await self._inventory_repo.get_all_with_product(skip=skip, limit=limit)
