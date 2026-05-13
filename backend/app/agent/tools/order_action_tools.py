"""Admin order pending action ve insight tool'ları."""

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.actions import ActionType, PendingAction, PendingActionStore, SafetyLevel
from app.core.exceptions import AppException
from app.schemas.common import ORDER_STATUSES
from app.services.order_service import OrderService

from .action_tool_utils import (
    action_expiry,
    admin_required,
    new_action_id,
    normalize_reason,
    preview_item,
    resource,
    store_pending_action,
    utcnow,
)
from .base import BaseTool, ToolResult

if TYPE_CHECKING:
    from app.agent.context import AgentContext


class CreatePendingOrderStatusUpdateTool(BaseTool):
    """Sipariş status değişikliği için onay bekleyen action oluşturur."""

    name = "create_pending_order_status_update"
    description = (
        "Admin bir siparişin durumunu değiştirmek istediğinde kullan. DB'yi değiştirmez; "
        "OrderService transition kurallarını kontrol ederek pending action oluşturur."
    )
    parameters = {
        "type": "object",
        "properties": {
            "order_id": {"type": "integer", "description": "Sipariş ID."},
            "order_number": {"type": "string", "description": "Sipariş numarası."},
            "new_status": {
                "type": "string",
                "enum": sorted(ORDER_STATUSES),
                "description": "Yeni sipariş durumu.",
            },
            "reason": {"type": "string", "description": "Durum değişikliği nedeni."},
        },
        "required": ["new_status"],
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = OrderService(db)
        self._store = PendingActionStore()

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied

        try:
            order = await self._get_order(kwargs)
            new_status = str(kwargs.get("new_status") or "").strip()
            self._service.validate_status_transition(order.status, new_status)
            reason = normalize_reason(
                kwargs.get("reason"),
                "AI üzerinden sipariş durumu güncelleme isteği.",
            )
            pending_action = PendingAction(
                action_id=new_action_id(),
                action_type=ActionType.ORDER_STATUS_UPDATE,
                user_id=context.user_id,
                role=context.role,
                session_id=context.session_id,
                title=f"{order.order_number} siparişini {new_status} yap",
                summary=(
                    f"{order.order_number} sipariş durumu '{order.status}' değerinden "
                    f"'{new_status}' değerine alınacak."
                ),
                payload={
                    "order_id": order.id,
                    "order_number": order.order_number,
                    "expected_old_status": order.status,
                    "new_status": new_status,
                    "reason": reason,
                },
                status="pending",
                requires_confirmation=True,
                created_at=utcnow(),
                expires_at=action_expiry(),
                safety_level=SafetyLevel.MEDIUM,
                affected_resources=[resource("order", order.id, order.order_number)],
                preview=[
                    preview_item(
                        resource_type="order",
                        resource_id=order.id,
                        label=order.order_number,
                        before={"status": order.status},
                        after={"status": new_status},
                    )
                ],
                reason=reason,
            )
            return await store_pending_action(self._store, pending_action)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
        except ValueError as exc:
            return ToolResult(success=False, error=str(exc))

    async def _get_order(self, kwargs: dict[str, Any]):
        order_id = kwargs.get("order_id")
        order_number = kwargs.get("order_number")
        if order_id is not None:
            return await self._service.get_admin_order_detail(int(order_id))
        if order_number:
            return await self._service.get_admin_order_detail_by_number(str(order_number))
        raise ValueError("Sipariş ID veya sipariş numarası belirtilmelidir.")


class GetOrderPriorityReportTool(BaseTool):
    """Aktif siparişleri operasyon önceliğine göre listeler."""

    name = "get_order_priority_report"
    description = (
        "Admin aktif siparişlerde öncelik, bekleyen işler veya işlem önerisi istediğinde "
        "bu read-only raporu kullan."
    )
    parameters = {
        "type": "object",
        "properties": {
            "limit": {"type": "integer", "description": "Döndürülecek maksimum sipariş sayısı."},
        },
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = OrderService(db)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied

        limit = min(int(kwargs.get("limit") or 30), 50)
        try:
            orders = await self._service.get_admin_orders(limit=limit)
            active_orders = [order for order in orders if order.status in {"pending", "processing", "shipped"}]
            report = [self._priority_row(order) for order in active_orders]
            report.sort(key=lambda item: item["priority_score"], reverse=True)
            return ToolResult(success=True, data={"orders": report[:limit]})
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)

    @staticmethod
    def _priority_row(order: Any) -> dict[str, Any]:
        placed_at = order.placed_at
        if placed_at.tzinfo is None:
            placed_at = placed_at.replace(tzinfo=UTC)
        age_days = max((datetime.now(tz=UTC) - placed_at).days, 0)
        priority_score = age_days * 10
        reasons = []
        suggested_action = "Durumu kontrol et"
        if order.status == "pending":
            priority_score += 20
            reasons.append("Sipariş beklemede")
            suggested_action = "processing durumuna almayı değerlendir"
        if order.status == "processing" and age_days >= 2:
            priority_score += 30
            reasons.append("İşlem süresi uzamış")
            suggested_action = "Kargo hazırlığını kontrol et"
        if float(order.total_amount) >= 1000:
            priority_score += 10
            reasons.append("Yüksek tutarlı sipariş")

        if priority_score >= 40:
            priority = "high"
        elif priority_score >= 20:
            priority = "medium"
        else:
            priority = "low"

        return {
            "order_id": order.id,
            "order_number": order.order_number,
            "status": order.status,
            "priority": priority,
            "priority_score": priority_score,
            "reason": ", ".join(reasons) or "Normal takip",
            "suggested_action": suggested_action,
        }
