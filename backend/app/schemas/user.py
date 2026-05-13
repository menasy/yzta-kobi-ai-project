# schemas/user.py
# Kullanıcı self-service profil ve varsayılan teslimat adresi schema'ları.

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core import openapi_examples

from .common import ShippingAddressBase, validate_sanitized_field


class UserProfileUpdate(BaseModel):
    """PATCH /api/user/profile isteği."""

    full_name: str | None = Field(default=None, min_length=2, max_length=255, description="Kullanıcı adı soyadı")

    @field_validator("full_name")
    @classmethod
    def sanitize_full_name(cls, value: str | None) -> str | None:
        return validate_sanitized_field(value)

    model_config = ConfigDict(
        extra="ignore",
        json_schema_extra={"example": openapi_examples.USER_PROFILE_UPDATE_EXAMPLE},
    )


class UserProfileResponse(BaseModel):
    """Kullanıcı profil response'u. Hassas alan içermez."""

    id: int
    email: str
    full_name: str | None = None
    role: str
    is_active: bool
    last_login_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={"example": openapi_examples.USER_PROFILE_EXAMPLE},
    )


class UserAddressUpsert(ShippingAddressBase):
    """PUT /api/user/address isteği."""

    model_config = ConfigDict(
        extra="ignore",
        json_schema_extra={"example": openapi_examples.USER_ADDRESS_UPSERT_EXAMPLE},
    )


class UserAddressResponse(ShippingAddressBase):
    """Kullanıcının varsayılan teslimat adresi response'u."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={"example": openapi_examples.USER_ADDRESS_EXAMPLE},
    )
