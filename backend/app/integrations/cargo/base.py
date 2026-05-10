# integrations/cargo/base.py
# Kargo sağlayıcı soyut sınıfı ve standart çıktı modeli.
# Tüm kargo provider'ları (mock, yurtiçi, aras vb.) bu sınıftan miras alır.
# Strategy pattern ile çalışma zamanında provider seçilir.

from abc import ABC, abstractmethod

from pydantic import BaseModel


class CargoStatusResult(BaseModel):
    """Kargo durumu sorgulamasının standart çıktı modeli."""

    tracking_number: str
    status: str                       # in_transit, delivered, delayed, not_found
    carrier: str                      # mock, yurtici, aras, mng
    location: str | None = None       # Son konum
    estimated_delivery: str | None = None  # Tahmini teslimat tarihi
    last_update: str | None = None    # Son güncelleme zamanı
    detail: str | None = None         # Ek detay / açıklama


class CargoProvider(ABC):
    """
    Kargo sağlayıcı soyut sınıfı.
    Her yeni kargo entegrasyonu bu sınıftan türetilir.
    """

    @abstractmethod
    async def get_status(self, tracking_number: str) -> CargoStatusResult:
        """Takip numarasına göre kargo durumunu sorgular."""
        ...
