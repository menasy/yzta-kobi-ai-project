"""Admin shipment pending action ve insight tool'ları."""

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.actions import ActionType, PendingAction, PendingActionStore, SafetyLevel
from app.agent.actions.action_types import MAX_SHIPMENT_REFRESH_ITEMS
from app.core.exceptions import AppException
from app.services.shipment_service import ShipmentService

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


class CreatePendingShipmentRefreshTool(BaseTool):
    """Kargo durum yenileme için onay bekleyen action oluşturur."""

    name = "create_pending_shipment_refresh"
    description = (
        "Admin bir veya birden fazla kargo durumunu provider/mock provider üzerinden "
        "yenilemek istediğinde kullan. DB'yi değiştirmez; pending action oluşturur."
    )
    parameters = {
        "type": "object",
        "properties": {
            "tracking_number": {"type": "string", "description": "Tek takip numarası."},
            "tracking_numbers": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Birden fazla takip numarası.",
            },
            "reason": {"type": "string"},
        },
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = ShipmentService(db)
        self._store = PendingActionStore()

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied

        try:
            tracking_numbers = self._normalize_tracking_numbers(kwargs)
            shipments = [await self._service.get_shipment_by_tracking(item) for item in tracking_numbers]
            reason = normalize_reason(kwargs.get("reason"), "AI üzerinden kargo durumu yenileme isteği.")
            action = PendingAction(
                action_id=new_action_id(),
                action_type=ActionType.SHIPMENT_REFRESH,
                user_id=context.user_id,
                role=context.role,
                session_id=context.session_id,
                title=f"{len(shipments)} kargo durumunu yenile",
                summary=(
                    f"{len(shipments)} kargonun durumu onay sonrası provider üzerinden tekrar kontrol edilecek."
                ),
                payload={"tracking_numbers": tracking_numbers},
                status="pending",
                requires_confirmation=True,
                created_at=utcnow(),
                expires_at=action_expiry(),
                safety_level=SafetyLevel.MEDIUM,
                affected_resources=[
                    resource("shipment", shipment.tracking_number or shipment.id, shipment.tracking_number)
                    for shipment in shipments
                ],
                preview=[
                    preview_item(
                        resource_type="shipment",
                        resource_id=shipment.tracking_number or shipment.id,
                        label=shipment.tracking_number,
                        before={
                            "status": shipment.status,
                            "last_checked_at": (
                                shipment.last_checked_at.isoformat()
                                if shipment.last_checked_at
                                else None
                            ),
                        },
                        after={"operation": "refresh_from_provider"},
                    )
                    for shipment in shipments
                ],
                reason=reason,
            )
            return await store_pending_action(self._store, action)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
        except ValueError as exc:
            return ToolResult(success=False, error=str(exc))

    @staticmethod
    def _normalize_tracking_numbers(kwargs: dict[str, Any]) -> list[str]:
        values = kwargs.get("tracking_numbers") or []
        if kwargs.get("tracking_number"):
            values.append(kwargs["tracking_number"])
        tracking_numbers = sorted({str(value).strip().upper() for value in values if str(value).strip()})
        if not tracking_numbers:
            raise ValueError("En az bir takip numarası belirtilmelidir.")
        if len(tracking_numbers) > MAX_SHIPMENT_REFRESH_ITEMS:
            raise ValueError(f"Tek aksiyonda en fazla {MAX_SHIPMENT_REFRESH_ITEMS} kargo yenilenebilir.")
        return tracking_numbers


class GetShipmentRiskReportTool(BaseTool):
    """Geciken veya kontrol gerektiren kargoları listeler."""

    name = "get_shipment_risk_report"
    description = (
        "Admin geciken, riskli veya güncelleme bekleyen kargoları sorduğunda bu read-only raporu kullan."
    )
    parameters = {
        "type": "object",
        "properties": {
            "limit": {"type": "integer", "description": "Maksimum kargo sayısı."},
        },
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = ShipmentService(db)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied
        limit = min(int(kwargs.get("limit") or 20), 50)
        try:
            delayed = await self._service.list_delayed_shipments(limit=limit)
            active = await self._service.list_shipments(limit=limit)
            rows = {shipment.tracking_number: self._row(shipment, is_delayed=True) for shipment in delayed}
            for shipment in active:
                if shipment.tracking_number in rows:
                    continue
                if shipment.status in {"created", "in_transit", "delayed"}:
                    rows[shipment.tracking_number] = self._row(shipment, is_delayed=False)
            return ToolResult(success=True, data={"shipments": list(rows.values())[:limit]})
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)

    @staticmethod
    def _row(shipment: Any, *, is_delayed: bool) -> dict[str, Any]:
        overdue = False
        if shipment.estimated_delivery_date:
            delivery = shipment.estimated_delivery_date
            if delivery.tzinfo is None:
                delivery = delivery.replace(tzinfo=UTC)
            overdue = delivery < datetime.now(tz=UTC)
        return {
            "tracking_number": shipment.tracking_number,
            "status": shipment.status,
            "is_delayed": is_delayed or overdue or shipment.status == "delayed",
            "suggested_action": "Kargo durumunu yenile" if shipment.tracking_number else "Kargo detayını kontrol et",
        }
