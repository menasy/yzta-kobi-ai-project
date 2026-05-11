# schemas/__init__.py
# Tüm Pydantic schema'larını merkezi olarak export eder.
# Endpoint'ler ve service'ler bu dosyadan import yapabilir.

from .auth import (
    ChangePasswordRequest,
    LoginRequest,
    UserCreate,
    UserResponse,
    UserUpdate,
)
from .chat import (
    ChatMessageRequest,
    ChatResponse,
    ConversationListResponse,
    ConversationResponse,
)
from .common import (
    IdResponse,
    MessageResponse,
    PaginationParams,
    TimestampResponseMixin,
    sanitize_html,
)
from .inventory import (
    InventoryMovementCreate,
    InventoryMovementResponse,
    InventoryResponse,
    InventoryUpdate,
    InventoryWithProductResponse,
    LowStockAlertResponse,
)
from .order import (
    AdminOrderResponse,
    CustomerBriefResponse,
    CustomerOrderCreate,
    CustomerOrderItemCreate,
    CustomerOrderResponse,
    CustomerShippingCreate,
    OrderCreate,
    OrderItemCreate,
    OrderItemResponse,
    OrderListResponse,
    OrderResponse,
    OrderStatusHistoryResponse,
    OrderStatusUpdate,
    OrderSummaryResponse,
)
from .notification import (
    NotificationBase,
    NotificationCreate,
    NotificationListItem,
    NotificationMarkReadResponse,
    NotificationResponse,
)
from .product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from .shipment import (
    ShipmentCreate,
    ShipmentEventCreate,
    ShipmentEventResponse,
    ShipmentListResponse,
    ShipmentResponse,
    ShipmentStatusUpdate,
)

__all__ = [
    # Auth
    "LoginRequest",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "ChangePasswordRequest",
    # Product
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    # Order
    "CustomerOrderItemCreate",
    "CustomerShippingCreate",
    "CustomerOrderCreate",
    "OrderItemCreate",
    "OrderCreate",
    "OrderStatusUpdate",
    "OrderItemResponse",
    "CustomerBriefResponse",
    "CustomerOrderResponse",
    "AdminOrderResponse",
    "OrderResponse",
    "OrderListResponse",
    "OrderStatusHistoryResponse",
    "OrderSummaryResponse",
    # Notification
    "NotificationBase",
    "NotificationCreate",
    "NotificationResponse",
    "NotificationListItem",
    "NotificationMarkReadResponse",
    # Inventory
    "InventoryUpdate",
    "InventoryMovementCreate",
    "InventoryResponse",
    "InventoryWithProductResponse",
    "InventoryMovementResponse",
    "LowStockAlertResponse",
    # Shipment
    "ShipmentCreate",
    "ShipmentStatusUpdate",
    "ShipmentEventCreate",
    "ShipmentEventResponse",
    "ShipmentResponse",
    "ShipmentListResponse",
    # Chat
    "ChatMessageRequest",
    "ChatResponse",
    "ConversationResponse",
    "ConversationListResponse",
    # Common
    "PaginationParams",
    "TimestampResponseMixin",
    "IdResponse",
    "MessageResponse",
    "sanitize_html",
]
