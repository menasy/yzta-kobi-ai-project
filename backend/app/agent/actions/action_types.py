"""Pending action enum ve güvenlik limitleri."""

from enum import StrEnum


class ActionType(StrEnum):
    """AI tarafından önerilip admin onayıyla çalıştırılabilen action türleri."""

    PRODUCT_PRICE_BULK_UPDATE = "product_price_bulk_update"
    ORDER_STATUS_UPDATE = "order_status_update"
    INVENTORY_THRESHOLD_UPDATE = "inventory_threshold_update"
    INVENTORY_QUANTITY_UPDATE = "inventory_quantity_update"
    SHIPMENT_REFRESH = "shipment_refresh"
    NOTIFICATION_MARK_READ = "notification_mark_read"


class PendingActionStatus(StrEnum):
    """Pending action yaşam döngüsü."""

    PENDING = "pending"
    EXECUTED = "executed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class SafetyLevel(StrEnum):
    """Kullanıcıya gösterilen risk seviyesi."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


MAX_PRODUCT_PRICE_ITEMS = 10
MAX_PRICE_CHANGE_PERCENT = 30
MAX_INVENTORY_THRESHOLD_ITEMS = 10
MAX_INVENTORY_QUANTITY_ITEMS = 5
MAX_SHIPMENT_REFRESH_ITEMS = 10
MAX_NOTIFICATION_MARK_READ_ITEMS = 50
