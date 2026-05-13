# agent/tools/order_tools.py
# Sipariş sorgulama tool'ları.
# OrderQueryService üzerinden çalışır — doğrudan repository veya DB session kullanmaz.

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.core.logger import get_logger
from app.services.order_query_service import OrderQueryService

from .base import BaseTool, ToolResult

logger = get_logger(__name__)


class GetOrderStatusTool(BaseTool):
    """Sipariş ID'sine göre sipariş durumunu sorgular."""

    name = "get_order_status"
    description = (
        "Verilen sipariş ID'sine göre siparişin durumunu, toplam tutarını ve "
        "müşteri bilgisini döndürür. Müşteri sipariş numarası veya ID'si ile "
        "sipariş durumu sorduğunda bu aracı kullan."
    )
    parameters = {
        "type": "object",
        "properties": {
            "order_id": {
                "type": "integer",
                "description": "Sorgulanacak sipariş ID'si veya numarası.",
            },
        },
        "required": ["order_id"],
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = OrderQueryService(db)

    async def execute(self, **kwargs: Any) -> ToolResult:
        order_id: int | None = kwargs.get("order_id")
        if order_id is None:
            return ToolResult(success=False, error="Sipariş ID'si belirtilmedi.")

        try:
            order_id = int(order_id)
        except (ValueError, TypeError):
            return ToolResult(success=False, error="Geçersiz sipariş ID'si.")

        try:
            detail = await self._service.get_order_detail(order_id)
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

    async def execute(self, **kwargs: Any) -> ToolResult:
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
