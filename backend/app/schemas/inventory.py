# schemas/inventory.py
# Envanter ve stok hareketi schema'ları.
# reason gibi serbest metin alanları global sanitize ile temizlenir.

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core import openapi_examples
from .common import MOVEMENT_TYPES, validate_sanitized_field, validate_status


# ── Request Schemas ──────────────────────────────────────


class InventoryUpdate(BaseModel):
    """PUT /inventory/{product_id} isteği."""

    quantity: int | None = Field(default=None, ge=0, le=999999, description="Yeni stok miktarı")
    low_stock_threshold: int | None = Field(
        default=None,
        ge=0,
        le=999999,
        description="Kritik stok eşik değeri",
    )

    model_config = ConfigDict(
        json_schema_extra={"example": openapi_examples.INVENTORY_UPDATE_EXAMPLE}
    )


class InventoryMovementCreate(BaseModel):
    """Stok hareketi oluşturma isteği."""

    product_id: int = Field(..., gt=0)
    order_id: int | None = Field(default=None, gt=0)
    movement_type: str = Field(..., max_length=50, description="Hareket tipi")
    quantity_change: int = Field(..., description="Miktar değişimi (pozitif veya negatif)")
    reason: str | None = Field(default=None, max_length=255)

    @field_validator("movement_type")
    @classmethod
    def validate_movement_type(cls, v: str) -> str:
        return validate_status(v, MOVEMENT_TYPES, "hareket tipi")

    @field_validator("reason")
    @classmethod
    def sanitize_reason(cls, v: str | None) -> str | None:
        return validate_sanitized_field(v)


# ── Response Schemas ─────────────────────────────────────


class InventoryResponse(BaseModel):
    """Stok durumu response."""

    id: int
    product_id: int
    quantity: int
    reserved_quantity: int
    available_quantity: int
    low_stock_threshold: int
    last_updated_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class InventoryWithProductResponse(BaseModel):
    """Stok durumu + ürün bilgisi response."""

    id: int
    product_id: int
    quantity: int
    reserved_quantity: int
    available_quantity: int
    low_stock_threshold: int
    last_updated_at: datetime | None = None

    # Ürün bilgisi
    product_name: str | None = None
    product_sku: str | None = None

    model_config = ConfigDict(from_attributes=True)


class InventoryMovementResponse(BaseModel):
    """Stok hareketi response."""

    id: int
    product_id: int
    order_id: int | None = None
    movement_type: str
    quantity_change: int
    previous_quantity: int
    new_quantity: int
    reason: str | None = None
    created_by_user_id: int | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LowStockAlertResponse(BaseModel):
    """Kritik stok uyarısı response."""

    product_id: int
    product_name: str
    product_sku: str
    current_quantity: int
    threshold: int
    severity: str  # warning | critical
