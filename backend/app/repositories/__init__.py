# repositories/__init__.py
# Tüm repository sınıflarını merkezi olarak export eder.

from .audit_log_repository import AuditLogRepository
from .base import BaseRepository
from .conversation_message_repository import ConversationMessageRepository
from .conversation_repository import ConversationRepository
from .customer_repository import CustomerRepository
from .inventory_movement_repository import InventoryMovementRepository
from .inventory_repository import InventoryRepository
from .notification_repository import NotificationRepository
from .order_item_repository import OrderItemRepository
from .order_repository import OrderRepository
from .order_status_history_repository import OrderStatusHistoryRepository
from .product_repository import ProductRepository
from .shipment_event_repository import ShipmentEventRepository
from .shipment_repository import ShipmentRepository
from .user_address_repository import UserAddressRepository
from .user_repository import UserRepository

__all__ = [
    "BaseRepository",
    "UserRepository",
    "UserAddressRepository",
    "CustomerRepository",
    "ProductRepository",
    "InventoryRepository",
    "InventoryMovementRepository",
    "OrderRepository",
    "OrderItemRepository",
    "OrderStatusHistoryRepository",
    "ShipmentRepository",
    "ShipmentEventRepository",
    "ConversationRepository",
    "ConversationMessageRepository",
    "NotificationRepository",
    "AuditLogRepository",
]
