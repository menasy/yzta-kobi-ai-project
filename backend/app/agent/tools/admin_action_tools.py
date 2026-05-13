"""Genel admin pending action tool'ları."""

from typing import TYPE_CHECKING, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.actions import ActionExecutor, PendingActionStore
from app.core.exceptions import AppException
from app.services.inventory_service import InventoryService
from app.services.notification_service import NotificationService
from app.services.order_service import OrderService
from app.services.product_service import ProductService
from app.services.shipment_service import ShipmentService

from .action_tool_utils import action_to_response, admin_required
from .base import BaseTool, ToolResult

if TYPE_CHECKING:
    from app.agent.context import AgentContext


class ExecutePendingActionTool(BaseTool):
    """Açık admin onayı sonrası pending action execute eder."""

    name = "execute_pending_action"
    description = (
        "Admin açıkça 'onaylıyorum', 'tamam uygula', 'evet yap' gibi net onay verdiğinde "
        "pending action'ı veya action group'u execute eder. Parametre verilmezse, current session'daki "
        "en son pending action veya group'u bulup uygular."
    )
    parameters = {
        "type": "object",
        "properties": {
            "action_id": {"type": "string", "description": "Execute edilecek pending action ID. Opsiyonel."},
            "group_id": {"type": "string", "description": "Execute edilecek pending action group ID. Opsiyonel."},
        },
    }

    def __init__(self, db: AsyncSession) -> None:
        self._store = PendingActionStore()
        self._executor = ActionExecutor(db, self._store)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied

        try:
            action_id = kwargs.get("action_id")
            group_id = kwargs.get("group_id")

            if not action_id and not group_id:
                # Find latest group or action
                groups = await self._store.list_groups_for_session(context.user_id, context.session_id, pending_only=True)
                actions = await self._store.list_for_session(context.user_id, context.session_id, pending_only=True)
                
                if not groups and not actions:
                    return ToolResult(success=False, error="Onay bekleyen aksiyon bulunamadı.")
                
                latest_group = groups[0] if groups else None
                latest_action = actions[0] if actions else None

                if latest_group and latest_action:
                    if latest_group.created_at > latest_action.created_at:
                        group_id = latest_group.group_id
                    else:
                        action_id = latest_action.action_id
                elif latest_group:
                    group_id = latest_group.group_id
                elif latest_action:
                    action_id = latest_action.action_id

            if group_id:
                result = await self._executor.execute_group(str(group_id), context)
            elif action_id:
                result = await self._executor.execute(str(action_id), context)
            else:
                return ToolResult(success=False, error="Geçerli bir action veya group bulunamadı.")

            return ToolResult(success=True, data=result)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)


class CancelPendingActionTool(BaseTool):
    """Pending action veya action group iptal eder."""

    name = "cancel_pending_action"
    description = "Admin onay bekleyen bir aksiyonu veya aksiyon grubunu iptal etmek istediğinde kullan."
    parameters = {
        "type": "object",
        "properties": {
            "action_id": {"type": "string", "description": "İptal edilecek pending action ID. Opsiyonel."},
            "group_id": {"type": "string", "description": "İptal edilecek pending action group ID. Opsiyonel."},
        },
    }

    def __init__(self) -> None:
        self._store = PendingActionStore()

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied
        try:
            action_id = kwargs.get("action_id")
            group_id = kwargs.get("group_id")

            if not action_id and not group_id:
                groups = await self._store.list_groups_for_session(context.user_id, context.session_id, pending_only=True)
                actions = await self._store.list_for_session(context.user_id, context.session_id, pending_only=True)
                
                if not groups and not actions:
                    return ToolResult(success=False, error="İptal edilecek onay bekleyen aksiyon bulunamadı.")
                
                latest_group = groups[0] if groups else None
                latest_action = actions[0] if actions else None

                if latest_group and latest_action:
                    if latest_group.created_at > latest_action.created_at:
                        group_id = latest_group.group_id
                    else:
                        action_id = latest_action.action_id
                elif latest_group:
                    group_id = latest_group.group_id
                elif latest_action:
                    action_id = latest_action.action_id

            if group_id:
                group = await self._store.cancel_group(context.user_id, context.session_id, str(group_id))
                # For brevity, reusing action_to_response style for group
                return ToolResult(success=True, data={"cancelled": True, "pending_action_group": group.model_dump(mode="json")})
            elif action_id:
                action = await self._store.cancel(context.user_id, context.session_id, str(action_id))
                return ToolResult(success=True, data={"cancelled": True, "pending_action": action_to_response(action)})
            else:
                return ToolResult(success=False, error="Geçerli bir action veya group bulunamadı.")
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)


