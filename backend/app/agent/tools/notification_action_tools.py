"""Admin notification pending action ve insight tool'ları."""

from typing import TYPE_CHECKING, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.actions import ActionType, PendingAction, PendingActionStore, SafetyLevel
from app.agent.actions.action_types import MAX_NOTIFICATION_MARK_READ_ITEMS
from app.core.exceptions import AppException
from app.services.notification_service import NotificationService

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


class CreatePendingNotificationMarkReadTool(BaseTool):
    """Bildirimleri okundu yapma action'ı oluşturur."""

    name = "create_pending_notification_mark_read"
    description = (
        "Admin bildirimleri okundu yapmak/temizlemek istediğinde kullan. DB'yi değiştirmez; "
        "okundu yapılacak bildirim ID'lerini snapshot olarak pending action'a yazar."
    )
    parameters = {
        "type": "object",
        "properties": {
            "notification_ids": {
                "type": "array",
                "items": {"type": "integer"},
                "description": "Okundu yapılacak bildirim ID'leri.",
            },
            "mark_all_unread": {
                "type": "boolean",
                "description": "O anki tüm okunmamış bildirimleri snapshot olarak seç.",
            },
            "severity": {
                "type": "string",
                "enum": ["info", "warning", "critical"],
                "description": "Belirli önem seviyesindeki okunmamış bildirimleri seç.",
            },
            "reason": {"type": "string"},
        },
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = NotificationService(db)
        self._store = PendingActionStore()

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied

        try:
            notifications = await self._select_notifications(kwargs)
            reason = normalize_reason(kwargs.get("reason"), "AI üzerinden bildirimleri okundu yapma isteği.")
            action = PendingAction(
                action_id=new_action_id(),
                action_type=ActionType.NOTIFICATION_MARK_READ,
                user_id=context.user_id,
                role=context.role,
                session_id=context.session_id,
                title=f"{len(notifications)} bildirimi okundu yap",
                summary=(
                    f"{len(notifications)} okunmamış bildirim onay sonrası okundu olarak işaretlenecek."
                ),
                payload={"notification_ids": [notification.id for notification in notifications]},
                status="pending",
                requires_confirmation=True,
                created_at=utcnow(),
                expires_at=action_expiry(),
                safety_level=SafetyLevel.LOW if len(notifications) <= 10 else SafetyLevel.MEDIUM,
                affected_resources=[
                    resource("notification", notification.id, notification.title)
                    for notification in notifications
                ],
                preview=[
                    preview_item(
                        resource_type="notification",
                        resource_id=notification.id,
                        label=notification.title,
                        before={"is_read": notification.is_read, "severity": notification.severity},
                        after={"is_read": True},
                    )
                    for notification in notifications
                ],
                reason=reason,
            )
            return await store_pending_action(self._store, action)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
        except ValueError as exc:
            return ToolResult(success=False, error=str(exc))

    async def _select_notifications(self, kwargs: dict[str, Any]) -> list[Any]:
        notification_ids = [int(item) for item in kwargs.get("notification_ids") or []]
        severity = kwargs.get("severity")
        if notification_ids:
            unread = await self._service.list_unread(limit=MAX_NOTIFICATION_MARK_READ_ITEMS)
            unread_map = {notification.id: notification for notification in unread}
            missing = [item for item in notification_ids if item not in unread_map]
            if missing:
                raise ValueError(f"Okunmamış bildirim bulunamadı: {', '.join(map(str, missing))}.")
            notifications = [unread_map[item] for item in sorted(set(notification_ids))]
        else:
            unread = await self._service.list_unread(limit=MAX_NOTIFICATION_MARK_READ_ITEMS)
            if severity:
                notifications = [item for item in unread if item.severity == severity]
            elif kwargs.get("mark_all_unread"):
                notifications = unread
            else:
                raise ValueError("Bildirim ID'leri veya mark_all_unread/severity seçimi belirtilmelidir.")

        if not notifications:
            raise ValueError("Okundu yapılacak okunmamış bildirim bulunamadı.")
        if len(notifications) > MAX_NOTIFICATION_MARK_READ_ITEMS:
            raise ValueError(
                f"Tek aksiyonda en fazla {MAX_NOTIFICATION_MARK_READ_ITEMS} bildirim okundu yapılabilir."
            )
        return notifications


class GetNotificationRiskSummaryTool(BaseTool):
    """Okunmamış bildirimleri önem seviyesine göre özetler."""

    name = "get_notification_risk_summary"
    description = (
        "Admin okunmamış bildirimlerin önem dağılımını veya düşük öncelikli bildirimleri "
        "temizleme önerisi istediğinde bu read-only özeti kullan."
    )
    parameters = {
        "type": "object",
        "properties": {},
        "required": [],
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = NotificationService(db)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied

        try:
            unread = await self._service.list_unread(limit=100)
            grouped = {"high_priority": [], "medium_priority": [], "low_priority": []}
            suggested_mark_read_ids = []
            for notification in unread:
                row = {
                    "id": notification.id,
                    "title": notification.title,
                    "severity": notification.severity,
                    "type": notification.type,
                }
                if notification.severity == "critical":
                    grouped["high_priority"].append(row)
                elif notification.severity == "warning":
                    grouped["medium_priority"].append(row)
                else:
                    grouped["low_priority"].append(row)
                    suggested_mark_read_ids.append(notification.id)
            grouped["suggested_mark_read_ids"] = suggested_mark_read_ids[:MAX_NOTIFICATION_MARK_READ_ITEMS]
            return ToolResult(success=True, data=grouped)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
