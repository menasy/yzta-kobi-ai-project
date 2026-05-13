# models/__init__.py
# Tüm modeller burada export edilmeli ki Alembic Base.metadata üzerinden 
# hepsini görebilsin ve otomatik migration üretebilsin.

from app.db.base import Base
from .user import User
from .user_address import UserAddress
from .customer import Customer
from .product import Product
from .inventory import Inventory
from .inventory_movement import InventoryMovement
from .order import Order
from .order_item import OrderItem
from .order_status_history import OrderStatusHistory
from .shipment import Shipment
from .shipment_event import ShipmentEvent
from .conversation import Conversation
from .conversation_message import ConversationMessage
from .notification import Notification
from .audit_log import AuditLog

__all__ = [
    "Base",
    "User",
    "UserAddress",
    "Customer",
    "Product",
    "Inventory",
    "InventoryMovement",
    "Order",
    "OrderItem",
    "OrderStatusHistory",
    "Shipment",
    "ShipmentEvent",
    "Conversation",
    "ConversationMessage",
    "Notification",
    "AuditLog",
]
