# Inventory ORM -> response schema donusumleri.

from app.models.inventory import Inventory
from app.schemas.inventory import (
    InventoryResponse,
    InventoryWithProductResponse,
    LowStockAlertResponse,
)


def to_inventory_response(inventory: Inventory) -> InventoryResponse:
    return InventoryResponse.model_validate(inventory)


def to_inventory_responses(items: list[Inventory]) -> list[InventoryResponse]:
    return [to_inventory_response(item) for item in items]


def to_inventory_with_product_response(inventory: Inventory) -> InventoryWithProductResponse:
    product = inventory.product
    return InventoryWithProductResponse(
        id=inventory.id,
        product_id=inventory.product_id,
        quantity=inventory.quantity,
        reserved_quantity=inventory.reserved_quantity,
        available_quantity=inventory.available_quantity,
        low_stock_threshold=inventory.low_stock_threshold,
        last_updated_at=inventory.last_updated_at,
        product_name=product.name if product else None,
        product_sku=product.sku if product else None,
    )


def to_inventory_with_product_responses(items: list[Inventory]) -> list[InventoryWithProductResponse]:
    return [to_inventory_with_product_response(item) for item in items]


def _compute_severity(quantity: int, threshold: int) -> str:
    """Stok seviyesine göre uyarı derecesi hesaplar."""
    if quantity <= 0:
        return "critical"
    if quantity <= threshold:
        return "warning"
    return "info"


def to_low_stock_alert_response(inventory: Inventory) -> LowStockAlertResponse:
    product = inventory.product
    return LowStockAlertResponse(
        product_id=inventory.product_id,
        product_name=product.name if product else f"Ürün #{inventory.product_id}",
        product_sku=product.sku if product else "N/A",
        current_quantity=inventory.quantity,
        threshold=inventory.low_stock_threshold,
        severity=_compute_severity(inventory.quantity, inventory.low_stock_threshold),
    )


def to_low_stock_alert_responses(items: list[Inventory]) -> list[LowStockAlertResponse]:
    return [to_low_stock_alert_response(item) for item in items]
