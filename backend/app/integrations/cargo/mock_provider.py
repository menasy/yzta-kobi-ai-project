# integrations/cargo/mock_provider.py
# Geliştirme ve demo ortamı için mock kargo sağlayıcısı.
# Gerçek dış servis bağımlılığı olmadan çalışır.
# Tracking number hash'ine göre deterministik, tutarlı sonuçlar üretir.

import hashlib
from datetime import datetime, timedelta, timezone

from app.core.logger import get_logger

from .base import CargoProvider, CargoStatusResult

logger = get_logger(__name__)

# Deterministik mock veriler
_STATUSES = ["in_transit", "delivered", "delayed", "in_transit", "in_transit"]

_LOCATIONS = [
    "İstanbul - Esenyurt Dağıtım Merkezi",
    "Ankara - Sincan Transfer Merkezi",
    "İzmir - Bornova Şube",
    "Bursa - Nilüfer Dağıtım Merkezi",
    "Antalya - Merkez Şube",
]

_DETAILS = {
    "in_transit": "Kargonuz yolda, dağıtım merkezine ulaştı.",
    "delivered": "Kargonuz teslim edilmiştir.",
    "delayed": "Kargonuz hava koşulları nedeniyle gecikme yaşamaktadır.",
}


class MockCargoProvider(CargoProvider):
    """
    Mock kargo sağlayıcı.

    Tracking number hash'ine göre deterministik sonuç üretir.
    Aynı tracking number her zaman aynı sonucu döndürür.
    Gerçek API çağrısı yapmaz.
    """

    async def get_status(self, tracking_number: str) -> CargoStatusResult:
        """
        Tracking number'ı hash'leyerek tutarlı mock veri üretir.
        """
        logger.debug("MockCargoProvider sorgulanıyor: %s", tracking_number)

        # Hash ile deterministik index
        hash_val = int(hashlib.md5(tracking_number.encode()).hexdigest(), 16)

        status = _STATUSES[hash_val % len(_STATUSES)]
        location = _LOCATIONS[hash_val % len(_LOCATIONS)]
        detail = _DETAILS.get(status, "")

        now = datetime.now(tz=timezone.utc)

        # Tahmini teslimat tarihi
        if status == "delivered":
            estimated = (now - timedelta(days=1)).strftime("%Y-%m-%d")
            last_update = (now - timedelta(hours=3)).isoformat()
        elif status == "delayed":
            estimated = (now + timedelta(days=3)).strftime("%Y-%m-%d")
            last_update = (now - timedelta(hours=6)).isoformat()
        else:  # in_transit
            estimated = (now + timedelta(days=1)).strftime("%Y-%m-%d")
            last_update = (now - timedelta(hours=1)).isoformat()

        return CargoStatusResult(
            tracking_number=tracking_number,
            status=status,
            carrier="mock",
            location=location,
            estimated_delivery=estimated,
            last_update=last_update,
            detail=detail,
        )
