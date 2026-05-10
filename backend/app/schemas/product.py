# schemas/product.py
# Ürün CRUD schema'ları.
# description gibi serbest metin alanları global sanitize ile temizlenir.

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .common import validate_sanitized_field
from app.core import openapi_examples


# ── Request Schemas ──────────────────────────────────────


class ProductCreate(BaseModel):
    """POST /products isteği."""

    name: str = Field(..., min_length=2, max_length=255, description="Ürün adı")
    sku: str = Field(
        ...,
        min_length=2,
        max_length=100,
        pattern=r"^[A-Za-z0-9\-_]+$",
        description="Benzersiz stok kodu (alfanümerik, tire, alt çizgi)",
    )
    description: str | None = Field(default=None, max_length=1000, description="Ürün açıklaması")
    price: Decimal = Field(..., gt=0, le=Decimal("9999999.99"), description="Birim fiyat (TL)")
    category: str | None = Field(default=None, max_length=100)
    image_url: str | None = Field(default=None, max_length=500)

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v: str | None) -> str | None:
        return validate_sanitized_field(v)

    @field_validator("sku")
    @classmethod
    def normalize_sku(cls, v: str) -> str:
        """SKU'yu büyük harfe çevirir."""
        return v.upper()

    model_config = {
        "json_schema_extra": {
            "example": openapi_examples.PRODUCT_CREATE_EXAMPLE
        }
    }


class ProductUpdate(BaseModel):
    """PUT /products/{id} isteği — tüm alanlar opsiyonel."""

    name: str | None = Field(default=None, min_length=2, max_length=255)
    sku: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
        pattern=r"^[A-Za-z0-9\-_]+$",
    )
    description: str | None = Field(default=None, max_length=1000)
    price: Decimal | None = Field(default=None, gt=0, le=Decimal("9999999.99"))
    category: str | None = Field(default=None, max_length=100)
    image_url: str | None = Field(default=None, max_length=500)
    is_active: bool | None = None

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v: str | None) -> str | None:
        return validate_sanitized_field(v)

    @field_validator("sku")
    @classmethod
    def normalize_sku(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return v.upper()


# ── Response Schemas ─────────────────────────────────────


class ProductResponse(BaseModel):
    """Ürün detay response."""

    id: int
    name: str
    sku: str
    description: str | None = None
    price: Decimal
    category: str | None = None
    image_url: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": openapi_examples.PRODUCT_EXAMPLE
        }
    )
