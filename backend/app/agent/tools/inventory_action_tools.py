"""Admin inventory pending action ve insight tool'ları."""

from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.actions import ActionType, PendingAction, PendingActionStore, SafetyLevel
from app.agent.actions.action_types import (
    MAX_INVENTORY_QUANTITY_ITEMS,
    MAX_INVENTORY_THRESHOLD_ITEMS,
)
from app.core.exceptions import AppException
from app.services.inventory_service import InventoryService
from app.services.order_service import OrderService
from app.services.product_service import ProductService

from .action_tool_utils import (
    action_expiry,
    admin_required,
    new_action_id,
    normalize_reason,
    preview_item,
    resource,
    safety_for_warnings,
    store_pending_action,
    utcnow,
)
from .base import BaseTool, ToolResult

if TYPE_CHECKING:
    from app.agent.context import AgentContext


class CreatePendingInventoryThresholdUpdateTool(BaseTool):
    """Düşük stok eşikleri için onay bekleyen action oluşturur."""

    name = "create_pending_inventory_threshold_update"
    description = (
        "Admin ürün low_stock_threshold değerini güncellemek istediğinde kullan. "
        "DB'yi değiştirmez; pending action oluşturur."
    )
    parameters = {
        "type": "object",
        "properties": {
            "updates": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "product_id": {"type": "integer"},
                        "low_stock_threshold": {"type": "integer"},
                    },
                    "required": ["product_id", "low_stock_threshold"],
                },
            },
            "reason": {"type": "string"},
        },
        "required": ["updates"],
    }

    def __init__(self, db: AsyncSession) -> None:
        self._inventory_service = InventoryService(db)
        self._product_service = ProductService(db)
        self._store = PendingActionStore()

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied
        try:
            items = await self._build_items(kwargs.get("updates") or [])
            reason = normalize_reason(
                kwargs.get("reason"),
                "AI tarafından önerilen düşük stok eşiği güncellemesi.",
            )
            action = PendingAction(
                action_id=new_action_id(),
                action_type=ActionType.INVENTORY_THRESHOLD_UPDATE,
                user_id=context.user_id,
                role=context.role,
                session_id=context.session_id,
                title=f"{len(items)} ürün için düşük stok eşiği güncellemesi",
                summary=f"{len(items)} ürünün low_stock_threshold değeri onay sonrası güncellenecek.",
                payload={"items": items},
                status="pending",
                requires_confirmation=True,
                created_at=utcnow(),
                expires_at=action_expiry(),
                safety_level=SafetyLevel.MEDIUM if len(items) > 3 else SafetyLevel.LOW,
                affected_resources=[
                    resource("inventory", item["product_id"], item["product_name"])
                    for item in items
                ],
                preview=[
                    preview_item(
                        resource_type="inventory",
                        resource_id=item["product_id"],
                        label=item["product_name"],
                        before={"low_stock_threshold": item["expected_current_threshold"]},
                        after={"low_stock_threshold": item["new_threshold"]},
                    )
                    for item in items
                ],
                reason=reason,
            )
            return await store_pending_action(self._store, action)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
        except (ValueError, TypeError) as exc:
            return ToolResult(success=False, error=str(exc))

    async def _build_items(self, updates: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not updates:
            raise ValueError("Güncellenecek eşik bilgisi belirtilmelidir.")
        if len(updates) > MAX_INVENTORY_THRESHOLD_ITEMS:
            raise ValueError(
                f"Tek aksiyonda en fazla {MAX_INVENTORY_THRESHOLD_ITEMS} eşik güncellenebilir."
            )
        product_ids = [int(item["product_id"]) for item in updates]
        if len(set(product_ids)) != len(product_ids):
            raise ValueError("Aynı ürün tek aksiyonda birden fazla kez yer alamaz.")

        products = {product.id: product for product in await self._product_service.get_products_by_ids(product_ids)}
        items = []
        for item in updates:
            product_id = int(item["product_id"])
            new_threshold = int(item["low_stock_threshold"])
            if new_threshold < 0:
                raise ValueError("Düşük stok eşiği negatif olamaz.")
            inventory = await self._inventory_service.get_by_product_id(product_id)
            product = products[product_id]
            items.append(
                {
                    "product_id": product_id,
                    "product_name": product.name,
                    "expected_current_threshold": inventory.low_stock_threshold,
                    "new_threshold": new_threshold,
                    "current_quantity": inventory.quantity,
                }
            )
        return items


class CreatePendingInventoryQuantityUpdateTool(BaseTool):
    """Stok miktarı değişikliği için onay bekleyen action oluşturur."""

    name = "create_pending_inventory_quantity_update"
    description = (
        "Admin ürün stok miktarını doğrudan güncellemek istediğinde kullan. "
        "Riskli olduğu için sadece pending action oluşturur."
    )
    parameters = {
        "type": "object",
        "properties": {
            "updates": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "product_id": {"type": "integer"},
                        "quantity": {"type": "integer"},
                    },
                    "required": ["product_id", "quantity"],
                },
            },
            "reason": {"type": "string"},
        },
        "required": ["updates"],
    }

    def __init__(self, db: AsyncSession) -> None:
        self._inventory_service = InventoryService(db)
        self._product_service = ProductService(db)
        self._store = PendingActionStore()

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied
        try:
            items = await self._build_items(kwargs.get("updates") or [])
            reason = normalize_reason(
                kwargs.get("reason"),
                "AI üzerinden stok miktarı düzeltme isteği.",
            )
            action = PendingAction(
                action_id=new_action_id(),
                action_type=ActionType.INVENTORY_QUANTITY_UPDATE,
                user_id=context.user_id,
                role=context.role,
                session_id=context.session_id,
                title=f"{len(items)} ürün için stok miktarı güncellemesi",
                summary=(
                    f"{len(items)} ürünün stok miktarı onay sonrası değiştirilecek. "
                    "Büyük değişiklikler önizlemede uyarı olarak işaretlendi."
                ),
                payload={"items": items},
                status="pending",
                requires_confirmation=True,
                created_at=utcnow(),
                expires_at=action_expiry(),
                safety_level=safety_for_warnings(
                    any(item.get("warning") for item in items),
                    len(items),
                ),
                affected_resources=[
                    resource("inventory", item["product_id"], item["product_name"])
                    for item in items
                ],
                preview=[
                    preview_item(
                        resource_type="inventory",
                        resource_id=item["product_id"],
                        label=item["product_name"],
                        before={"quantity": item["expected_current_quantity"]},
                        after={"quantity": item["new_quantity"]},
                        warning=item.get("warning"),
                    )
                    for item in items
                ],
                reason=reason,
            )
            return await store_pending_action(self._store, action)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
        except (ValueError, TypeError) as exc:
            return ToolResult(success=False, error=str(exc))

    async def _build_items(self, updates: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not updates:
            raise ValueError("Güncellenecek stok miktarı belirtilmelidir.")
        if len(updates) > MAX_INVENTORY_QUANTITY_ITEMS:
            raise ValueError(
                f"Tek aksiyonda en fazla {MAX_INVENTORY_QUANTITY_ITEMS} stok miktarı güncellenebilir."
            )
        product_ids = [int(item["product_id"]) for item in updates]
        if len(set(product_ids)) != len(product_ids):
            raise ValueError("Aynı ürün tek aksiyonda birden fazla kez yer alamaz.")

        products = {product.id: product for product in await self._product_service.get_products_by_ids(product_ids)}
        items = []
        for item in updates:
            product_id = int(item["product_id"])
            new_quantity = int(item["quantity"])
            if new_quantity < 0:
                raise ValueError("Stok miktarı negatif olamaz.")
            inventory = await self._inventory_service.get_by_product_id(product_id)
            product = products[product_id]
            diff = abs(new_quantity - inventory.quantity)
            warning = None
            if diff >= max(50, int(inventory.quantity * 0.5)):
                warning = "Stok miktarında büyük değişiklik var; fiziksel sayım/audit kontrolü önerilir."
            items.append(
                {
                    "product_id": product_id,
                    "product_name": product.name,
                    "expected_current_quantity": inventory.quantity,
                    "new_quantity": new_quantity,
                    "current_threshold": inventory.low_stock_threshold,
                    "warning": warning,
                }
            )
        return items


class GetDeadStockCandidatesTool(BaseTool):
    """Yavaş satan ve stokta bekleyen ürün adaylarını döndürür."""

    name = "get_dead_stock_candidates"
    description = (
        "Admin ölü stok, yavaş satan ürünler veya indirim adayı ürünleri sorduğunda "
        "bu read-only analizi kullan."
    )
    parameters = {
        "type": "object",
        "properties": {
            "limit": {"type": "integer", "description": "Maksimum ürün sayısı."},
        },
    }

    def __init__(self, db: AsyncSession) -> None:
        self._inventory_service = InventoryService(db)
        self._order_service = OrderService(db)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied
        limit = min(int(kwargs.get("limit") or 10), 30)
        try:
            inventory_items = await self._inventory_service.get_all_with_product(limit=100)
            product_ids = [item.product_id for item in inventory_items]
            sales = await self._order_service.get_product_sales_since(
                product_ids,
                datetime.now(tz=UTC) - timedelta(days=30),
            )
            candidates = []
            for item in inventory_items:
                product = item.product
                if product is None or item.quantity <= item.low_stock_threshold:
                    continue
                sold = sales.get(item.product_id, 0)
                daily_sales = sold / 30 if sold else 0
                estimated_days = round(item.quantity / daily_sales, 1) if daily_sales > 0 else None
                if sold > 3 and (estimated_days is None or estimated_days < 90):
                    continue
                suggested_discount = 20 if sold == 0 else 10
                candidates.append(
                    {
                        "product_id": item.product_id,
                        "product_name": product.name,
                        "current_stock": item.quantity,
                        "current_price": float(product.price),
                        "sales_last_30_days": sold,
                        "estimated_days_in_stock": estimated_days,
                        "risk_reason": "Son 30 günde satış yok" if sold == 0 else "Stok devir hızı düşük",
                        "suggested_discount_percent": suggested_discount,
                    }
                )
            candidates.sort(key=lambda row: (row["sales_last_30_days"], -row["current_stock"]))
            return ToolResult(
                success=True,
                data={
                    "data_quality_note": (
                        "Analiz son 30 günlük sipariş geçmişine göre hesaplandı; veri azsa öneriler yaklaşık kabul edilmelidir."
                    ),
                    "candidates": candidates[:limit],
                },
            )
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
