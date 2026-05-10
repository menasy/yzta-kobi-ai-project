# schemas/notification.py
# Notification request/response schema'ları.

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .common import (
    NOTIFICATION_SEVERITIES,
    NOTIFICATION_TYPES,
    validate_sanitized_field,
    validate_status,
)


class NotificationBase(BaseModel):
    """Notification ortak alanları."""

    type: str = Field(..., max_length=50, description="Bildirim tipi")
    title: str = Field(..., min_length=1, max_length=255, description="Bildirim başlığı")
    message: str = Field(..., min_length=1, max_length=1000, description="Bildirim mesajı")
    severity: str = Field(default="info", max_length=50, description="Önem seviyesi")
    payload: dict[str, Any] | None = Field(
        default=None,
        description="Bildirime ait esnek metadata (JSON).",
    )

    @field_validator("type")
    @classmethod
    def validate_notification_type(cls, value: str) -> str:
        return validate_status(value, NOTIFICATION_TYPES, "bildirim tipi")

    @field_validator("severity")
    @classmethod
    def validate_notification_severity(cls, value: str) -> str:
        return validate_status(value, NOTIFICATION_SEVERITIES, "bildirim seviyesi")

    @field_validator("title")
    @classmethod
    def sanitize_title(cls, value: str) -> str:
        sanitized = validate_sanitized_field(value)
        if not sanitized:
            raise ValueError("Başlık boş olamaz.")
        return sanitized

    @field_validator("message")
    @classmethod
    def sanitize_message(cls, value: str) -> str:
        sanitized = validate_sanitized_field(value)
        if not sanitized:
            raise ValueError("Mesaj boş olamaz.")
        return sanitized

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "type": "LOW_STOCK_ALERT",
                "title": "Kritik stok uyarısı",
                "message": "PRD-001 kodlu ürün için stok 3 adede düştü.",
                "severity": "warning",
                "payload": {"product_id": 101, "sku": "PRD-001", "current_stock": 3, "threshold": 5},
            },
        }
    )


class NotificationCreate(NotificationBase):
    """Notification oluşturma isteği."""


class NotificationResponse(NotificationBase):
    """Notification detay response."""

    id: int
    is_read: bool
    read_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1204,
                "type": "SHIPMENT_DELAYED",
                "title": "Kargo gecikmesi",
                "message": "ORD-2026-00123 siparişinin kargosu planlanandan gecikiyor.",
                "severity": "critical",
                "payload": {"order_id": 123, "shipment_id": 44, "carrier": "yurtici"},
                "is_read": False,
                "read_at": None,
                "created_at": "2026-05-10T22:00:00Z",
                "updated_at": "2026-05-10T22:00:00Z",
            },
        },
    )


class NotificationListItem(BaseModel):
    """Bildirim liste satırı response."""

    id: int
    type: str
    title: str
    severity: str
    is_read: bool
    read_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1204,
                "type": "DAILY_SUMMARY",
                "title": "Günlük operasyon özeti hazır",
                "severity": "info",
                "is_read": False,
                "read_at": None,
                "created_at": "2026-05-10T22:00:00Z",
            },
        },
    )


class NotificationMarkReadResponse(BaseModel):
    """Bildirim okundu işaretleme response."""

    id: int
    is_read: bool
    read_at: datetime | None = None
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1204,
                "is_read": True,
                "read_at": "2026-05-10T22:15:00Z",
                "updated_at": "2026-05-10T22:15:00Z",
            },
        },
    )
