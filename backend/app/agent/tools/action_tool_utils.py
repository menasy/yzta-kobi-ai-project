"""Admin action tool yardımcıları."""

from datetime import UTC, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import TYPE_CHECKING, Any
from uuid import uuid4

from app.agent.actions import PendingAction, PendingActionStore
from app.agent.actions.action_types import SafetyLevel
from app.agent.actions.schemas import ActionPreviewItem, AffectedResource
from app.core.config import get_settings
from app.core.logger import get_logger
from app.schemas.common import validate_sanitized_field

from .base import ToolResult

if TYPE_CHECKING:
    from app.agent.context import AgentContext

PRICE_QUANT = Decimal("0.01")
PERCENT_QUANT = Decimal("0.01")
logger = get_logger(__name__)


def admin_required(context: "AgentContext") -> ToolResult | None:
    """Admin olmayan tool çağrılarını güvenli şekilde reddeder."""
    if context.role != "admin":
        logger.warning(
            "Admin action tool yetki ihlali.",
            extra={"user_id": context.user_id, "role": context.role, "session_id": context.session_id},
        )
        return ToolResult(success=False, error="Bu işlem için admin yetkisi gereklidir.")
    return None


def utcnow() -> datetime:
    return datetime.now(tz=UTC)


def new_action_id() -> str:
    return f"act_{uuid4().hex}"


def action_expiry() -> datetime:
    settings = get_settings()
    return utcnow() + timedelta(seconds=settings.AI_PENDING_ACTION_TTL_SECONDS)


def normalize_reason(value: str | None, fallback: str) -> str:
    sanitized = validate_sanitized_field(value) if value else None
    return sanitized or fallback


def quantize_price(value: Any) -> Decimal:
    price = Decimal(str(value)).quantize(PRICE_QUANT, rounding=ROUND_HALF_UP)
    if price <= 0:
        raise ValueError("Fiyat sıfır veya negatif olamaz.")
    return price


def price_change_percent(old_price: Decimal, new_price: Decimal) -> Decimal:
    if old_price <= 0:
        raise ValueError("Mevcut fiyat geçersiz.")
    return ((new_price - old_price) / old_price * Decimal("100")).quantize(
        PERCENT_QUANT,
        rounding=ROUND_HALF_UP,
    )


def action_to_response(action: PendingAction) -> dict[str, Any]:
    """PendingAction modelini frontend/LLM dostu dict'e çevirir."""
    return action.model_dump(mode="json")


async def store_pending_action(
    store: PendingActionStore,
    action: PendingAction,
) -> ToolResult:
    saved = await store.create(action)
    return ToolResult(
        success=True,
        data={
            "pending_action": action_to_response(saved),
            "requires_confirmation": True,
            "confirmation_hint": (
                "Bu aksiyon henüz uygulanmadı. Uygulamak için açıkça "
                "'onaylıyorum' veya 'tamam uygula' demelisiniz."
            ),
        },
    )


def resource(resource_type: str, resource_id: int | str, label: str | None = None) -> AffectedResource:
    return AffectedResource(
        resource_type=resource_type,
        resource_id=str(resource_id),
        label=label,
    )


def preview_item(
    *,
    resource_type: str,
    resource_id: int | str,
    label: str | None,
    before: dict[str, Any],
    after: dict[str, Any],
    warning: str | None = None,
) -> ActionPreviewItem:
    return ActionPreviewItem(
        resource_type=resource_type,
        resource_id=str(resource_id),
        label=label,
        before=before,
        after=after,
        warning=warning,
    )


def safety_for_warnings(has_high_warning: bool, item_count: int) -> SafetyLevel:
    if has_high_warning:
        return SafetyLevel.HIGH
    if item_count > 3:
        return SafetyLevel.MEDIUM
    return SafetyLevel.LOW
