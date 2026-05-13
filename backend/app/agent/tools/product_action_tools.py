"""Admin product pending action tool'ları."""

from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.actions import ActionType, PendingAction, PendingActionStore
from app.agent.actions.action_types import MAX_PRICE_CHANGE_PERCENT, MAX_PRODUCT_PRICE_ITEMS, SafetyLevel
from app.core.exceptions import AppException
from app.core.logger import get_logger
from app.services.product_service import ProductService

from .action_tool_utils import (
    action_expiry,
    admin_required,
    new_action_id,
    normalize_reason,
    preview_item,
    price_change_percent,
    quantize_price,
    resource,
    store_pending_action,
    utcnow,
)
from .base import BaseTool, ToolResult

if TYPE_CHECKING:
    from app.agent.context import AgentContext

logger = get_logger(__name__)


class CreatePendingProductPriceUpdateTool(BaseTool):
    """Ürün fiyat değişiklikleri için onay bekleyen action oluşturur."""

    name = "create_pending_product_price_update"
    description = (
        "Admin ürün fiyatını yüzde bazlı artırmak/azaltmak veya belirli yeni fiyatlara "
        "çekmek istediğinde kullan. Bu araç DB'yi değiştirmez; sadece onay bekleyen "
        "fiyat güncelleme aksiyonu oluşturur."
    )
    parameters = {
        "type": "object",
        "properties": {
            "product_ids": {
                "type": "array",
                "items": {"type": "integer"},
                "description": "Yüzde bazlı fiyat değişikliği yapılacak ürün ID'leri.",
            },
            "direction": {
                "type": "string",
                "enum": ["increase", "decrease"],
                "description": "Yüzde bazlı işlem yönü: increase veya decrease.",
            },
            "percentage": {
                "type": "number",
                "description": "Fiyat değişim yüzdesi. En fazla 30 olabilir.",
            },
            "updates": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "product_id": {"type": "integer"},
                        "new_price": {"type": "number"},
                    },
                    "required": ["product_id", "new_price"],
                },
                "description": "Belirli fiyat set etmek için ürün/yeni fiyat listesi.",
            },
            "reason": {
                "type": "string",
                "description": "AI'ın bu fiyat değişikliğini neden önerdiği.",
            },
        },
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = ProductService(db)
        self._store = PendingActionStore()

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied

        try:
            items = await self._build_items(kwargs)
            pending_action = PendingAction(
                action_id=new_action_id(),
                action_type=ActionType.PRODUCT_PRICE_BULK_UPDATE,
                user_id=context.user_id,
                role=context.role,
                session_id=context.session_id,
                title=self._build_title(items),
                summary=self._build_summary(items),
                payload={"items": items},
                status="pending",
                requires_confirmation=True,
                created_at=utcnow(),
                expires_at=action_expiry(),
                safety_level=self._safety_level(items),
                affected_resources=[
                    resource("product", item["product_id"], item["product_name"])
                    for item in items
                ],
                preview=[
                    preview_item(
                        resource_type="product",
                        resource_id=item["product_id"],
                        label=item["product_name"],
                        before={"price": str(item["expected_old_price"])},
                        after={"price": str(item["new_price"])},
                        warning=item.get("warning"),
                    )
                    for item in items
                ],
                reason=normalize_reason(
                    kwargs.get("reason"),
                    "AI tarafından önerilen ürün fiyat güncellemesi.",
                ),
            )
            return await store_pending_action(self._store, pending_action)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
        except (ValueError, TypeError) as exc:
            return ToolResult(success=False, error=str(exc))

    async def _build_items(self, kwargs: dict[str, Any]) -> list[dict[str, Any]]:
        explicit_updates = kwargs.get("updates") or []
        if explicit_updates:
            return await self._build_explicit_price_items(explicit_updates)

        product_ids = self._normalize_ids(kwargs.get("product_ids") or [])
        percentage = Decimal(str(kwargs.get("percentage"))) if kwargs.get("percentage") is not None else None
        direction = kwargs.get("direction")
        if not product_ids or percentage is None or direction not in {"increase", "decrease"}:
            raise ValueError("Ürün ID'leri, direction ve percentage birlikte belirtilmelidir.")
        if percentage <= 0 or percentage > Decimal(str(MAX_PRICE_CHANGE_PERCENT)):
            raise ValueError(f"Yüzde değeri 0 ile {MAX_PRICE_CHANGE_PERCENT} arasında olmalıdır.")

        products = await self._service.get_products_by_ids(product_ids)
        items = []
        for product in products:
            old_price = quantize_price(product.price)
            multiplier = Decimal("1") + (percentage / Decimal("100"))
            if direction == "decrease":
                multiplier = Decimal("1") - (percentage / Decimal("100"))
            new_price = quantize_price(old_price * multiplier)
            change_percent = price_change_percent(old_price, new_price)
            items.append(self._item(product.id, product.name, old_price, new_price, change_percent))
        return items

    async def _build_explicit_price_items(self, updates: list[dict[str, Any]]) -> list[dict[str, Any]]:
        product_ids = self._normalize_ids([item.get("product_id") for item in updates])
        update_map = {int(item["product_id"]): item for item in updates}
        products = await self._service.get_products_by_ids(product_ids)
        items = []
        for product in products:
            old_price = quantize_price(product.price)
            new_price = quantize_price(update_map[product.id]["new_price"])
            change_percent = price_change_percent(old_price, new_price)
            if abs(change_percent) > Decimal(str(MAX_PRICE_CHANGE_PERCENT)):
                raise ValueError(
                    f"{product.name} için fiyat değişimi %{MAX_PRICE_CHANGE_PERCENT} sınırını aşıyor."
                )
            items.append(self._item(product.id, product.name, old_price, new_price, change_percent))
        return items

    @staticmethod
    def _normalize_ids(values: list[Any]) -> list[int]:
        ids = [int(value) for value in values if value is not None]
        unique_ids = sorted(set(ids))
        if len(unique_ids) != len(ids):
            raise ValueError("Aynı ürün tek aksiyonda birden fazla kez yer alamaz.")
        if not unique_ids:
            raise ValueError("En az bir ürün ID'si belirtilmelidir.")
        if len(unique_ids) > MAX_PRODUCT_PRICE_ITEMS:
            raise ValueError(f"Tek aksiyonda en fazla {MAX_PRODUCT_PRICE_ITEMS} ürün güncellenebilir.")
        return unique_ids

    @staticmethod
    def _item(
        product_id: int,
        product_name: str,
        old_price: Decimal,
        new_price: Decimal,
        change_percent: Decimal,
    ) -> dict[str, Any]:
        warning = None
        if abs(change_percent) >= Decimal("20"):
            warning = "Fiyat değişimi yüksek; onay öncesi marj etkisini kontrol edin."
        return {
            "product_id": product_id,
            "product_name": product_name,
            "expected_old_price": old_price,
            "new_price": new_price,
            "change_percent": change_percent,
            "warning": warning,
        }

    @staticmethod
    def _build_title(items: list[dict[str, Any]]) -> str:
        return f"{len(items)} ürün için fiyat güncellemesi"

    @staticmethod
    def _build_summary(items: list[dict[str, Any]]) -> str:
        return (
            f"{len(items)} ürünün fiyatı onay sonrası güncellenecek. "
            "Eski ve yeni fiyatlar önizlemede gösterildi."
        )

    @staticmethod
    def _safety_level(items: list[dict[str, Any]]) -> SafetyLevel:
        if any(item.get("warning") for item in items):
            return SafetyLevel.HIGH
        if len(items) > 3:
            return SafetyLevel.MEDIUM
        return SafetyLevel.LOW