class GetPendingActionTool(BaseTool):
    """Belirli veya tüm pending action / group detaylarını getirir."""

    name = "get_pending_action"
    description = "Admin onay bekleyen aksiyon detayını görmek istediğinde kullan."
    parameters = {
        "type": "object",
        "properties": {
            "action_id": {"type": "string", "description": "Pending action ID. Opsiyonel."},
            "group_id": {"type": "string", "description": "Pending action group ID. Opsiyonel."},
        },
    }

    def __init__(self) -> None:
        self._store = PendingActionStore()

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied
        try:
            action_id = kwargs.get("action_id")
            group_id = kwargs.get("group_id")

            if group_id:
                group = await self._store.get_group(context.user_id, context.session_id, str(group_id))
                return ToolResult(success=True, data={"pending_action_group": group.model_dump(mode="json")})
            if action_id:
                action = await self._store.get(context.user_id, context.session_id, str(action_id))
                return ToolResult(success=True, data={"pending_action": action_to_response(action)})

            groups = await self._store.list_groups_for_session(context.user_id, context.session_id, pending_only=True)
            actions = await self._store.list_for_session(context.user_id, context.session_id, pending_only=True)
            return ToolResult(
                success=True,
                data={
                    "pending_action_groups": [g.model_dump(mode="json") for g in groups],
                    "pending_actions": [action_to_response(action) for action in actions]
                },
            )
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)


class GetLatestPendingActionTool(BaseTool):
    """Current session'daki en yeni pending action'ı getirir."""

    name = "get_latest_pending_action"
    description = "Admin son onay bekleyen aksiyonu görmek veya onaydan önce hatırlamak istediğinde kullan."
    parameters = {"type": "object", "properties": {}, "required": []}

    def __init__(self) -> None:
        self._store = PendingActionStore()

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied
        try:
            action = await self._store.get_latest_pending(context.user_id, context.session_id)
            return ToolResult(success=True, data={"pending_action": action_to_response(action)})
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)


class GetAdminPageContextTool(BaseTool):
    """Global AI sidepanel için sayfa bazlı kısa admin context'i."""

    name = "get_admin_page_context"
    description = (
        "Admin belirli bir sayfa bağlamında kısa operasyon özeti istediğinde kullan. "
        "page: dashboard, products, orders, inventory, shipments, notifications."
    )
    parameters = {
        "type": "object",
        "properties": {
            "page": {
                "type": "string",
                "enum": ["dashboard", "products", "orders", "inventory", "shipments", "notifications"],
            },
        },
        "required": ["page"],
    }

    def __init__(self, db: AsyncSession) -> None:
        self._product_service = ProductService(db)
        self._order_service = OrderService(db)
        self._inventory_service = InventoryService(db)
        self._shipment_service = ShipmentService(db)
        self._notification_service = NotificationService(db)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        denied = admin_required(context)
        if denied:
            return denied
        page = kwargs.get("page")
        try:
            data: dict[str, Any] = {"page": page}
            if page in {"dashboard", "orders"}:
                overview = await self._order_service.get_dashboard_overview()
                data["orders"] = overview.model_dump(mode="json")
            if page in {"dashboard", "products"}:
                products = await self._product_service.get_all_products()
                data["products"] = {"total": len(products), "sample": [p.model_dump(mode="json") for p in products[:5]]}
            if page in {"dashboard", "inventory"}:
                low_stock = await self._inventory_service.get_low_stock_items()
                data["inventory"] = {"low_stock_count": len(low_stock)}
            if page in {"dashboard", "shipments"}:
                delayed = await self._shipment_service.list_delayed_shipments(limit=10)
                data["shipments"] = {"delayed_count": len(delayed), "items": [s.model_dump(mode="json") for s in delayed]}
            if page in {"dashboard", "notifications"}:
                unread = await self._notification_service.list_unread(limit=20)
                data["notifications"] = {"unread_count": len(unread)}
            return ToolResult(success=True, data=data)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
