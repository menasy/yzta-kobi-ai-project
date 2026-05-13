# KOBİ AI Backend API Referansı (Services.md)

Bu doküman, KOBİ AI projesi backend sistemindeki tüm endpoint'leri, request/response yapılarını ve frontend entegrasyon detaylarını içerir.

---

## 1. Genel Bilgiler

### 1.1 API Yanıt Formatı (ApiResponse)
Tüm endpoint'ler standart bir sarmalayıcı (envelope) formatında yanıt döner. Frontend tarafında gelen yanıtın `data` alanına erişmeden önce `statusCode` veya `key` kontrolü yapılması önerilir.

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "İşlem başarıyla tamamlandı.",
  "data": {},
  "errors": null
}
```

- **statusCode**: HTTP durum kodu (200, 201, 400, 401, 403, 404, 422, 500).
- **key**: Hata veya başarı kodunu temsil eden sabit string (Ör: `UNAUTHORIZED`, `VALIDATION_ERROR`, `INSUFFICIENT_STOCK`).
- **message**: Kullanıcıya gösterilebilecek dostça mesaj.
- **data**: Asıl içerik (Domain bölümlerinde detaylandırılmıştır).
- **errors**: Validasyon hataları listesi (Örn: `[{"field": "email", "message": "Geçersiz format"}]`).

### 1.2 Kimlik Doğrulama (Cookie-Based Auth)
Sistem **Cookie-based JWT** kullanır.
- **Tokenlar**: `access_token` ve `refresh_token` HttpOnly cookie olarak set edilir.
- **Frontend**: İsteklerde `withCredentials: true` veya `credentials: "include"` mutlaka kullanılmalıdır.
- **Refresh**: Access token süresi dolduğunda `/api/auth/refresh` otomatik olarak veya manuel olarak çağrılabilir.

---

## 2. Kimlik Doğrulama (`/api/auth`)

### POST `/api/auth/register`
- **Açıklama**: Yeni kullanıcı kaydı oluşturur.
- **Request Body**:
  ```json
  {
    "email": "user@kobi.ai",
    "password": "strongpassword123",
    "full_name": "Ahmet Yılmaz"
  }
  ```
- **Response Data (`UserResponse`)**:
  ```json
  {
    "id": 1,
    "email": "user@kobi.ai",
    "full_name": "Ahmet Yılmaz",
    "role": "customer",
    "is_active": true,
    "created_at": "2026-05-11T12:00:00Z"
  }
  ```

### POST `/api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@kobi.ai",
    "password": "strongpassword123"
  }
  ```
- **Response Data**: `null` (Tokenlar HttpOnly cookie olarak set edilir).

### POST `/api/auth/refresh`
- **Açıklama**: Mevcut `refresh_token` cookie'sini kullanarak yeni access token set eder.
- **Request Body**: Yok.
- **Response Data**: `null`.

### POST `/api/auth/logout`
- **Açıklama**: Auth cookie'lerini temizler.
- **Response Data**: `null`.

### GET `/api/auth/me`
- **Açıklama**: Aktif kullanıcı profilini getirir.
- **Response Data**:
  ```json
  {
    "id": 1,
    "email": "user@kobi.ai",
    "full_name": "Ahmet Yılmaz",
    "role": "admin",
    "is_active": true,
    "last_login_at": "2026-05-11T15:00:00Z",
    "created_at": "2026-05-01T10:00:00Z",
    "updated_at": "2026-05-11T15:00:00Z"
  }
  ```

---

## 3. AI Agent & Chat (`/api/chat`)

### POST `/api/chat/message`
- **Açıklama**: Kullanıcı mesajını AI Agent'a iletir.
- **Request Body**:
  ```json
  {
    "session_id": "uuid-123-456",
    "content": "En çok satan 3 ürünümü listeler misin?"
  }
  ```
- **Response Data**:
  ```json
  {
    "reply": "En çok satan 3 ürününüz: 1. Mouse, 2. Klavye, 3. Monitor.",
    "session_id": "uuid-123-456"
  }
  ```

### GET `/api/chat/history/{session_id}`
- **Açıklama**: Belirli bir oturumun mesaj geçmişini getirir.
- **Response Data**:
  ```json
  {
    "session_id": "uuid-123-456",
    "messages": [
      { "role": "user", "content": "Sipariş durumum nedir?" },
      { "role": "assistant", "content": "Siparişiniz kargoya verilmiştir." }
    ]
  }
  ```

### DELETE `/api/chat/history/{session_id}`
- **Açıklama**: Oturum geçmişini Redis'ten temizler.
- **Response Data**:
  ```json
  { "session_id": "uuid-123-456" }
  ```

---

## 4. Ürün Yönetimi (`/api/products`) - [Admin]

### GET `/api/products/`
- **Açıklama**: Tüm ürünleri listeler.
- **Response Data**:
  ```json
  [
    {
      "id": 101,
      "name": "Kablosuz Mouse",
      "sku": "MS-001",
      "description": "Ergonomik tasarım",
      "price": 250.00,
      "category": "Elektronik",
      "image_url": "https://cdn.kobi.ai/img/ms001.jpg",
      "is_active": true,
      "created_at": "2026-05-10T12:00:00Z"
    }
  ]
  ```

### POST `/api/products/`
- **Request Body**:
  ```json
  {
    "name": "Yeni Ürün",
    "sku": "NEW-PRD-01",
    "price": 1500.0,
    "description": "Ürün açıklaması",
    "category": "Ev Eşyası",
    "image_url": "https://..."
  }
  ```
- **Response Data**: Oluşturulan ürün objesi (id dahil).

### PUT `/api/products/{id}`
- **Request Body**: `ProductUpdate` (Tüm alanlar opsiyonel).
- **Response Data**: Güncellenmiş ürün objesi.

### DELETE `/api/products/{id}`
- **Açıklama**: Ürünü siler.
- **Response Data**: `{ "id": 101 }`

---

## 5. Stok ve Envanter (`/api/inventory`) - [Admin]

### GET `/api/inventory/`
- **Açıklama**: Stok kayıtlarını listeler.
- **Query Params**: `page`, `size`.
- **Response Data**:
  ```json
  [
    {
      "id": 1,
      "product_id": 101,
      "quantity": 50,
      "reserved_quantity": 5,
      "available_quantity": 45,
      "low_stock_threshold": 10,
      "product_name": "Kablosuz Mouse",
      "product_sku": "MS-001"
    }
  ]
  ```

### GET `/api/inventory/low-stock`
- **Açıklama**: Kritik stok seviyesindeki ürünleri getirir.
- **Response Data**:
  ```json
  [
    {
      "product_id": 105,
      "product_name": "Klavye",
      "product_sku": "KB-001",
      "current_quantity": 3,
      "threshold": 5,
      "severity": "critical"
    }
  ]
  ```

### PUT `/api/inventory/{product_id}`
- **Request Body**:
  ```json
  {
    "quantity": 100,
    "low_stock_threshold": 15
  }
  ```
- **Response Data**: Güncel `InventoryResponse`.

---

## 6. Sipariş Yönetimi (`/api/orders`)

### 6.1 Müşteri Endpointleri (`/api/orders/my`)
- **POST `/api/orders`**: Sipariş oluşturur.
  - **Request Body**:
    ```json
    {
      "items": [{ "product_id": 101, "quantity": 2 }],
      "shipping": {
        "full_name": "Müşteri Adı",
        "phone": "05554443322",
        "address": "Açık Adres...",
        "city": "Ankara",
        "district": "Çankaya"
      },
      "notes": "Sipariş notu"
    }
    ```
- **GET `/api/orders/my`**: Kendi siparişlerini listeler.
- **GET `/api/orders/my/{order_id}`**: Sipariş detayı.

### 6.2 Yönetici Endpointleri (`/api/orders`) [Admin]
- **GET `/api/orders`**: Tüm siparişler. Filtre: `status`.
- **GET `/api/orders/{order_id}`**: Detaylı sipariş ve müşteri bilgisi.
- **PATCH `/api/orders/{order_id}/status`**:
  - **Request Body**: `{ "status": "shipped", "reason": "Kargoya verildi" }`
- **GET `/api/orders/summary/today`**:
  - **Response Data**:
    ```json
    {
      "date": "2026-05-11",
      "total_orders": 10,
      "pending": 2,
      "processing": 3,
      "shipped": 4,
      "delivered": 1,
      "total_revenue": 2500.00
    }
    ```

---

## 7. Bildirimler (`/api/notifications`) - [Admin]

### GET `/api/notifications/`
- **Response Data**: `Array<NotificationListItem>`

### GET `/api/notifications/unread`
- **Açıklama**: Okunmamış bildirimler.

### PATCH `/api/notifications/{notification_id}/read`
- **Açıklama**: Okundu işaretler.
- **Response Data**: `NotificationMarkReadResponse`

### PATCH `/api/notifications/read-all`
- **Response Data**: `{ "updated_count": 5 }`

### GET `/api/notifications/stream` (SSE)
- **Açıklama**: Canlı bildirim akışı (EventSource).
- **Event**: `notification`
- **Data**: Stringified JSON Notification objesi.

---

## 8. Sevkiyat ve Kargo (`/api/shipments`) - [Admin]

### POST `/api/shipments/`
- **Açıklama**: Kargo kaydı oluşturur.

### GET `/api/shipments/{tracking_number}`
- **Response Data**:
  ```json
  {
    "tracking_number": "TRK-001",
    "status": "in_transit",
    "location": "İstanbul Hub",
    "estimated_delivery_date": "2026-05-13"
  }
  ```

---

## 9. Sistem Sağlığı (`/health`)
- **Açıklama**: Public sağlık kontrolü.
- **Response Data**:
  ```json
  {
    "status": "ok",
    "app_name": "KOBİ Agent",
    "version": "0.1.0",
    "environment": "development"
  }
  ```

---

## Frontend Geliştirici Notları

1. **Enum Değerleri**:
   - `Order Status`: `pending`, `processing`, `shipped`, `delivered`, `cancelled`
   - `Shipment Status`: `created`, `in_transit`, `delivered`, `delayed`, `failed`, `cancelled`
   - `Notification Severity`: `info`, `warning`, `critical`
2. **Hata Yakalama**: 422 hatalarında `errors` listesi üzerinden form validasyonu yapılmalıdır.
3. **Rol Yönetimi**: `role: "admin"` dışındaki kullanıcılar `/api/products`, `/api/inventory` vb. endpointlere erişemez (403 döner).
4. **SSE Entegrasyonu**: SSE için `EventSource` kullanılırken cookie gönderimi için `withCredentials: true` eklenmelidir.

---
*Son Güncelleme: 11 Mayıs 2026*
