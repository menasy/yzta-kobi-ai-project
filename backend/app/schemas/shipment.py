# schemas/shipment.py
# Kargo ve kargo olay schema'ları.
# description gibi serbest metin alanları global sanitize ile temizlenir.

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .common import SHIPMENT_STATUSES, validate_sanitized_field, validate_status


# ── Request Schemas ──────────────────────────────────────


class ShipmentCreate(BaseModel):
    """POST /shipments isteği."""

    order_id: int = Field(..., gt=0, description="İlişkili sipariş ID")
    carrier: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Kargo firması (yurtici, aras, mng, ptt, mock)",
    )
    tracking_number: str | None = Field(
        default=None,
        max_length=100,
        description="Kargo takip numarası",
    )
    estimated_delivery_date: datetime | None = Field(
        default=None,
        description="Tahmini teslimat tarihi",
    )


class ShipmentStatusUpdate(BaseModel):
    """PUT /shipments/{id}/status isteği."""

    status: str = Field(..., max_length=50, description="Yeni kargo durumu")

    @field_validator("status")
    @classmethod
    def validate_shipment_status(cls, v: str) -> str:
        return validate_status(v, SHIPMENT_STATUSES, "kargo durumu")


class ShipmentEventCreate(BaseModel):
    """Kargo olay kaydı oluşturma."""

    status: str = Field(..., max_length=50)
    location: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=500)
    event_time: datetime | None = None
    raw_payload: dict[str, Any] | None = None

    @field_validator("status")
    @classmethod
    def validate_event_status(cls, v: str) -> str:
        return validate_status(v, SHIPMENT_STATUSES, "kargo olay durumu")

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v: str | None) -> str | None:
        return validate_sanitized_field(v)

    @field_validator("location")
    @classmethod
    def sanitize_location(cls, v: str | None) -> str | None:
        return validate_sanitized_field(v)


# ── Response Schemas ─────────────────────────────────────


class ShipmentEventResponse(BaseModel):
    """Kargo olay response."""

    id: int
    shipment_id: int
    status: str
    location: str | None = None
    description: str | None = None
    event_time: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ShipmentResponse(BaseModel):
    """Kargo detay response."""

    id: int
    order_id: int
    carrier: str
    tracking_number: str | None = None
    status: str
    estimated_delivery_date: datetime | None = None
    delivered_at: datetime | None = None
    last_checked_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    # İlişkili olaylar
    events: list[ShipmentEventResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ShipmentListResponse(BaseModel):
    """Kargo listesi response (olaylar olmadan, hafif)."""

    id: int
    order_id: int
    carrier: str
    tracking_number: str | None = None
    status: str
    estimated_delivery_date: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
