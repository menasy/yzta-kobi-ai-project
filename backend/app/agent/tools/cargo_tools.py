# agent/tools/cargo_tools.py
# Kargo durumu sorgulama tool'u.
# CargoQueryService üzerinden çalışır — doğrudan provider veya DB session kullanmaz.
# Ownership kontrolü: Customer sadece kendi kargosunu sorgulayabilir.

from typing import TYPE_CHECKING, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.core.logger import get_logger
from app.services.cargo_query_service import CargoQueryService
from app.services.order_query_service import OrderQueryService

from .base import BaseTool, ToolResult

if TYPE_CHECKING:
    from app.agent.context import AgentContext

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

    def __init__(self, db: AsyncSession) -> None:
        self._cargo_service = CargoQueryService()
        self._order_service = OrderQueryService(db)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        tracking_number: str | None = kwargs.get("tracking_number")
        if not tracking_number:
            return ToolResult(success=False, error="Kargo takip numarası belirtilmedi.")

        # Ownership kontrolü: Customer sadece kendi kargosunu sorgulayabilir
        if context.role != "admin" and context.customer_id:
            try:
                is_owner = await self._order_service.verify_tracking_number_ownership(
                    tracking_number=tracking_number,
                    customer_id=context.customer_id,
                )
                if not is_owner:
                    return ToolResult(
                        success=False,
                        error="Bu kargo bilgisini bulamadım veya bu kargoya erişim yetkiniz yok.",
                    )
            except Exception:
                logger.warning(
                    "Kargo ownership kontrolü sırasında hata, tracking=%s",
                    tracking_number,
                )
                return ToolResult(
                    success=False,
                    error="Bu kargo bilgisini şu anda kontrol edemiyorum. Lütfen biraz sonra tekrar deneyin.",
                )

        try:
            result = await self._cargo_service.get_cargo_status(tracking_number)
            return ToolResult(success=True, data=result)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
