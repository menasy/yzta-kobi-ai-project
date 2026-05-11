# Inventory ORM -> response schema donusumleri.

from app.models.inventory import Inventory
from app.schemas.inventory import InventoryResponse, InventoryWithProductResponse


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
