# agent/tools/order_tools.py
# Sipariş sorgulama tool'ları.
# OrderQueryService üzerinden çalışır — doğrudan repository veya DB session kullanmaz.

from typing import TYPE_CHECKING, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.core.logger import get_logger
from app.services.order_query_service import OrderQueryService

from .base import BaseTool, ToolResult

if TYPE_CHECKING:
    from app.agent.context import AgentContext

logger = get_logger(__name__)


class GetOrderStatusTool(BaseTool):
    """Sipariş ID'sine göre sipariş durumunu sorgular."""

    name = "get_order_status"
    description = (
        "Müşteri kendi aktif siparişlerini sorduğunda veya belirli bir "
        "sipariş ID'sine/numarasına göre siparişin durumunu sorduğunda bu aracı kullan. "
        "Eğer müşteri sipariş ID'si vermemişse, sadece aracı çağır, müşterinin "
        "aktif siparişleri listelenecektir."
    )
    parameters = {
        "type": "object",
        "properties": {
            "order_id": {
                "type": "integer",
                "description": "Sorgulanacak sipariş ID'si veya numarası. Belirtilmezse müşterinin aktif siparişleri döner.",
            },
        },
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = OrderQueryService(db)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        order_id: int | None = kwargs.get("order_id")
        
        # Admin olmayanlar için customer_id zorunluluğu
        customer_id = context.customer_id if context.role != "admin" else None

        if order_id is None:
            # Müşteri sipariş ID belirtmeden sordu, kendi aktif siparişlerini getir
            if customer_id is None:
                return ToolResult(success=False, error="Sipariş sorgulamak için giriş yapmalısınız.")
            
            try:
                orders = await self._service.get_active_orders_for_customer(customer_id)
                if not orders:
                    return ToolResult(success=True, data="Sipariş kaydı bulamadım.")
                return ToolResult(success=True, data=orders)
            except AppException as exc:
                return ToolResult(success=False, error=exc.message)

        try:
            order_id = int(order_id)
        except (ValueError, TypeError):
            return ToolResult(success=False, error="Geçersiz sipariş ID'si.")

        try:
            # Service seviyesinde security enforcement
            detail = await self._service.get_order_detail(order_id=order_id, customer_id=customer_id)
            return ToolResult(success=True, data=detail)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)


class GetOrdersByPhoneTool(BaseTool):
    """Telefon numarasına göre müşterinin son siparişlerini listeler."""

    name = "get_orders_by_phone"
    description = (
        "Verilen telefon numarasına ait müşterinin son 5 siparişini listeler. "
        "Müşteri telefon numarası ile siparişlerini sorduğunda bu aracı kullan."
    )
    parameters = {
        "type": "object",
        "properties": {
            "phone": {
                "type": "string",
                "description": "Müşterinin telefon numarası (ör: 05321234567).",
            },
        },
        "required": ["phone"],
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = OrderQueryService(db)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        # Güvenlik kontrolü: Sadece admin bu tool'u kullanabilir
        if context.role != "admin":
            return ToolResult(success=False, error="Bu bilgiye erişim yetkiniz yok.")

        phone: str | None = kwargs.get("phone")
        if not phone:
            return ToolResult(success=False, error="Telefon numarası belirtilmedi.")

        try:
            orders = await self._service.get_orders_by_phone(phone)
            if not orders:
                return ToolResult(
                    success=True,
                    data=f"{phone} numarasına ait sipariş bulunamadı.",
                )
            return ToolResult(success=True, data=orders)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
