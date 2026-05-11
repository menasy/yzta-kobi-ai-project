# Service API Referansi

Bu dokuman, backend'deki tum aktif endpointler ve servis katmani kontratlari icin request/response type bilgisini tek yerde toplar.

---

## Genel API Response Formati (ApiResponse)

Tum JSON endpointler ortak zarfla doner:

- **statusCode**: `int`
- **key**: `str`
- **message**: `str`
- **data**: `object | array | null`
- **errors**: `array | null`

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Islem basariyla tamamlandi.",
  "data": {},
  "errors": null
}
```

## Genel Auth Notu

- Kimlik dogrulama **cookie-based** calisir (`access_token`, `refresh_token` HttpOnly cookie).
- Token body icinde donmez.
- Admin endpointleri `AdminUser`, user endpointleri `CurrentUser` ile korunur.

## Genel Hata Key'leri

- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 NOT_FOUND`
- `409 CONFLICT / INSUFFICIENT_STOCK`
- `422 VALIDATION_ERROR`
- `429 RATE_LIMIT_EXCEEDED`
- `500 INTERNAL_ERROR`

---

# 1. Sistem Endpointi

### GET /health
- **Acilama**: Uygulama saglik kontrolu.
- **Erisim**: Public
- **Request Body**: Yok
- **Response Type**: `ApiResponse[HealthResponse]`
  - `status: str`
  - `app_name: str`
  - `version: str`
  - `environment: str`
- **Hatalar**: `500`

---

# 2. Auth Endpointleri (/api/auth)

### POST /api/auth/register
- **Service Method**: `AuthService.register(data: UserCreate) -> UserResponse`
- **Request Type**: `UserCreate`
  - `email: str`
  - `password: str`
  - `full_name: str | null`
- **Response Type**: `ApiResponse[UserResponse]` (`201`)
- **Hatalar**: `409`, `422`, `500`

### POST /api/auth/login
- **Service Method**: `AuthService.login(data: LoginRequest) -> tuple[str, str]`
- **Request Type**: `LoginRequest`
  - `email: str`
  - `password: str`
- **Response Type**: `ApiResponse[null]` (`200`) + `Set-Cookie`
- **Hatalar**: `401`, `403`, `422`, `500`

### POST /api/auth/refresh
- **Service Method**: `AuthService.refresh_token(refresh_token: str) -> tuple[str, str]`
- **Cookie Input**: `refresh_token`
- **Request Body**: Yok
- **Response Type**: `ApiResponse[null]` (`200`) + `Set-Cookie`
- **Hatalar**: `401`, `403`, `500`

### POST /api/auth/logout
- **Service Method**: Cookie temizleme (`clear_auth_cookies`)
- **Request Body**: Yok
- **Response Type**: `ApiResponse[null]` (`200`) + cookie temizleme
- **Hatalar**: `500`

### GET /api/auth/me
- **Service Method**: `AuthService.get_profile(user: User) -> UserResponse`
- **Request Body**: Yok
- **Response Type**: `ApiResponse[UserResponse]`
- **Hatalar**: `401`, `403`, `500`

---

# 3. Chat / Agent Endpointleri (/api/chat)

### POST /api/chat/message
- **Service/Handler**:
  - `enforce_chat_message_rate_limit(...)`
  - `AgentOrchestrator.run(message, session_id) -> str`
- **Request Type**: `ChatMessageRequest`
  - `session_id: str`
  - `content: str`
- **Response Type**: `ApiResponse[ChatResponse]`
  - `reply: str`
  - `session_id: str`
- **Hatalar**: `401`, `422`, `429`, `500`

### GET /api/chat/history/{session_id}
- **Service/Handler**: `ConversationMemory.get_history(session_id) -> list[dict]`
- **Path Params**:
  - `session_id: str`
- **Request Body**: Yok
- **Response Type**: `ApiResponse[ChatHistoryData]`
  - `session_id: str`
  - `messages: list[dict]`
- **Hatalar**: `401`, `500`

### DELETE /api/chat/history/{session_id}
- **Service/Handler**: `ConversationMemory.clear(session_id) -> None`
- **Path Params**:
  - `session_id: str`
- **Request Body**: Yok
- **Response Type**: `ApiResponse[dict]`
  - `session_id: str`
- **Hatalar**: `401`, `500`

---

# 4. Product Endpointleri (/api/products)

Tum endpointler admin yetkisi ister.

