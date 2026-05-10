# agent/tools/inventory_tools.py
# Stok sorgulama tool'ları.
# InventoryQueryService üzerinden çalışır — doğrudan repository veya DB session kullanmaz.

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.core.logger import get_logger
from app.services.inventory_query_service import InventoryQueryService

from .base import BaseTool, ToolResult

logger = get_logger(__name__)


class CheckProductStockTool(BaseTool):
    """Ürün adına göre stok durumunu sorgular."""

    name = "check_product_stock"
    description = (
        "Verilen ürün adına göre stok miktarını ve durumunu döndürür. "
        "Müşteri veya yönetici bir ürünün stokta olup olmadığını sorduğunda bu aracı kullan."
    )
    parameters = {
        "type": "object",
        "properties": {
            "product_name": {
                "type": "string",
                "description": "Stok durumu sorgulanacak ürünün adı (ör: Domates, Biber).",
            },
        },
        "required": ["product_name"],
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = InventoryQueryService(db)

    async def execute(self, **kwargs: Any) -> ToolResult:
        product_name: str | None = kwargs.get("product_name")
        if not product_name:
            return ToolResult(success=False, error="Ürün adı belirtilmedi.")

        try:
            result = await self._service.check_product_stock(product_name)
            return ToolResult(success=True, data=result)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)


class GetLowStockReportTool(BaseTool):
    """Kritik stok seviyesinin altındaki ürünleri listeler."""

    name = "get_low_stock_report"
    description = (
        "Stok miktarı kritik eşiğin altında olan tüm ürünleri listeler. "
        "Yönetici düşük stokta hangi ürünler olduğunu sorduğunda bu aracı kullan."
    )
    parameters = {
        "type": "object",
        "properties": {},
        "required": [],
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = InventoryQueryService(db)

    async def execute(self, **kwargs: Any) -> ToolResult:
        try:
            report = await self._service.get_low_stock_report()
            if not report:
                return ToolResult(
                    success=True,
                    data="Şu anda kritik stok seviyesinde ürün bulunmamaktadır.",
                )
            return ToolResult(success=True, data=report)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
