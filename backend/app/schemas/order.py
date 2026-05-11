# schemas/order.py
# Sipariş ve sipariş kalemleri schema'ları.
# Direct checkout request'lerinde cart/guest alanları bulunmaz.

import re
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core import openapi_examples

from .common import (
    ORDER_STATUSES,
    PHONE_PATTERN,
    normalize_phone,
    validate_sanitized_field,
    validate_status,
)

# ── Request Schemas ──────────────────────────────────────


class CustomerOrderItemCreate(BaseModel):
    """Customer direct checkout sipariş kalemi."""

    product_id: int = Field(..., gt=0, description="Geçerli bir ürün ID'si")
    quantity: int = Field(..., gt=0, le=10000, description="Sipariş miktarı")


class CustomerShippingCreate(BaseModel):
    """Sipariş teslimat adresi snapshot isteği."""

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


class CustomerOrderCreate(BaseModel):
    """POST /orders direct checkout isteği."""

    items: list[CustomerOrderItemCreate] = Field(..., min_length=1, description="En az 1 ürün kalemi")
    shipping: CustomerShippingCreate
    notes: str | None = Field(default=None, max_length=1000, description="Sipariş notu")

    @field_validator("notes")
    @classmethod
    def sanitize_notes(cls, value: str | None) -> str | None:
        return validate_sanitized_field(value)

    model_config = ConfigDict(json_schema_extra={"example": openapi_examples.CUSTOMER_ORDER_CREATE_EXAMPLE})


class OrderItemCreate(CustomerOrderItemCreate):
    """Geriye dönük import uyumluluğu için sipariş kalemi request schema'sı."""


class OrderCreate(CustomerOrderCreate):
    """Geriye dönük import uyumluluğu için direct checkout request schema'sı."""


class OrderStatusUpdate(BaseModel):
    """PATCH /orders/{id}/status isteği."""

    status: str = Field(..., max_length=50, description="Yeni sipariş durumu")
    reason: str | None = Field(default=None, max_length=255, description="Durum değişikliği açıklaması")

    @field_validator("status")
    @classmethod
    def validate_order_status(cls, value: str) -> str:
        return validate_status(value, ORDER_STATUSES, "sipariş durumu")

    @field_validator("reason")
    @classmethod
    def sanitize_reason(cls, value: str | None) -> str | None:
        return validate_sanitized_field(value)


# ── Response Schemas ─────────────────────────────────────


class OrderShippingResponse(BaseModel):
    """Sipariş teslimat bilgisi response."""

    full_name: str
    phone: str
    address: str
    city: str
    district: str
    postal_code: str | None = None
    country: str
    note: str | None = None

    model_config = ConfigDict(from_attributes=True)


class OrderItemResponse(BaseModel):
    """Sipariş kalemi response."""

    id: int
    order_id: int
    product_id: int
    product_name: str | None = None
    sku: str | None = None
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerBriefResponse(BaseModel):
    """Sipariş sahibi kullanıcı kısa bilgisi."""

    id: int
    full_name: str | None = None
    phone: str | None = None
    email: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CustomerOrderResponse(BaseModel):
    """Customer sipariş detay/list response."""

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
    items: list[OrderItemResponse] = Field(default_factory=list, validation_alias="order_items")
    shipping: OrderShippingResponse

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={"example": openapi_examples.CUSTOMER_ORDER_RESPONSE_EXAMPLE},
    )


class AdminOrderResponse(CustomerOrderResponse):
    """Admin sipariş response."""

    customer: CustomerBriefResponse | None = None


class OrderResponse(AdminOrderResponse):
    """Geriye dönük import uyumluluğu için sipariş response schema'sı."""


class OrderListResponse(CustomerOrderResponse):
    """Geriye dönük import uyumluluğu için sipariş liste response schema'sı."""


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
    """Günlük sipariş özeti."""

    date: str
    total_orders: int = 0
    pending: int = 0
    processing: int = 0
    shipped: int = 0
    delivered: int = 0
    cancelled: int = 0
    total_revenue: Decimal = Decimal("0.00")