### GET /api/products/
- **Service Method**: `ProductService.get_all_products() -> list[Product]`
- **Request Body**: Yok
- **Response Type**: `ApiResponse[list[ProductResponse]]`
- **Hatalar**: `401`, `403`, `500`

### POST /api/products/
- **Service Method**: `ProductService.create_product(product_data: ProductCreate) -> Product`
- **Request Type**: `ProductCreate`
  - `name: str`
  - `sku: str`
  - `description: str | null`
  - `price: decimal`
  - `category: str | null`
  - `image_url: str | null`
- **Response Type**: `ApiResponse[ProductResponse]` (`201`)
- **Hatalar**: `401`, `403`, `422`, `500`

### GET /api/products/low-stock
- **Service Method**: `ProductService.get_low_stock_products() -> list[Product]`
- **Request Body**: Yok
- **Response Type**: `ApiResponse[list[ProductResponse]]`
- **Hatalar**: `401`, `403`, `500`

### PUT /api/products/{id}
- **Service Method**: `ProductService.update_product(product_id: int, update_data: ProductUpdate) -> Product`
- **Path Params**:
  - `id: int`
- **Request Type**: `ProductUpdate` (tum alanlar opsiyonel)
- **Response Type**: `ApiResponse[ProductResponse]`
- **Hatalar**: `401`, `403`, `404`, `422`, `500`

### DELETE /api/products/{id}
- **Service Method**: `ProductService.delete_product(product_id: int) -> None`
- **Path Params**:
  - `id: int`
- **Request Body**: Yok
- **Response Type**: `ApiResponse[dict]`
  - `id: int`
- **Hatalar**: `401`, `403`, `404`, `500`

---

# 5. Order Endpointleri (/api/orders)

### POST /api/orders
- **Service Method**: `OrderService.create_customer_order(current_user: User, payload: CustomerOrderCreate) -> CustomerOrderResponse`
- **Erisim**: Auth required (`customer`)
- **Request Type**: `CustomerOrderCreate`
  - `items: list[CustomerOrderItemCreate]`
  - `shipping: CustomerShippingCreate`
  - `notes: str | null`
- **Response Type**: `ApiResponse[CustomerOrderResponse]` (`201`)
- **Hatalar**: `401`, `403`, `409`, `422`, `500`

### GET /api/orders/my
- **Service Method**: `OrderService.get_my_orders(current_user, skip, limit, status) -> list[CustomerOrderResponse]`
- **Erisim**: Auth required (`customer`)
- **Query Params**:
  - `skip: int = 0`
  - `limit: int = 100`
  - `status: str | null`
- **Response Type**: `ApiResponse[list[CustomerOrderResponse]]`
- **Hatalar**: `401`, `403`, `500`

### GET /api/orders/my/{order_id}
- **Service Method**: `OrderService.get_my_order_detail(current_user, order_id) -> CustomerOrderResponse`
- **Erisim**: Auth required (`customer`)
- **Path Params**:
  - `order_id: int`
- **Response Type**: `ApiResponse[CustomerOrderResponse]`
- **Hatalar**: `401`, `403`, `404`, `500`

### GET /api/orders
- **Service Method**: `OrderService.get_admin_orders(skip, limit, status) -> list[AdminOrderResponse]`
- **Erisim**: Admin
- **Query Params**:
  - `skip: int = 0`
  - `limit: int = 100`
  - `status: str | null`
- **Response Type**: `ApiResponse[list[AdminOrderResponse]]`
- **Hatalar**: `401`, `403`, `500`

### GET /api/orders/summary/today
- **Service Method**: `OrderService.get_today_summary() -> dict[str, object]`
- **Erisim**: Admin
- **Request Body**: Yok
- **Response Type**: `ApiResponse[OrderSummaryResponse]`
- **Hatalar**: `401`, `403`, `500`

### GET /api/orders/{order_id}
- **Service Method**: `OrderService.get_admin_order_detail(order_id) -> AdminOrderResponse`
- **Erisim**: Admin
- **Path Params**:
  - `order_id: int`
- **Response Type**: `ApiResponse[AdminOrderResponse]`
- **Hatalar**: `401`, `403`, `404`, `500`

### PATCH /api/orders/{order_id}/status
- **Service Method**: `OrderService.update_order_status(order_id, payload, changed_by_user) -> AdminOrderResponse`
- **Erisim**: Admin
- **Path Params**:
  - `order_id: int`
- **Request Type**: `OrderStatusUpdate`
  - `status: str`
  - `reason: str | null`
