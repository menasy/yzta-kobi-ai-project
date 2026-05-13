# services/cargo_query_service.py
# Agent tool'ları için kargo durumu sorgulama servisi.
# Config'e göre mock veya gerçek provider seçer.
# Tool'lar bu servisi çağırır, doğrudan provider çağırmaz.

from app.core.config import get_settings
from app.core.logger import get_logger
from app.integrations.cargo.base import CargoProvider
from app.integrations.cargo.mock_provider import MockCargoProvider

logger = get_logger(__name__)


class CargoQueryService:
    """
    Kargo durumu sorgulama servisi.
    Config'e göre mock veya gerçek provider kullanır.
    Agent tool'ları tarafından çağrılır.
    """

    def __init__(self) -> None:
        self._provider = self._create_provider()

    @staticmethod
    def _create_provider() -> CargoProvider:
        """Config'e göre uygun kargo provider'ı oluşturur."""
        settings = get_settings()
        if settings.USE_MOCK_CARGO:
            logger.debug("Mock kargo provider kullanılıyor.")
            return MockCargoProvider()

        # İleride gerçek provider'lar buraya eklenecek:
        # return YurticiCargoProvider(api_key=settings.CARGO_API_KEY)
        logger.debug("Mock kargo provider kullanılıyor (gerçek provider yapılandırılmamış).")
        return MockCargoProvider()

    async def get_cargo_status(self, tracking_number: str) -> dict:
        """
        Tracking number ile kargo durumunu sorgular.
        LLM-friendly dict formatında döner.
        """
        result = await self._provider.get_status(tracking_number)

        status_labels = {
            "in_transit": "Yolda",
            "delivered": "Teslim Edildi",
            "delayed": "Gecikme Var",
            "not_found": "Bulunamadı",
        }

        return {
            "tracking_number": result.tracking_number,
            "status": result.status,
            "status_label": status_labels.get(result.status, result.status),
            "carrier": result.carrier,
            "location": result.location,
            "estimated_delivery": result.estimated_delivery,
            "last_update": result.last_update,
            "detail": result.detail,
        }
