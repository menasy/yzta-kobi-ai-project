# schemas/order.py
# Sipariş ve sipariş kalemleri schema'ları.
# Direct checkout request'lerinde cart/guest alanları bulunmaz.

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core import openapi_examples

from .common import (
    ORDER_STATUSES,
    ShippingAddressBase,
    validate_sanitized_field,
    validate_status,
)

# ── Request Schemas ──────────────────────────────────────


class CustomerOrderItemCreate(BaseModel):
    """Customer direct checkout sipariş kalemi."""

    product_id: int = Field(..., gt=0, description="Geçerli bir ürün ID'si")
    quantity: int = Field(..., gt=0, le=10000, description="Sipariş miktarı")


class CustomerShippingCreate(ShippingAddressBase):
    """Sipariş teslimat adresi snapshot isteği."""


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


class OrderShippingResponse(ShippingAddressBase):
    """Sipariş teslimat bilgisi response."""

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


class WeeklyPerformanceItem(BaseModel):
    """Dashboard haftalık performans satırı."""

    date: str
    label: str
    revenue: float = 0.0
    order_count: int = 0


class DashboardOverviewResponse(BaseModel):
    """Admin/operator dashboard genel bakış response."""

    total_revenue: float = 0.0
    total_orders: int = 0
    pending_orders: int = 0
    processing_orders: int = 0
    shipped_orders: int = 0
    delivered_orders: int = 0
    cancelled_orders: int = 0
    new_orders_today: int = 0
    weekly_performance: list[WeeklyPerformanceItem] = Field(default_factory=list)
    currency: str = "TRY"

    model_config = ConfigDict(json_schema_extra={"example": openapi_examples.DASHBOARD_OVERVIEW_EXAMPLE})
