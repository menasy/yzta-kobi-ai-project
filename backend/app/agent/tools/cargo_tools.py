# agent/tools/cargo_tools.py
# Kargo durumu sorgulama tool'u.
# CargoQueryService üzerinden çalışır — doğrudan provider veya DB session kullanmaz.

from typing import Any

from app.core.exceptions import AppException
from app.core.logger import get_logger
from app.services.cargo_query_service import CargoQueryService

from .base import BaseTool, ToolResult

logger = get_logger(__name__)


class GetCargoStatusTool(BaseTool):
    """Takip numarasına göre kargo durumunu sorgular."""

    name = "get_cargo_status"
    description = (
        "Verilen kargo takip numarasına göre kargonun güncel konumunu, durumunu "
        "ve tahmini teslimat tarihini döndürür. Müşteri kargo takip numarası ile "
        "kargosunun nerede olduğunu sorduğunda bu aracı kullan."
    )
    parameters = {
        "type": "object",
        "properties": {
            "tracking_number": {
                "type": "string",
                "description": "Kargo takip numarası (ör: YK123456).",
            },
        },
        "required": ["tracking_number"],
    }

    def __init__(self) -> None:
        self._service = CargoQueryService()

    async def execute(self, **kwargs: Any) -> ToolResult:
        tracking_number: str | None = kwargs.get("tracking_number")
        if not tracking_number:
            return ToolResult(success=False, error="Kargo takip numarası belirtilmedi.")

        try:
            result = await self._service.get_cargo_status(tracking_number)
            return ToolResult(success=True, data=result)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
