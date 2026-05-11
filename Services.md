# KOBİ Agent API Servis Referansı

Bu doküman, KOBİ Agent projesi frontend geliştirmesi için gerekli tüm backend endpointlerini, request/response yapılarını ve kurallarını içerir.

---

## 💡 Genel Kurallar ve Bilgiler

### 1. API Yanıt Formatı (Envelope)
Tüm başarılı ve hatalı yanıtlar aşağıdaki standart `ApiResponse` sarmalayıcısı (envelope) ile döner:

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
- **key**: Frontend tarafında i18n veya mantıksal kontrol için kullanılabilecek benzersiz anahtar (Ör: `NOT_FOUND`, `INVALID_CREDENTIALS`).
- **message**: Kullanıcıya gösterilebilecek dostane mesaj.
- **data**: Asıl içerik. Liste, nesne veya null olabilir.
- **errors**: Validasyon hataları için detaylı liste (Ör: `[{"field": "email", "message": "Geçersiz format"}]`).

### 2. Kimlik Doğrulama (Cookie-Based Auth)
Bu proje **strictly HttpOnly Cookie** tabanlı JWT kullanır.
- **Token Dönmez**: Login veya Register sonrasında frontend'e asla token string'i dönmez.
- **Cookie Yönetimi**: Tarayıcı `access_token` ve `refresh_token` cookie'lerini otomatik saklar.
- **İstek Ayarları**: Tüm API isteklerinde `credentials: "include"` (veya Axios için `withCredentials: true`) ayarı **zorunludur**.
- **Auth Durumları**:
  - `Public`: Giriş gerektirmez.
  - `CurrentUser`: Herhangi bir giriş yapmış kullanıcı.
  - `Admin`: Sadece `role: "admin"` olan kullanıcılar.

---

## 1. Kimlik Doğrulama Servisi (`auth`)

| Method | URL | Auth | Domain | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Public | Auth | Yeni kullanıcı kaydı oluşturur. |
| POST | `/api/auth/login` | Public | Auth | Kullanıcı girişi yapar ve cookie set eder. |
| POST | `/api/auth/refresh` | Public | Auth | Refresh token ile oturumu yeniler. |
| POST | `/api/auth/logout` | Public | Auth | Oturumu kapatır ve cookie'leri siler. |
| GET | `/api/auth/me` | CurrentUser | Auth | Mevcut kullanıcının profil bilgilerini getirir. |

### POST /api/auth/login
- **Request Body**:
  ```json
  { "email": "admin@kobi.local", "password": "password" }
  ```
- **Success Response (200)**: `data: null` (Cookie'ler set edilir).
- **Frontend Notu**: Giriş sonrası `/api/auth/me` çağrılarak kullanıcı rolü ve bilgileri alınmalıdır.

### GET /api/auth/me
- **Response `data` Tipi**: `UserResponse`
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Ahmet Yılmaz",
    "role": "admin", // "admin" veya "customer"
    "is_active": true,
    "created_at": "2024-05-10T..."
  }
  ```

---

## 2. Ürün Yönetimi Servisi (`products`)

| Method | URL | Auth | Domain | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/products/` | Admin | Products | Tüm ürünleri listeler. |
| POST | `/api/products/` | Admin | Products | Yeni ürün ekler. |
| GET | `/api/products/low-stock` | Admin | Products | Kritik stoktaki ürünleri getirir. |
| PUT | `/api/products/{id}` | Admin | Products | Ürün bilgilerini günceller. |
| DELETE | `/api/products/{id}` | Admin | Products | Ürünü sistemden siler. |

- **Frontend Notu**: Bu endpoint'lerin tamamı şuan sadece **Admin** erişimine açıktır. Müşteri tarafı ürün listesi için AI Agent veya özel bir "shop" endpoint'i (planlanıyor) kullanılacaktır.

---

## 3. Sipariş Yönetimi Servisi (`orders`)

