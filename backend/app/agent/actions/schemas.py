"""Pending action Pydantic modelleri."""

from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .action_types import ActionType, PendingActionStatus, SafetyLevel


class AffectedResource(BaseModel):
    """Action tarafından etkilenecek kayıt referansı."""

    resource_type: str = Field(..., min_length=2, max_length=50)
    resource_id: str = Field(..., min_length=1, max_length=100)
    label: str | None = Field(default=None, max_length=255)


class ActionPreviewItem(BaseModel):
    """Admin onayı öncesi gösterilecek eski/yeni değer satırı."""

    resource_type: str = Field(..., min_length=2, max_length=50)
    resource_id: str = Field(..., min_length=1, max_length=100)
    label: str | None = Field(default=None, max_length=255)
    before: dict[str, Any] = Field(default_factory=dict)
    after: dict[str, Any] = Field(default_factory=dict)
    warning: str | None = Field(default=None, max_length=500)


class PendingAction(BaseModel):
    """Redis üzerinde TTL ile tutulan onay bekleyen action kaydı."""

    action_id: str = Field(..., min_length=8, max_length=80)
    action_type: ActionType
    user_id: int = Field(..., gt=0)
    role: str = Field(..., min_length=2, max_length=50)
    session_id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=2, max_length=255)
    summary: str = Field(..., min_length=2, max_length=1000)
    payload: dict[str, Any] = Field(default_factory=dict)
    status: PendingActionStatus = PendingActionStatus.PENDING
    requires_confirmation: bool = True
    created_at: datetime
    expires_at: datetime
    safety_level: SafetyLevel = SafetyLevel.MEDIUM
    affected_resources: list[AffectedResource] = Field(default_factory=list)
    preview: list[ActionPreviewItem] = Field(default_factory=list)
    reason: str = Field(..., min_length=2, max_length=1000)

    model_config = ConfigDict(use_enum_values=True)

    def is_expired(self, now: datetime | None = None) -> bool:
        """Action TTL süresini aşmış mı kontrol eder."""
        current = now or datetime.now(tz=UTC)
        expires_at = self.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        return current >= expires_at


class PendingActionGroup(BaseModel):
    """Birden fazla action'ı gruplayarak onay mekanizmasını tekilleştirir."""

    group_id: str = Field(..., min_length=8, max_length=80)
    user_id: int = Field(..., gt=0)
    session_id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=2, max_length=255)
    summary: str = Field(..., min_length=2, max_length=1000)
    status: PendingActionStatus = PendingActionStatus.PENDING
    safety_level: SafetyLevel = SafetyLevel.MEDIUM
    action_count: int = Field(..., ge=1)
    actions: list[PendingAction] = Field(default_factory=list)
    requires_confirmation: bool = True
    created_at: datetime
    expires_at: datetime

    model_config = ConfigDict(use_enum_values=True)

    def is_expired(self, now: datetime | None = None) -> bool:
        """Group TTL süresini aşmış mı kontrol eder."""
        current = now or datetime.now(tz=UTC)
        expires_at = self.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        return current >= expires_at


class ProductPriceUpdateItem(BaseModel):
    """Ürün fiyat değişikliği execute payload satırı."""

    product_id: int = Field(..., gt=0)
    expected_old_price: Decimal = Field(..., gt=0)
    new_price: Decimal = Field(..., gt=0)
    change_percent: Decimal


class ProductPriceBulkUpdatePayload(BaseModel):
    """Toplu fiyat güncelleme payload'u."""

    items: list[ProductPriceUpdateItem] = Field(..., min_length=1)


class OrderStatusUpdatePayload(BaseModel):
    """Sipariş status güncelleme payload'u."""

    order_id: int = Field(..., gt=0)
    order_number: str = Field(..., min_length=1, max_length=100)
    expected_old_status: str = Field(..., min_length=1, max_length=50)
    new_status: str = Field(..., min_length=1, max_length=50)
    reason: str | None = Field(default=None, max_length=255)


class InventoryThresholdUpdateItem(BaseModel):
    """Inventory threshold güncelleme payload satırı."""

    product_id: int = Field(..., gt=0)
    expected_current_threshold: int = Field(..., ge=0)
    new_threshold: int = Field(..., ge=0)
    current_quantity: int = Field(..., ge=0)


class InventoryThresholdUpdatePayload(BaseModel):
    """Inventory threshold bulk payload'u."""

    items: list[InventoryThresholdUpdateItem] = Field(..., min_length=1)


class InventoryQuantityUpdateItem(BaseModel):
    """Inventory quantity güncelleme payload satırı."""

    product_id: int = Field(..., gt=0)
    expected_current_quantity: int = Field(..., ge=0)
    new_quantity: int = Field(..., ge=0)
    current_threshold: int = Field(..., ge=0)


class InventoryQuantityUpdatePayload(BaseModel):
    """Inventory quantity bulk payload'u."""

    items: list[InventoryQuantityUpdateItem] = Field(..., min_length=1)


class ShipmentRefreshPayload(BaseModel):
    """Kargo yenileme payload'u."""

    tracking_numbers: list[str] = Field(..., min_length=1)

    @field_validator("tracking_numbers")
    @classmethod
    def normalize_tracking_numbers(cls, value: list[str]) -> list[str]:
        return [item.strip().upper() for item in value if item and item.strip()]


class NotificationMarkReadPayload(BaseModel):
    """Bildirimleri okundu yapma payload'u."""

    notification_ids: list[int] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_has_notifications(self) -> "NotificationMarkReadPayload":
        if not self.notification_ids:
            raise ValueError("Okundu yapılacak bildirim belirtilmedi.")
        return self