- **Response Type**: `ApiResponse[AdminOrderResponse]`
- **Hatalar**: `401`, `403`, `404`, `422`, `500`

---

# 6. Inventory Endpointleri (/api/inventory)

Tum endpointler admin yetkisi ister.

### GET /api/inventory/
- **Service Method**: `InventoryService.get_all_with_product(skip, limit) -> list[Inventory]`
- **Query Params**:
  - `skip: int = 0`
  - `limit: int = 100`
- **Response Type**: `ApiResponse[list[InventoryWithProductResponse]]`
- **Hatalar**: `401`, `403`, `500`

### GET /api/inventory/low-stock
- **Service Method**: `InventoryService.get_low_stock_items() -> list[Inventory]`
- **Request Body**: Yok
- **Response Type**: `ApiResponse[list[InventoryResponse]]`
- **Hatalar**: `401`, `403`, `500`

### PUT /api/inventory/{product_id}
- **Service Method**: `InventoryService.update_stock(product_id, quantity, low_stock_threshold) -> Inventory`
- **Path Params**:
  - `product_id: int`
- **Request Type**: `InventoryUpdate`
  - `quantity: int | null`
  - `low_stock_threshold: int | null`
- **Response Type**: `ApiResponse[InventoryResponse]`
- **Hatalar**: `401`, `403`, `404`, `422`, `500`

---

# 7. Notification Endpointleri (/api/notifications)

Tum endpointler admin yetkisi ister.

### GET /api/notifications/
- **Service Method**: `NotificationService.list_notifications(skip, limit) -> list[Notification]`
- **Query Params**:
  - `skip: int = 0`
  - `limit: int = 50`
- **Response Type**: `ApiResponse[list[NotificationListItem]]`
- **Hatalar**: `401`, `403`, `500`

### GET /api/notifications/unread
- **Service Method**: `NotificationService.list_unread(skip, limit) -> list[Notification]`
- **Query Params**:
  - `skip: int = 0`
  - `limit: int = 50`
- **Response Type**: `ApiResponse[list[NotificationListItem]]`
- **Hatalar**: `401`, `403`, `500`

### PATCH /api/notifications/{notification_id}/read
- **Service Method**: `NotificationService.mark_read(notification_id) -> Notification`
- **Path Params**:
  - `notification_id: int`
- **Request Body**: Yok
- **Response Type**: `ApiResponse[NotificationMarkReadResponse]`
- **Hatalar**: `401`, `403`, `404`, `500`

### PATCH /api/notifications/read-all
- **Service Method**: `NotificationService.mark_all_read() -> int`
- **Request Body**: Yok
- **Response Type**: `ApiResponse[dict]`
  - `updated_count: int`
- **Hatalar**: `401`, `403`, `500`

### GET /api/notifications/stream
- **Handler**: Redis Pub/Sub uzerinden SSE stream
- **Request Body**: Yok
- **Response Type**: `text/event-stream`
- **Hatalar**: `401`, `403`, `500`

---

# 8. Shipment Endpointleri (/api/shipments)

Tum endpointler admin yetkisi ister.

### POST /api/shipments/
- **Acilama**: Sevkiyat olusturma (stub).
- **Request Body**: Yok
- **Response Type**: `ApiResponse[null]`
- **Hatalar**: `401`, `403`, `500`

### GET /api/shipments/{tracking_number}
- **Acilama**: Takip numarasina gore kargo durumu.
- **Path Params**:
  - `tracking_number: str`
- **Request Body**: Yok
- **Response Type**: `ApiResponse[dict]`
  - `tracking_number: str`
  - `location: str`
- **Hatalar**: `401`, `403`, `500`

---

# 9. Servis Katmani Kontratlari (Tum Servisler)

## AuthService
- `register(data: UserCreate) -> UserResponse`
- `login(data: LoginRequest) -> tuple[str, str]`
- `refresh_token(refresh_token: str) -> tuple[str, str]`
- `get_profile(user: User) -> UserResponse`

## ProductService
- `get_all_products() -> list[Product]`
- `create_product(product_data: ProductCreate) -> Product`
- `get_low_stock_products() -> list[Product]`
- `update_product(product_id: int, update_data: ProductUpdate) -> Product`
- `delete_product(product_id: int) -> None`