| Method | URL | Auth | Domain | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/orders` | CurrentUser | Orders | Direct Checkout: Yeni sipariş oluşturur. |
| GET | `/api/orders/my` | CurrentUser | Orders | Kullanıcının kendi sipariş geçmişi. |
| GET | `/api/orders/my/{id}` | CurrentUser | Orders | Kendi siparişinin detayı. |
| GET | `/api/orders` | Admin | Orders | [Admin] Tüm siparişleri listele. |
| GET | `/api/orders/{id}` | Admin | Orders | [Admin] Herhangi bir sipariş detayı. |
| PATCH | `/api/orders/{id}/status`| Admin | Orders | [Admin] Sipariş durumunu güncelle. |
| GET | `/api/orders/summary/today`| Admin | Dashboard | [Admin] Günlük satış ve sipariş özeti. |

### POST /api/orders (Direct Checkout)
- **Request Body**:
  ```json
  {
    "items": [{ "product_id": 1, "quantity": 2 }],
    "shipping": {
      "full_name": "Can Doe",
      "phone": "5551234567",
      "address": "Kadıköy, İstanbul",
      "city": "İstanbul",
      "district": "Kadıköy"
    },
    "notes": "Zile basmayın."
  }
  ```

### GET /api/orders/summary/today
- **Response `data` Tipi**: `OrderSummaryResponse`
  ```json
  {
    "total_orders": 15,
    "pending": 5,
    "processing": 3,
    "total_revenue": 4500.50
  }
  ```

---

## 4. Stok ve Envanter Servisi (`inventory`)

| Method | URL | Auth | Domain | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/inventory/` | Admin | Inventory | Tüm stok kayıtlarını listeler. |
| GET | `/api/inventory/low-stock` | Admin | Inventory | Kritik stok uyarılarını listeler. |
| PUT | `/api/inventory/{product_id}` | Admin | Inventory | Manuel stok/eşik güncellemesi. |

- **Parametreler**: `skip`, `limit` (pagination).
- **Frontend Notu**: Stok kritik seviyenin altına düştüğünde sistem otomatik olarak "Bildirimler" kısmına uyarı atar.

---

## 5. Sevkiyat Servisi (`shipments`)

| Method | URL | Auth | Domain | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/shipments/` | Admin | Shipments | Yeni kargo kaydı oluşturur. |
| GET | `/api/shipments/{tracking_number}` | Admin | Shipments | Kargo durumunu sorgular. |

- **Durum**: Güncellenmeli / Geliştirme aşamasında (Stub).
- **Frontend Notu**: Şimdilik sadece admin tarafı için temel takip desteği sunar.

---

## 6. Bildirim Servisi (`notifications`)

| Method | URL | Auth | Domain | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/notifications/` | Admin | Notifications | Tüm bildirimleri listeler. |
| GET | `/api/notifications/unread` | Admin | Notifications | Okunmamış bildirimleri getirir. |
| PATCH| `/api/notifications/{id}/read` | Admin | Notifications | Bildirimi okundu işaretler. |
| PATCH| `/api/notifications/read-all` | Admin | Notifications | Hepsini okundu işaretler. |
| GET | `/api/notifications/stream` | Admin | Notifications | **SSE Stream**: Canlı bildirim akışı. |

### GET /api/notifications/stream (SSE)
- **Açıklama**: Admin paneli için canlı bildirimler (Stok uyarısı, yeni sipariş vb.).
- **Bağlantı**: `EventSource` veya `fetch-event-source` ile bağlanılır.
- **Event Name**: `notification`
- **Data**: JSON string (Notification objesi).

---

## 7. AI Chat & Agent Servisi (`chat`)

| Method | URL | Auth | Domain | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/chat/message` | CurrentUser | Chat | Agent'a mesaj gönderir (ReAct loop). |
| GET | `/api/chat/history/{session_id}`| CurrentUser | Chat | Konuşma geçmişini getirir. |
| DELETE| `/api/chat/history/{session_id}`| CurrentUser | Chat | Geçmişi temizler. |

### POST /api/chat/message
- **Request Body**:
  ```json
  { "session_id": "user-123-xyz", "content": "En çok satan ürünüm hangisi?" }
  ```
- **Success Response**:
  ```json
  {
    "data": { "reply": "En çok satan ürününüz: Kablosuz Mouse.", "session_id": "..." }
  }
  ```

---

## 8. Sistem Endpoints

| Method | URL | Auth | Domain | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/health` | Public | Health | Servis durum kontrolü. |

---

## ⚠️ Önemli Hata Kodları (Key Listesi)

| Key | HTTP | Açıklama |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 422 | Pydantic validasyonu başarısız. |
| `UNAUTHORIZED` | 401 | Oturum yok veya geçersiz. |
| `FORBIDDEN` | 403 | Yetki yetersiz (Admin değil). |
| `NOT_FOUND` | 404 | Kayıt bulunamadı. |
| `CONFLICT` | 409 | Veri çakışması (Ör: Email kullanımda). |
| `INSUFFICIENT_STOCK`| 409 | Stok yetersiz. |
| `INTERNAL_ERROR` | 500 | Sunucu hatası. |

---

**Son Güncelleme**: 2026-05-11
**Dokümantasyon Durumu**: Eksiksiz / Koddan Doğrulandı.
