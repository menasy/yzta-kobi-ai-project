# schemas/order.py
# Sipariş ve sipariş kalemleri schema'ları.
# notes, reason gibi serbest metin alanları global sanitize ile temizlenir.

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .common import ORDER_STATUSES, validate_sanitized_field, validate_status


# ── Request Schemas ──────────────────────────────────────


class OrderItemCreate(BaseModel):
    """Sipariş kalemi oluşturma isteği."""

    product_id: int = Field(..., gt=0, description="Geçerli bir ürün ID'si")
    quantity: int = Field(..., gt=0, le=10000, description="Sipariş miktarı (1-10000)")


class OrderCreate(BaseModel):
    """POST /orders isteği."""

    customer_id: int = Field(..., gt=0, description="Müşteri ID")
    items: list[OrderItemCreate] = Field(..., min_length=1, description="En az 1 kalem gerekli")
    notes: str | None = Field(default=None, max_length=1000, description="Sipariş notu")

    @field_validator("notes")
    @classmethod
    def sanitize_notes(cls, v: str | None) -> str | None:
        return validate_sanitized_field(v)


class OrderStatusUpdate(BaseModel):
    """PUT /orders/{id}/status isteği."""

    status: str = Field(..., max_length=50, description="Yeni sipariş durumu")
    reason: str | None = Field(default=None, max_length=255, description="Durum değişikliği açıklaması")

    @field_validator("status")
    @classmethod
    def validate_order_status(cls, v: str) -> str:
        return validate_status(v, ORDER_STATUSES, "sipariş durumu")

    @field_validator("reason")
    @classmethod
    def sanitize_reason(cls, v: str | None) -> str | None:
        return validate_sanitized_field(v)


# ── Response Schemas ─────────────────────────────────────


class OrderItemResponse(BaseModel):
    """Sipariş kalemi response."""

    id: int
    order_id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerBriefResponse(BaseModel):
    """Sipariş içinde gösterilecek müşteri kısa bilgisi."""

    id: int
    full_name: str
    phone: str | None = None
    email: str | None = None

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    """Sipariş detay response (kalemler dahil)."""

    id: int
    order_number: str
    customer_id: int
    status: str
    total_amount: Decimal
    notes: str | None = None
    placed_at: datetime
    cancelled_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    # İlişkili veriler
    order_items: list[OrderItemResponse] = []
    customer: CustomerBriefResponse | None = None

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    """Sipariş listesi response (kalemler olmadan, hafif)."""

    id: int
    order_number: str
    customer_id: int
    status: str
    total_amount: Decimal
    placed_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderStatusHistoryResponse(BaseModel):
    """Sipariş durum geçmişi response."""

    id: int
    order_id: int
    old_status: str | None = None
    new_status: str
    changed_by_user_id: int | None = None
    reason: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderSummaryResponse(BaseModel):
    """Günlük sipariş özeti (dashboard için)."""

    date: str
    total_orders: int = 0
    pending: int = 0
    processing: int = 0
    shipped: int = 0
    delivered: int = 0
    cancelled: int = 0
    total_revenue: Decimal = Decimal("0.00")
