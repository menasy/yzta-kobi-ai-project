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
    ConversationMessageResponse,
    ConversationResponse,
    ConversationWithMessagesResponse,
    CreateConversationRequest,
)
from .common import (
    IdResponse,
    MessageResponse,
    PaginationParams,
    ShippingAddressBase,
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
from .user import (
    UserAddressResponse,
    UserAddressUpsert,
    UserProfileResponse,
    UserProfileUpdate,
)

__all__ = [
    # Auth
    "LoginRequest",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "ChangePasswordRequest",
    "UserProfileUpdate",
    "UserProfileResponse",
    "UserAddressUpsert",
    "UserAddressResponse",
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
    "ConversationMessageResponse",
    "ConversationWithMessagesResponse",
    "CreateConversationRequest",
    # Common
    "PaginationParams",
    "ShippingAddressBase",
    "TimestampResponseMixin",
    "IdResponse",
    "MessageResponse",
    "sanitize_html",
]
