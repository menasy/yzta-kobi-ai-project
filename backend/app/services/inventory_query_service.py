# services/inventory_query_service.py
# Agent tool'ları için stok sorgulama servisi.
# Sadece read-only sorgulama yapar.
# Tool'lar bu servisi çağırır, doğrudan repository çağırmaz.

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import get_logger
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.product_repository import ProductRepository

logger = get_logger(__name__)


class InventoryQueryService:
    """
    Stok sorgulamaya özel, read-only servis.
    Agent tool'ları tarafından kullanılır.
    """

    def __init__(self, db: AsyncSession) -> None:
        self._inventory_repo = InventoryRepository(db)
        self._product_repo = ProductRepository(db)

    async def check_product_stock(self, product_name: str) -> dict:
        """
        Ürün adına göre stok durumunu döndürür.
        Ürün bulunamazsa uygun mesaj içeren dict döner.
        """
        products = await self._product_repo.search(product_name, limit=1)
        if not products:
            return {
                "found": False,
                "message": f"'{product_name}' adında bir ürün bulunamadı.",
            }

        product = products[0]
        inventory = await self._inventory_repo.get_by_product_id(product.id)

        if inventory is None:
            return {
                "found": True,
                "product_name": product.name,
                "message": "Bu ürün için stok kaydı bulunmuyor.",
            }

        is_low = inventory.quantity <= inventory.low_stock_threshold

        return {
            "found": True,
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "current_price": float(product.price),
            "quantity": inventory.quantity,
            "available_quantity": inventory.available_quantity,
            "low_stock_threshold": inventory.low_stock_threshold,
            "is_low_stock": is_low,
            "status": "Kritik seviyede" if is_low else "Yeterli stok mevcut",
        }

    async def get_low_stock_report(self) -> list[dict]:
        """
        Kritik stok seviyesinin altındaki tüm ürünleri döndürür.
        """
        low_items = await self._inventory_repo.get_low_stock_items()

        if not low_items:
            return []

        return [
            {
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else f"Ürün #{item.product_id}",
                "sku": item.product.sku if item.product else None,
                "current_price": float(item.product.price) if item.product else None,
                "quantity": item.quantity,
                "threshold": item.low_stock_threshold,
                "deficit": item.low_stock_threshold - item.quantity,
            }
            for item in low_items
        ]
