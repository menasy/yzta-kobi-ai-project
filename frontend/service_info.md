# Service API Referansı

Bu doküman, KOBİ Agent backend sistemindeki tüm işlevsel endpointlerin (Ürünler, AI Chat, Siparişler, Stok vb.) istek (request) ve yanıt (response) yapılarını içerir. Kimlik doğrulama endpointleri için [auth.md](file:///home/menasy/Desktop/backend-kobi/backend/md/auth.md) dosyasına bakınız.

---

## Genel: API Yanıt Formatı (ApiResponse)

Tüm endpointler (`app/core/responses.py -> ApiResponse`) ortak sarmalayıcıyla yanıt döner:

- **statusCode**: integer (HTTP durum kodu)
- **key**: string (Hata veya başarı anahtarı, ör: SUCCESS, NOT_FOUND)
- **message**: string (Kullanıcı dostu mesaj)
- **data**: object | array | null (Asıl verinin bulunduğu alan)
- **errors**: array | null (Validasyon hataları listesi)

---

# 1. AI Chat Endpoints (`/api/ai`)

Yapay zeka asistanı ile etkileşim kurmak için kullanılır.

### POST /api/ai/chat
- **Açıklama**: Kullanıcının doğal dil mesajına AI yanıtı üretir.
- **Erişim**: Auth Cookie Gereklidir.
- **Request (JSON)**:
  - `message`: string (Zorunlu)
  
**Örnek İstek**:
```json
{
  "message": "En çok satan 3 ürünümü listeler misin?"
}
```

- **Başarılı Yanıt (200)**:
```json
{
  "statusCode": 200,
  "key": "AI_CHAT_SUCCESS",
  "message": "AI yanıtı başarıyla oluşturuldu.",
  "data": {
    "response": "En çok satan 3 ürününüz: 1. Kablosuz Mouse, 2. Klavye, 3. USB-C Adaptör."
  },
  "errors": null
}
```

- **Hatalar**:
  - `401 UNAUTHORIZED`: Geçersiz veya eksik oturum.
  - `502 AI_PROVIDER_ERROR`: AI sağlayıcısından (Gemini vb.) yanıt alınamadı.

---

# 2. Ürün Yönetimi (`/api/products`)

### GET /api/products/
- **Açıklama**: Sistemdeki tüm ürünleri listeler.
- **Yanıt (200)**: `data` alanında ürün listesi döner.

### POST /api/products/
- **Açıklama**: Yeni bir ürün ekler.
- **Request Schema**: `ProductCreate`
  - `name`: string (2-255 karakter)
  - `sku`: string (Büyük harfe normalize edilir, benzersiz)
  - `price`: decimal (> 0)
  - `description`: string | null (HTML sanitize edilir)
  - `category`: string | null

**Örnek Yanıt (201)**:
```json
{
  "statusCode": 201,
  "key": "SUCCESS",
  "message": "Ürün başarıyla oluşturuldu.",
  "data": {
    "id": 101,
    "name": "Kablosuz Mouse",
    "sku": "MS-001",
    "price": 250.00,
    "category": "Elektronik",
    "is_active": true,
    "created_at": "2024-05-10T15:00:00Z"
  },
  "errors": null
}
```

### GET /api/products/low-stock
- **Açıklama**: Kritik stok seviyesindeki ürünleri getirir.

### PUT /api/products/{id}
- **Açıklama**: Mevcut bir ürünü günceller (Sadece gönderilen alanlar güncellenir).

### DELETE /api/products/{id}
- **Açıklama**: Ürünü siler.

---

# 3. Sipariş Yönetimi (`/api/orders`)

### GET /api/orders/
- **Açıklama**: Siparişlerin listesini döner.

### GET /api/orders/summary/today
- **Açıklama**: Günlük sipariş ve gelir özetini döner.
- **Yanıt Verisi**: `{ "total_orders": int, "revenue": float }`

### GET /api/orders/{order_id}
- **Açıklama**: Siparişin detaylı bilgilerini getirir.

---

# 4. Stok ve Envanter (`/api/inventory`)

### GET /api/inventory/low-stock
- **Açıklama**: Stok uyarılarını listeler.

### PUT /api/inventory/update-stock
- **Açıklama**: Toplu stok güncellemesi yapar.

---

# 5. Sevkiyat ve Kargo (`/api/shipments`)

### POST /api/shipments/
- **Açıklama**: Yeni bir kargo/sevkiyat kaydı oluşturur.

### GET /api/shipments/{tracking_number}
- **Açıklama**: Takip numarası ile kargo durumu sorgular.
- **Yanıt Verisi**: `{ "tracking_number": string, "location": string }`

---

# 6. Mesajlaşma (Legacy Chat) (`/api/chat`)

### POST /api/chat/message
- **Açıklama**: Basit mesaj gönderimi.

### GET /api/chat/history
- **Açıklama**: Mesaj geçmişini getirir.

---

## Kaynak Dosyalar
- **AI Endpoints**: `backend/app/api/endpoints/ai_chat.py`
- **Product Endpoints**: `backend/app/api/endpoints/products.py`
- **Order Endpoints**: `backend/app/api/endpoints/orders.py`
- **Inventory Endpoints**: `backend/app/api/endpoints/inventory.py`
- **Shipment Endpoints**: `backend/app/api/endpoints/shipments.py`
- **Schemas**: `backend/app/schemas/`
- **Response Builder**: `backend/app/core/response_builder.py`
