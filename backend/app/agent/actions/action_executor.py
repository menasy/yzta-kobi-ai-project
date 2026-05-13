"""Pending action execute katmanı."""

from typing import TYPE_CHECKING, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ForbiddenError
from app.core.logger import get_logger
from app.schemas.order import OrderStatusUpdate
from app.services.inventory_service import InventoryService
from app.services.notification_service import NotificationService
from app.services.order_service import OrderService
from app.services.product_service import ProductService
from app.services.shipment_service import ShipmentService

from .action_types import ActionType, PendingActionStatus
from .pending_action_store import PendingActionStore
from .schemas import (
    InventoryQuantityUpdatePayload,
    InventoryThresholdUpdatePayload,
    NotificationMarkReadPayload,
    PendingAction,
    ProductPriceBulkUpdatePayload,
    ShipmentRefreshPayload,
    OrderStatusUpdatePayload,
)

if TYPE_CHECKING:
    from app.agent.context import AgentContext

logger = get_logger(__name__)


class ActionExecutor:
    """Pending action'ı ilgili service method'ları üzerinden execute eder."""

    def __init__(self, db: AsyncSession, store: PendingActionStore | None = None) -> None:
        self._db = db
        self._store = store or PendingActionStore()
        self._product_service = ProductService(db)
        self._order_service = OrderService(db)
        self._inventory_service = InventoryService(db)
        self._shipment_service = ShipmentService(db)
        self._notification_service = NotificationService(db)

    async def execute(self, action_id: str, context: "AgentContext") -> dict[str, Any]:
        """Action'ı güvenlik kontrolleriyle execute eder."""
        self._ensure_admin(context)
        action = await self._store.get(context.user_id, context.session_id, action_id)
        self._ensure_executable(action)

        async with self._db.begin_nested():
            result = await self._execute_by_type(action, context)
            await self._store.mark_executed(action)

        logger.info(
            "Pending action execute edildi.",
            extra={
                "action_id": action.action_id,
                "action_type": action.action_type,
                "user_id": context.user_id,
            },
        )
        return {
            "executed": True,
            "action_id": action.action_id,
            "action_type": action.action_type,
            **result,
        }

    async def execute_group(self, group_id: str, context: "AgentContext") -> dict[str, Any]:
        """Group içindeki tüm action'ları execute eder."""
        self._ensure_admin(context)
        group = await self._store.get_group(context.user_id, context.session_id, group_id)
        if group.status == PendingActionStatus.EXPIRED or group.is_expired():
            raise ConflictError(message="Bu aksiyon grubunun onay süresi dolmuş. Lütfen yeniden oluşturun.")
        if group.status != PendingActionStatus.PENDING:
            raise ConflictError(message=f"Bu aksiyon grubu artık çalıştırılamaz. Durum: {group.status}.")

        results = []
        async with self._db.begin_nested():
            for action in group.actions:
                self._ensure_executable(action)
                res = await self._execute_by_type(action, context)
                await self._store.mark_executed(action)
                results.append({"action_id": action.action_id, **res})
            await self._store.mark_group_executed(group)

        logger.info(
            "Pending action group execute edildi.",
            extra={
                "group_id": group.group_id,
                "user_id": context.user_id,
            },
        )
        return {
            "executed": True,
            "group_id": group.group_id,
            "results": results,
        }

    async def _execute_by_type(
        self,
        action: PendingAction,
        context: "AgentContext",
    ) -> dict[str, Any]:
        if action.action_type == ActionType.PRODUCT_PRICE_BULK_UPDATE:
            return await self._execute_product_price_update(action)
        if action.action_type == ActionType.ORDER_STATUS_UPDATE:
            return await self._execute_order_status_update(action, context)
        if action.action_type == ActionType.INVENTORY_THRESHOLD_UPDATE:
            return await self._execute_inventory_threshold_update(action)
        if action.action_type == ActionType.INVENTORY_QUANTITY_UPDATE:
            return await self._execute_inventory_quantity_update(action, context)
        if action.action_type == ActionType.SHIPMENT_REFRESH:
            return await self._execute_shipment_refresh(action)
        if action.action_type == ActionType.NOTIFICATION_MARK_READ:
            return await self._execute_notification_mark_read(action)
        raise ConflictError(message="Desteklenmeyen action türü.")

    async def _execute_product_price_update(self, action: PendingAction) -> dict[str, Any]:
        payload = ProductPriceBulkUpdatePayload.model_validate(action.payload)
        updates = [
            {
                "product_id": item.product_id,
                "expected_old_price": item.expected_old_price,
                "new_price": item.new_price,
            }
            for item in payload.items
        ]
        products = await self._product_service.bulk_update_prices(updates)
        return {
            "affected_count": len(products),
            "results": [product.model_dump(mode="json") for product in products],
        }

    async def _execute_order_status_update(
        self,
        action: PendingAction,
        context: "AgentContext",
    ) -> dict[str, Any]:
        payload = OrderStatusUpdatePayload.model_validate(action.payload)
        order = await self._order_service.update_order_status_by_user_id(
            order_id=payload.order_id,
            payload=OrderStatusUpdate(status=payload.new_status, reason=payload.reason),
            changed_by_user_id=context.user_id,
            expected_old_status=payload.expected_old_status,
        )
        return {
            "affected_count": 1,
            "results": [order.model_dump(mode="json")],
        }

    async def _execute_inventory_threshold_update(self, action: PendingAction) -> dict[str, Any]:
        payload = InventoryThresholdUpdatePayload.model_validate(action.payload)
        results = []
        for item in payload.items:
            inventory = await self._inventory_service.update_stock(
                product_id=item.product_id,
                low_stock_threshold=item.new_threshold,
                expected_low_stock_threshold=item.expected_current_threshold,
            )
            results.append(
                {
                    "product_id": inventory.product_id,
                    "quantity": inventory.quantity,
                    "low_stock_threshold": inventory.low_stock_threshold,
                }
            )
        return {"affected_count": len(results), "results": results}

    async def _execute_inventory_quantity_update(
        self,
        action: PendingAction,
        context: "AgentContext",
    ) -> dict[str, Any]:
        payload = InventoryQuantityUpdatePayload.model_validate(action.payload)
        results = []
        for item in payload.items:
            inventory = await self._inventory_service.update_stock(
                product_id=item.product_id,
                quantity=item.new_quantity,
                expected_quantity=item.expected_current_quantity,
                created_by_user_id=context.user_id,
                reason=f"AI action {action.action_id} stok güncellemesi",
            )
            results.append(
                {
                    "product_id": inventory.product_id,
                    "old_quantity": item.expected_current_quantity,
                    "new_quantity": inventory.quantity,
                    "low_stock_threshold": inventory.low_stock_threshold,
                }
            )
        return {"affected_count": len(results), "results": results}

    async def _execute_shipment_refresh(self, action: PendingAction) -> dict[str, Any]:
        payload = ShipmentRefreshPayload.model_validate(action.payload)
        results = []
        for tracking_number in payload.tracking_numbers:
            shipment = await self._shipment_service.refresh_shipment_status(tracking_number)
            results.append(shipment.model_dump(mode="json"))
        return {"affected_count": len(results), "results": results}

    async def _execute_notification_mark_read(self, action: PendingAction) -> dict[str, Any]:
        payload = NotificationMarkReadPayload.model_validate(action.payload)
        affected_count = await self._notification_service.mark_many_read(payload.notification_ids)
        return {
            "affected_count": affected_count,
            "results": [{"notification_ids": payload.notification_ids}],
        }

    @staticmethod
    def _ensure_admin(context: "AgentContext") -> None:
        if context.role != "admin":
            logger.warning(
                "Admin action yetki ihlali.",
                extra={"user_id": context.user_id, "role": context.role},
            )
            raise ForbiddenError(message="Bu işlem için admin yetkisi gereklidir.")

    @staticmethod
    def _ensure_executable(action: PendingAction) -> None:
        if action.status == PendingActionStatus.EXPIRED or action.is_expired():
            raise ConflictError(message="Bu aksiyonun onay süresi dolmuş. Lütfen yeniden oluşturun.")
        if action.status != PendingActionStatus.PENDING:
            raise ConflictError(message=f"Bu aksiyon artık çalıştırılamaz. Durum: {action.status}.")
