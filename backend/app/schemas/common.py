# schemas/common.py
# Ortak schema yapıları, global sanitize fonksiyonları ve paylaşılan tipler.
# Tüm schema dosyaları buradaki yapıları kullanır; sanitize kodu tekrar edilmez.

import re
from datetime import datetime
from typing import Annotated, Any

import bleach
from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── XSS Sanitization ────────────────────────────────────


def sanitize_html(value: str | None) -> str | None:
    """
    Serbest metin alanlarından HTML tag'lerini temizler (XSS önlemi).

    Kullanım:
        sanitize_html("<script>alert('xss')</script> merhaba") → "alert('xss') merhaba"
    """
    if value is None:
        return None
    return bleach.clean(value, tags=[], strip=True).strip()


# ── Annotated Types ──────────────────────────────────────

# Serbest metin alanları için tekrar kullanılabilir Annotated tip.
# description, notes, message, title, reason, content gibi alanlar bu tipi kullanır.
SanitizedStr = Annotated[str, Field(max_length=1000)]
SanitizedOptionalStr = Annotated[str | None, Field(default=None, max_length=1000)]


# ── Telefon Yardımcıları ─────────────────────────────────

# Türkiye telefon formatı: 05xx xxx xxxx veya +90 5xx xxx xxxx
PHONE_PATTERN = r"^\+?[0-9]{10,15}$"


def normalize_phone(value: str) -> str:
    """Telefon numarasındaki boşluk ve tire gibi karakterleri kaldırır."""
    return re.sub(r"[\s\-\(\)]+", "", value)


# ── Ortak Sabitler ───────────────────────────────────────

# Sipariş durumları
ORDER_STATUSES = frozenset({"pending", "processing", "shipped", "delivered", "cancelled"})

# Kargo durumları
SHIPMENT_STATUSES = frozenset({"created", "in_transit", "delivered", "delayed", "failed", "cancelled"})

# Bildirim tipleri
NOTIFICATION_TYPES = frozenset(
    {
        "LOW_STOCK_ALERT",
        "SHIPMENT_DELAY",
        "SHIPMENT_DELAYED",
        "DAILY_SUMMARY",
        "SYSTEM",
        "SYSTEM_REPORT",
        "AI_AGENT",
        "TASK_ASSIGNMENT",
    }
)

# Bildirim durumları
NOTIFICATION_STATUSES = frozenset({"unread", "read", "archived"})

# Bildirim öncelikleri
NOTIFICATION_SEVERITIES = frozenset({"info", "warning", "critical"})

# Kullanıcı rolleri
USER_ROLES = frozenset({"admin", "operator", "customer"})

# Müşteri kaynak kanalları
SOURCE_CHANNELS = frozenset({"web", "whatsapp", "agent"})

# Stok hareket tipleri
MOVEMENT_TYPES = frozenset({
    "stock_in", "stock_out", "order_reserved",
    "order_deducted", "order_cancelled", "adjustment",
})


# ── Pagination ───────────────────────────────────────────


class PaginationParams(BaseModel):
    """
    Sayfalama query parametreleri.
    Endpoint'lerde Depends() ile kullanılır.
    """

    page: int = Field(default=1, ge=1, description="Sayfa numarası (1'den başlar)")
    size: int = Field(default=20, ge=1, le=100, description="Sayfa başına kayıt (max 100)")

    @property
    def skip(self) -> int:
        """SQLAlchemy offset değeri."""
        return (self.page - 1) * self.size


# ── Ortak Response Mixins ────────────────────────────────


class TimestampResponseMixin(BaseModel):
    """Response schema'larında created_at/updated_at alanları için mixin."""

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IdResponse(BaseModel):
    """Sadece ID dönen basit response."""

    id: int


class MessageResponse(BaseModel):
    """Sadece mesaj dönen basit response."""

    message: str


# ── Ortak Validator'lar ──────────────────────────────────


def validate_sanitized_field(value: str | None) -> str | None:
    """Serbest metin alanlarını sanitize eden reusable validator."""
    return sanitize_html(value)


def validate_status(value: str, allowed: frozenset[str], field_name: str = "status") -> str:
    """Durum alanlarını kontrol eden reusable validator."""
    if value not in allowed:
        allowed_str = ", ".join(sorted(allowed))
        raise ValueError(f"Geçersiz {field_name}: '{value}'. İzin verilenler: {allowed_str}")
    return value


# ── Teslimat Adresi ──────────────────────────────────────


class ShippingAddressBase(BaseModel):
    """Order shipping ve user default address akışlarının ortak adres sözleşmesi."""

    full_name: str = Field(..., min_length=2, max_length=255, description="Teslim alacak kişi")
    phone: str = Field(..., min_length=10, max_length=20, description="Teslimat telefonu")
    address: str = Field(..., min_length=5, max_length=1000, description="Açık adres")
    city: str = Field(..., min_length=2, max_length=100, description="İl")
    district: str = Field(..., min_length=2, max_length=100, description="İlçe")
    postal_code: str | None = Field(default=None, max_length=20, description="Posta kodu")
    country: str = Field(default="Türkiye", min_length=2, max_length=100, description="Ülke")
    note: str | None = Field(default=None, max_length=1000, description="Teslimat notu")

    @field_validator("phone", mode="before")
    @classmethod
    def normalize_shipping_phone(cls, value: object) -> str:
        return normalize_phone(str(value))

    @field_validator("phone")
    @classmethod
    def validate_shipping_phone(cls, value: str) -> str:
        if not re.fullmatch(PHONE_PATTERN, value):
            raise ValueError("Telefon numarası 10-15 rakam içermelidir.")
        return value

    @field_validator("full_name", "address", "city", "district", "postal_code", "country", "note")
    @classmethod
    def sanitize_shipping_text(cls, value: str | None) -> str | None:
        return validate_sanitized_field(value)
