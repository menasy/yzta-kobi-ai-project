# schemas/auth.py
# Kimlik doğrulama ve kullanıcı yönetimi schema'ları.
# Password/hash gibi hassas alanlar response schema'larında dönmez.

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core import openapi_examples

from .common import USER_ROLES, validate_sanitized_field, validate_status

# ── Request Schemas ──────────────────────────────────────


class LoginRequest(BaseModel):
    """POST /auth/login isteği."""

    email: str = Field(
        ...,
        min_length=5,
        max_length=255,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        description="Kullanıcı e-posta adresi",
    )
    password: str = Field(..., min_length=6, max_length=128, description="Kullanıcı şifresi")

    model_config = {"json_schema_extra": {"example": openapi_examples.LOGIN_REQUEST_EXAMPLE}}


class UserCreate(BaseModel):
    """POST /auth/register isteği."""

    email: str = Field(
        ...,
        min_length=5,
        max_length=255,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        description="Benzersiz e-posta adresi",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="En az 8 karakter, güçlü şifre",
    )
    full_name: str | None = Field(default=None, min_length=2, max_length=255)

    @field_validator("full_name")
    @classmethod
    def sanitize_full_name(cls, v: str | None) -> str | None:
        return validate_sanitized_field(v)

    model_config = ConfigDict(
        extra="ignore",
        json_schema_extra={"example": openapi_examples.REGISTER_REQUEST_EXAMPLE},
    )


class UserUpdate(BaseModel):
    """PUT /auth/users/{id} isteği — tüm alanlar opsiyonel."""

    email: str | None = Field(
        default=None,
        max_length=255,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
    )
    full_name: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=128)
    role: str | None = Field(default=None, max_length=50)
    is_active: bool | None = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validate_status(v, USER_ROLES, "rol")

    @field_validator("full_name")
    @classmethod
    def sanitize_full_name(cls, v: str | None) -> str | None:
        return validate_sanitized_field(v)


class ChangePasswordRequest(BaseModel):
    """Şifre değiştirme isteği."""

    current_password: str = Field(..., min_length=6, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)


# ── Response Schemas ─────────────────────────────────────


class UserResponse(BaseModel):
    """Kullanıcı bilgisi response — hassas alan dönmez."""

    id: int
    email: str
    full_name: str | None = None
    role: str
    is_active: bool
    last_login_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, json_schema_extra={"example": openapi_examples.USER_EXAMPLE})