## OrderService
- `create_customer_order(current_user: User, payload: CustomerOrderCreate) -> CustomerOrderResponse`
- `get_my_orders(current_user: User, skip: int = 0, limit: int = 100, status: str | None = None) -> list[CustomerOrderResponse]`
- `get_my_order_detail(current_user: User, order_id: int) -> CustomerOrderResponse`
- `get_admin_orders(skip: int = 0, limit: int = 100, status: str | None = None) -> list[AdminOrderResponse]`
- `get_admin_order_detail(order_id: int) -> AdminOrderResponse`
- `update_order_status(order_id: int, payload: OrderStatusUpdate, changed_by_user: User) -> AdminOrderResponse`
- `get_today_summary() -> dict[str, object]`

## InventoryService
- `get_by_product_id(product_id: int) -> Inventory`
- `update_stock(product_id: int, quantity: int | None = None, low_stock_threshold: int | None = None) -> Inventory`
- `validate_and_deduct_stock_for_order(order_id: int, items: Mapping[int, int], created_by_user_id: int | None = None) -> dict[int, Product]`
- `get_low_stock_items() -> list[Inventory]`
- `get_all_with_product(skip: int = 0, limit: int = 100) -> list[Inventory]`

## NotificationService
- `create_low_stock_notification(product_id: int, product_name: str, sku: str, current_quantity: int, threshold: int) -> Notification | None`
- `list_notifications(skip: int = 0, limit: int = 50) -> list[Notification]`
- `list_unread(skip: int = 0, limit: int = 50) -> list[Notification]`
- `mark_read(notification_id: int) -> Notification`
- `mark_all_read() -> int`

## InventoryQueryService (Agent tool read-only)
- `check_product_stock(product_name: str) -> dict`
- `get_low_stock_report() -> list[dict]`

## OrderQueryService (Agent tool read-only)
- `get_order_detail(order_id: int) -> dict`
- `get_orders_by_phone(phone: str, limit: int = 5) -> list[dict]`

## CargoQueryService (Agent tool read-only)
- `get_cargo_status(tracking_number: str) -> dict`

## ChatHistoryService
- `add_message(session_id: str, role: str, content: str) -> None`
- `get_history(session_id: str) -> list[dict]`
- `clear_history(session_id: str) -> None`

## RedisService
- `set_value(key: str, value: str, expire: int = 3600) -> None`
- `get_value(key: str) -> str | None`
- `delete_value(key: str) -> None`
- `incr_with_expire(key: str, expire: int) -> int`

## Notification Publisher
- `publish_notification_event(notification_data: dict[str, Any]) -> None`

---

## Kaynak Dosyalar
- `backend/app/main.py`
- `backend/app/api/router.py`
- `backend/app/api/endpoints/*.py`
- `backend/app/services/*.py`
- `backend/app/schemas/*.py`
- `backend/app/core/response_builder.py`
- `backend/app/core/responses.py`

---

## Yeni Servisler

Onceki `Services.md` surumune gore yeni eklenen veya path'i degisen endpointler:

1. **GET /health**
2. **POST /api/auth/register**
3. **POST /api/auth/login**
4. **POST /api/auth/refresh**
5. **POST /api/auth/logout**
6. **GET /api/auth/me**
7. **POST /api/orders**
8. **GET /api/orders/my**
9. **GET /api/orders/my/{order_id}**
10. **PATCH /api/orders/{order_id}/status**
11. **GET /api/inventory/**
12. **PUT /api/inventory/{product_id}** (eski `/api/inventory/update-stock` yerine)
13. **GET /api/notifications/**
14. **GET /api/notifications/unread**
15. **PATCH /api/notifications/{notification_id}/read**
16. **PATCH /api/notifications/read-all**
17. **GET /api/notifications/stream**
18. **GET /api/chat/history/{session_id}** (eski path revize)
19. **DELETE /api/chat/history/{session_id}**

Onceki surume gore yeni/guncel servis kontratlari (dokumanda eklenen):

1. `RedisService.incr_with_expire(...)`
2. `ProductService.get_low_stock_products(...)`
3. `OrderService.create_customer_order(...)`
4. `OrderService.get_my_orders(...)`
5. `OrderService.get_my_order_detail(...)`
6. `OrderService.get_admin_orders(...)`
7. `OrderService.get_admin_order_detail(...)`
8. `OrderService.update_order_status(...)`
9. `OrderService.get_today_summary(...)`
10. `InventoryService.get_all_with_product(...)`
11. `NotificationService.list_unread(...)`
12. `NotificationService.mark_all_read(...)`

