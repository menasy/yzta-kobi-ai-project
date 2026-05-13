# Backend Request Flow — Katmanlı Akış Dokümanı

Bu doküman, KOBİ AI Agent backend mimarisinde bir HTTP request'in sisteme girişinden response olarak client'a dönmesine kadar geçtiği tüm katmanları açıklar.

Amaç:

- Hangi katmanın ne yaptığını netleştirmek
- Validation, XSS, SQL Injection, Auth, Business Rule ve Error Handling akışını standartlaştırmak
- Backend geliştirilirken AI ajanının ve geliştiricinin aynı mimari kuralları takip etmesini sağlamak

---

## 1. Genel Akış

```txt
Client Request
   ↓
Middleware Layer
   ↓
API Layer / Endpoint
   ↓
Pydantic Validation
   ↓
XSS Sanitization
   ↓
Auth / Role Check
   ↓
Service Layer
   ↓
Business Validation
   ↓
Repository Layer
   ↓
SQLAlchemy ORM
   ↓
PostgreSQL
   ↓
Repository Result
   ↓
Service Result
   ↓
Response Builder
   ↓
Middleware Response Processing
   ↓
Client Response
```

Bu mimaride temel kural şudur:

```txt
API Layer       → Service Layer'ı çağırır
Service Layer   → Repository Layer'ı çağırır
Repository      → SQLAlchemy ile DB'ye erişir
Agent Tool      → Service Layer'ı çağırır
```

Aşağıdaki erişimler yasaktır:

```txt
API Layer       → Repository'e doğrudan erişemez
API Layer       → DB session göremez
Service Layer   → HTTP request/response objesi göremez
Service Layer   → SQL sorgusu yazamaz
Repository      → Business logic içeremez
Agent Tool      → Repository'e doğrudan erişemez
```

---

## 2. Örnek Request

Örnek endpoint:

```http
POST /api/orders
Content-Type: application/json
```

Örnek body:

```json
{
  "customer_name": "Ahmet Yılmaz",
  "customer_phone": "05321234567",
  "items": [
    {
      "product_id": 5,
      "quantity": 2
    }
  ],
  "notes": "<script>alert('xss')</script> hızlı gönderilsin"
}
```

Bu request aşağıdaki katmanlardan geçerek işlenir.

---

# 3. Middleware Layer

Middleware katmanı, request sisteme girer girmez çalışan ilk katmandır.

## 3.1 Görevleri

```txt
Request ID üretmek
Request süresini ölçmek
CORS kontrolü yapmak
Security header eklemek
Request/response loglamak
```

## 3.2 Bu katmanda bulunan yapılar

```txt
RequestIDMiddleware
CORSMiddleware
SecurityHeadersMiddleware
Logging setup
```

## 3.3 RequestIDMiddleware

Her request'e benzersiz bir `request_id` atanır.

Bu ID:

- `request.state.request_id` içine yazılır
- Response header olarak client'a döner
- Log satırlarına eklenir
- Hata takibini kolaylaştırır

Örnek response header:

```http
X-Request-ID: 7f3c9e2a-4d9e-4b8a-9a2e-111222333444
```

## 3.4 SecurityHeadersMiddleware

Her response'a güvenlik header'ları eklenir.

Örnek:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

## 3.5 Bu katmanda yapılmaması gerekenler

Middleware içinde şu işlemler yapılmaz:

```txt
Sipariş oluşturma
Stok kontrolü
Kullanıcı business yetkisi kontrolü
DB sorgusu
LLM çağrısı
Response formatlama
```

Middleware yalnızca HTTP seviyesindeki ortak işlemlerden sorumludur.

---

# 4. API Layer / Endpoint Layer

API layer, route'ların bulunduğu katmandır.

Örnek dosya:

```txt
app/api/endpoints/orders.py
```

## 4.1 Görevleri

```txt
Route tanımlamak
Request body'yi Pydantic schema ile almak
Dependency injection ile service almak
Auth dependency çalıştırmak
Service metodunu çağırmak
Sonucu success_response ile döndürmek
```

## 4.2 Örnek endpoint

```python
@router.post("/orders")
async def create_order(
    payload: OrderCreate,
    current_user: User = Depends(get_admin_user),
    order_service: OrderService = Depends(get_order_service),
):
    order = await order_service.create_order(payload)

    return success_response(
        data=order,
        message="Sipariş başarıyla oluşturuldu.",
        status_code=201,
    )
```

## 4.3 API layer'da yapılmaması gerekenler

```txt
SQLAlchemy sorgusu yazılmaz
Repository import edilmez
DB session kullanılmaz
Business logic yazılmaz
LLM SDK çağrılmaz
Her endpoint'te try/except yazılmaz
Ham dict response dönülmez
```

Yanlış kullanım:

```python
return {"message": "ok"}
```

Doğru kullanım:

```python
return success_response(
    data=data,
    message="İşlem başarıyla tamamlandı."
)
```

---

# 5. Pydantic Validation Layer

Validation işlemleri request body endpoint'e gelmeden önce Pydantic tarafından yapılır.

Örnek klasör:

```txt
app/schemas/
```

Örnek dosya:

```txt
app/schemas/order.py
```

## 5.1 Bu katmanda kontrol edilenler

```txt
Alan zorunlu mu?
Alan tipi doğru mu?
String uzunluğu doğru mu?
Telefon formatı doğru mu?
Email formatı doğru mu?
ID pozitif mi?
Quantity 0'dan büyük mü?
Liste boş mu?
```

## 5.2 Örnek schema

```python
class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0, le=1000)


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_phone: str = Field(..., pattern=r"^\+?[0-9]{10,15}$")
    items: list[OrderItemCreate] = Field(..., min_length=1)
    notes: str | None = Field(default=None, max_length=1000)
```

## 5.3 Validation hatası örneği

Eğer request şöyle gelirse:

```json
{
  "customer_name": "A",
  "customer_phone": "abc",
  "items": [
    {
      "product_id": -1,
      "quantity": 0
    }
  ]
}
```

Pydantic validation hatası oluşur.

Response:

```json
{
  "statusCode": 422,
  "key": "VALIDATION_ERROR",
  "message": "İstek verisi geçersiz.",
  "data": null,
  "errors": [
    {
      "field": "body → customer_name",
      "message": "String should have at least 2 characters"
    },
    {
      "field": "body → customer_phone",
      "message": "String should match pattern"
    },
    {
      "field": "body → items → 0 → product_id",
      "message": "Input should be greater than 0"
    },
    {
      "field": "body → items → 0 → quantity",
      "message": "Input should be greater than 0"
    }
  ]
}
```

## 5.4 Önemli ayrım

Pydantic validation şunları kontrol eder:

```txt
Tip
Format
Zorunlu alan
Minimum/maksimum değer
Minimum/maksimum uzunluk
```

Pydantic validation şunları kontrol etmez:

```txt
Ürün gerçekten var mı?
Stok yeterli mi?
Sipariş iptal edilebilir mi?
Kullanıcı bu siparişe erişebilir mi?
Kargo teslim edilmiş mi?
```

Bunlar Service Layer'da yapılır.

---

# 6. XSS Sanitization

XSS, kullanıcıdan gelen metnin HTML veya JavaScript olarak tarayıcıda çalıştırılmasıdır.

Bu projede XSS'e karşı üç seviyeli yaklaşım kullanılır:

```txt
1. Input temizleme
2. Security response header'ları
3. Frontend'de güvenli render
```

---

## 6.1 Input temizleme

Input temizliği Pydantic schema validator'ları içinde yapılır.

Temizlenecek alan örnekleri:

```txt
notes
description
chat message
product description
customer note
shipment note
```

Örnek:

```python
@field_validator("notes")
@classmethod
def sanitize_notes(cls, value: str | None) -> str | None:
    if value is None:
        return value

    import bleach
    return bleach.clean(value, tags=[], strip=True)
```

Request:

```json
{
  "notes": "<script>alert('xss')</script> hızlı gönderilsin"
}
```

Temizlenmiş değer:

```txt
alert('xss') hızlı gönderilsin
```

---

## 6.2 Security header koruması

Middleware response'a şu header'ları ekler:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

Bu header'lar browser tarafında ek güvenlik sağlar.

---

## 6.3 Frontend tarafında dikkat edilmesi gerekenler

Backend input temizlese bile frontend kullanıcı metinlerini HTML olarak render etmemelidir.

Kaçınılması gereken kullanım:

```tsx
dangerouslySetInnerHTML={{ __html: userInput }}
```

Güvenli kullanım:

```tsx
<p>{userInput}</p>
```

---

# 7. Auth ve Role Check

Auth işlemleri şu dosyalarda yönetilir:

```txt
app/core/security.py
app/core/dependencies.py
```

## 7.1 Cookie tabanlı Auth akışı

```txt
1. Client login olur.
2. Backend Set-Cookie ile access_token ve refresh_token yazar.
3. Client sonraki isteklerde credentials: "include" ile request atar.
4. Browser HttpOnly cookie'leri otomatik gönderir.
5. get_current_user request.cookies üzerinden access_token'ı okur.
6. Token decode edilir.
7. sub üzerinden kullanıcı DB'den alınır.
8. Kullanıcı aktif değilse 403 döner.
9. Kullanıcı endpoint'e current_user olarak inject edilir.
```

Frontend request örneği:

```javascript
fetch("/api/orders", {
  method: "GET",
  credentials: "include" // Cookie'lerin gitmesi için zorunlu
})
```

## 7.2 Role kontrolü

Admin endpoint'leri için:

```python
current_user: User = Depends(get_admin_user)
```

`get_admin_user` şunları kontrol eder:

```txt
Token geçerli mi?
Kullanıcı var mı?
Kullanıcı aktif mi?
Kullanıcı role == admin mi?
```

## 7.3 Auth hata response'ları

Token yoksa veya geçersizse:

```json
{
  "statusCode": 401,
  "key": "UNAUTHORIZED",
  "message": "Kimlik doğrulama başarısız.",
  "data": null,
  "errors": null
}
```

Kullanıcının yetkisi yoksa:

```json
{
  "statusCode": 403,
  "key": "FORBIDDEN",
  "message": "Bu işlem için yetkiniz yok.",
  "data": null,
  "errors": null
}
```

---

# 8. Service Layer

Service layer iş mantığının bulunduğu katmandır.

Örnek klasör:

```txt
app/services/
```

Örnek dosyalar:

```txt
auth_service.py
product_service.py
order_service.py
inventory_service.py
shipment_service.py
```

## 8.1 Service layer'ın görevleri

```txt
Business rule kontrolü yapmak
Repository'leri orchestrate etmek
Birden fazla repository sonucunu birleştirmek
Stok kontrolü yapmak
Sipariş toplamı hesaplamak
Sipariş durum geçişlerini yönetmek
Hata durumunda AppException türevlerini fırlatmak
```

## 8.2 Sipariş oluşturma örneği

```python
async def create_order(self, data: OrderCreate):
    for item in data.items:
        product = await self.product_repo.get(item.product_id)

        if not product:
            raise NotFoundError(
                message=f"Ürün #{item.product_id} bulunamadı."
            )

        has_stock = await self.inventory_service.check_stock(
            product_id=item.product_id,
            quantity=item.quantity,
        )

        if not has_stock:
            raise InsufficientStockError(
                message=f"Ürün #{item.product_id} için yeterli stok yok."
            )

    order = await self.order_repo.create_order_with_items(data)

    await self.inventory_service.deduct_stock(data.items)

    return order
```

## 8.3 Service layer'da yapılmaması gerekenler

```txt
HTTPException fırlatılmaz
Request objesi kullanılmaz
Response objesi oluşturulmaz
SQLAlchemy session kullanılmaz
Doğrudan SQL sorgusu yazılmaz
JSONResponse dönülmez
```

Yanlış:

```python
raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
```

Doğru:

```python
raise NotFoundError(message="Sipariş bulunamadı.")
```

---

# 9. Business Validation

Business validation, iş kurallarının kontrol edilmesidir.

Bu katman:

```txt
Service Layer
```

## 9.1 Pydantic validation ile farkı

Pydantic validation:

```txt
quantity sayı mı?
quantity 0'dan büyük mü?
phone formatı doğru mu?
email formatı doğru mu?
```

Business validation:

```txt
Bu ürün gerçekten var mı?
Bu üründen yeterli stok var mı?
Bu sipariş iptal edilebilir mi?
Bu kullanıcı bu işlemi yapabilir mi?
Bu kargo teslim edilmiş mi?
Sipariş status geçişi geçerli mi?
```

## 9.2 Örnek business rule

```python
if order.status == "delivered":
    raise ConflictError(
        message="Teslim edilmiş sipariş iptal edilemez."
    )
```

## 9.3 Sipariş status geçiş örneği

Geçerli geçişler:

```txt
pending    → processing
processing → shipped
shipped    → delivered
pending    → cancelled
processing → cancelled
```

Geçersiz geçişler:

```txt
delivered  → cancelled
cancelled  → shipped
shipped    → pending
```

Bu kontrol Service Layer'da yapılır.

---

# 10. Repository Layer

Repository layer, veritabanına erişimin tek noktasıdır.

Örnek klasör:

```txt
app/repositories/
```

Örnek dosyalar:

```txt
base.py
product_repository.py
order_repository.py
inventory_repository.py
shipment_repository.py
```

## 10.1 Repository layer'ın görevleri

```txt
CRUD işlemleri
Özel DB sorguları
JOIN gereken sorgular
Filtreleme
Sayfalama
DB sonucu döndürme
```

## 10.2 Örnek repository metodu

```python
async def get_by_id(self, order_id: int):
    result = await self.session.execute(
        select(Order).where(Order.id == order_id)
    )
    return result.scalar_one_or_none()
```

## 10.3 Repository layer'da yapılmaması gerekenler

```txt
Business rule yazılmaz
Stok yeterli mi kontrol edilmez
HTTPException fırlatılmaz
Service çağırılmaz
LLM çağrılmaz
Response oluşturulmaz
```

Yanlış:

```python
if stock.quantity < quantity:
    raise InsufficientStockError()
```

Doğru yer:

```txt
inventory_service.py
```

---

# 11. SQL Injection Koruması

SQL Injection korumasının ana prensibi:

```txt
Kullanıcı input'u asla SQL string içine doğrudan eklenmez.
Tüm DB işlemleri SQLAlchemy ORM veya parameterized query ile yapılır.
```

## 11.1 Doğru kullanım

```python
result = await session.execute(
    select(Order).where(Order.customer_phone == phone)
)
```

Bu güvenlidir çünkü SQLAlchemy değeri parametre olarak gönderir.

## 11.2 Yanlış kullanım

```python
query = f"SELECT * FROM orders WHERE customer_phone = '{phone}'"
await session.execute(text(query))
```

Bu yasaktır.

## 11.3 Raw SQL zorunluysa

```python
stmt = text("SELECT * FROM orders WHERE status = :status")
result = await session.execute(stmt, {"status": status_value})
```

## 11.4 Mimari kural

```txt
DB erişimi sadece Repository Layer'da yapılır.
Repository SQLAlchemy ORM kullanır.
f-string ile SQL yazılmaz.
String concatenation ile SQL yazılmaz.
Raw SQL gerekiyorsa bindparams kullanılır.
```

---

# 12. Database Layer

Database layer PostgreSQL'dir.

## 12.1 Görevleri

```txt
Veriyi kalıcı saklamak
Foreign key kontrolü yapmak
Unique constraint uygulamak
Not null constraint uygulamak
Transaction tutarlılığı sağlamak
ACID garantisi vermek
```

## 12.2 Örnek DB constraint'leri

```txt
users.email UNIQUE NOT NULL
products.sku UNIQUE NOT NULL
inventory.product_id UNIQUE FK
orders.id PRIMARY KEY
order_items.order_id FOREIGN KEY
order_items.product_id FOREIGN KEY
shipments.order_id UNIQUE FK
```

## 12.3 DB son savunma hattıdır

Uygulama katmanında validation ve business rule kontrolleri yapılır.

Ancak DB yine de son güvenlik ve tutarlılık katmanı olarak constraint'leri uygular.

---

# 13. Exception Handling

Exception handling merkezi yapılır.

Endpoint'lerde sürekli `try/except` yazılmaz.

## 13.1 Custom exception sınıfları

Örnek dosya:

```txt
app/core/exceptions.py
```

Örnek exception'lar:

```txt
AppException
NotFoundError
ValidationError
UnauthorizedError
ForbiddenError
ConflictError
InsufficientStockError
ExternalServiceError
```

## 13.2 Service layer hata fırlatır

```python
if not order:
    raise NotFoundError(
        message=f"{order_id} numaralı sipariş bulunamadı."
    )
```

## 13.3 Global exception handler yakalar

Örnek dosya:

```txt
app/main.py
```

Handler'lar:

```txt
AppException handler
RequestValidationError handler
Unhandled Exception handler
```

## 13.4 NotFoundError response örneği

```json
{
  "statusCode": 404,
  "key": "NOT_FOUND",
  "message": "128 numaralı sipariş bulunamadı.",
  "data": null,
  "errors": null
}
```

## 13.5 InsufficientStockError response örneği

```json
{
  "statusCode": 409,
  "key": "INSUFFICIENT_STOCK",
  "message": "Ürün #5 için yeterli stok yok.",
  "data": null,
  "errors": null
}
```

## 13.6 Beklenmeyen hata response'u

Client'a stack trace dönülmez.

```json
{
  "statusCode": 500,
  "key": "INTERNAL_ERROR",
  "message": "Beklenmeyen bir hata oluştu.",
  "data": null,
  "errors": null
}
```

Stack trace sadece loglanır.

---

# 14. Response Builder

Response formatı tüm endpoint'lerde standarttır.

Örnek dosyalar:

```txt
app/core/responses.py
app/core/response_builder.py
```

## 14.1 Standart response formatı

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "İşlem başarıyla tamamlandı.",
  "data": {},
  "errors": null
}
```

## 14.2 Başarılı response

```python
return success_response(
    data=order,
    message="Sipariş başarıyla oluşturuldu.",
    status_code=201,
)
```

Response:

```json
{
  "statusCode": 201,
  "key": "SUCCESS",
  "message": "Sipariş başarıyla oluşturuldu.",
  "data": {
    "id": 128,
    "status": "pending"
  },
  "errors": null
}
```

## 14.3 Hata response

Normalde endpoint içinde doğrudan `error_response` çok az kullanılır.

Hataların çoğu exception olarak fırlatılır ve global handler tarafından response'a çevrilir.

```python
raise NotFoundError(message="Sipariş bulunamadı.")
```

Response:

```json
{
  "statusCode": 404,
  "key": "NOT_FOUND",
  "message": "Sipariş bulunamadı.",
  "data": null,
  "errors": null
}
```

---

# 15. Tam Akış: Sipariş Oluşturma

Bu bölümde `/api/orders` endpoint'i için tam request-response akışı gösterilir.

```txt
1. Client
   POST /api/orders isteği gönderir.

2. RequestIDMiddleware
   Request'e benzersiz request_id ekler.

3. CORS Middleware
   Origin izinli mi kontrol eder.

4. API Router
   /api/orders endpoint'ini bulur.

5. Pydantic Schema Validation
   Body alanları doğru mu kontrol eder.
   customer_name min 2 karakter mi?
   customer_phone doğru formatta mı?
   product_id > 0 mı?
   quantity > 0 mı?

6. XSS Sanitization
   notes gibi serbest metin alanlarından HTML/script temizlenir.

7. Auth Dependency
   access_token HttpOnly cookie'den okunur ve doğrulanır.

8. Role Dependency
   Kullanıcı admin mi kontrol edilir.

9. Endpoint
   order_service.create_order(payload) çağırır.

10. OrderService
   İş kurallarını kontrol eder.
   Ürün var mı?
   Stok yeterli mi?
   Sipariş toplamı hesaplanır mı?

11. InventoryService
   Stok kontrolü yapar.

12. ProductRepository / InventoryRepository
   SQLAlchemy ile DB sorguları çalıştırır.

13. SQLAlchemy ORM
   Parametreli query üretir.
   SQL injection riski engellenir.

14. PostgreSQL
   Veriyi okur/yazar.
   Foreign key, unique, not null gibi kuralları uygular.

15. Repository
   DB sonucunu service'e döner.

16. Service
   Sipariş oluşturur.
   Stok düşer.
   Sonucu endpoint'e döner.

17. Endpoint
   success_response ile standart response oluşturur.

18. Middleware
   Response'a security header ve X-Request-ID ekler.
   Request süresini loglar.

19. Client
   Standart JSON response alır.
```

---

# 16. Tam Akış: Sipariş Sorgulama Chat Mesajı

Örnek request:

```http
POST /api/chat/message
Content-Type: application/json
Credentials: include
```

Body:

```json
{
  "session_id": "abc123",
  "content": "128 numaralı siparişim nerede?"
}
```

Akış:

```txt
1. Client chat mesajı gönderir.

2. Middleware request_id oluşturur.

3. ChatMessage schema validation çalışır.
   session_id var mı?
   content boş mu?
   content max uzunluğu aşıyor mu?

4. XSS sanitization yapılır.
   content içindeki HTML/script temizlenir.

5. Auth dependency access_token cookie'sini kontrol eder.

6. chat.py endpoint'i AgentOrchestrator'ı çağırır.

7. AgentOrchestrator Redis'ten konuşma geçmişini alır.

8. Orchestrator LLM'e şunları gönderir:
   - System prompt
   - Konuşma geçmişi
   - Kullanılabilir tool listesi
   - Kullanıcı mesajı

9. LLM tool çağırmaya karar verir:
   get_order_status(order_id=128)

10. Orchestrator ilgili tool'u çalıştırır.

11. GetOrderStatus tool'u OrderService'i çağırır.

12. OrderService OrderRepository'i çağırır.

13. OrderRepository SQLAlchemy ile PostgreSQL'den siparişi alır.

14. Sonuç tool'a döner.

15. Tool sonucu LLM'e verilir.

16. LLM final Türkçe yanıt üretir.

17. Orchestrator mesajları Redis'e kaydeder.

18. Endpoint success_response döner.

19. Client agent yanıtını alır.
```

Örnek response:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Agent yanıtı alındı.",
  "data": {
    "reply": "Siparişiniz kargoda. Tahmini teslimat tarihi 12 Mayıs.",
    "session_id": "abc123"
  },
  "errors": null
}
```

---

# 17. Tam Akış: Stok Güncelleme

Örnek request:

```http
PUT /api/inventory/5
Content-Type: application/json
```

Body:

```json
{
  "quantity": 8
}
```

Akış:

```txt
1. Client stok güncelleme isteği gönderir.

2. Middleware request_id oluşturur.

3. InventoryUpdate schema validation çalışır.
   quantity integer mı?
   quantity negatif değil mi?

4. Auth ve admin role kontrolü cookie üzerinden yapılır.

5. inventory.py endpoint'i InventoryService'i çağırır.

6. InventoryService product_id=5 için stok kaydını bulur.

7. Yeni quantity değeri güncellenir.

8. low_stock_threshold kontrol edilir.

9. quantity threshold altındaysa alert data hazırlanır.

10. InventoryRepository SQLAlchemy ile DB update yapar.

11. PostgreSQL constraint'leri uygular.

12. Service sonucu endpoint'e döner.

13. Endpoint success_response döner.
```

Response:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Stok güncellendi.",
  "data": {
    "product_id": 5,
    "quantity": 8,
    "alert": {
      "severity": "critical",
      "message": "Ürün kritik stok seviyesinin altında."
    }
  },
  "errors": null
}
```

---

# 18. Katmanlara Göre Sorumluluk Özeti

| Katman | Sorumluluk | Yapmaması Gereken |
|---|---|---|
| Middleware | Request ID, logging, CORS, security headers | Business logic, DB işlemi |
| API Layer | Route, Depends, service çağırma, response | SQL sorgusu, business logic |
| Schemas | Pydantic validation, input formatı, XSS temizliği | DB kontrolü, stok kontrolü |
| Core Security | JWT, password hashing, current user, admin kontrolü | Sipariş/ürün iş kuralı |
| Service Layer | İş mantığı, business validation, orchestration | HTTP response, SQL sorgusu |
| Repository Layer | CRUD, DB sorguları, filtreleme | Business rule |
| SQLAlchemy ORM | Parametreli query, DB mapping | İş mantığı |
| PostgreSQL | Kalıcı veri, constraint, transaction | API response |
| Exception Handler | Hataları standart response'a çevirme | Business logic |
| Response Builder | Başarılı response formatı | DB işlemi |

---

# 19. Kontrol Listesi

Yeni endpoint yazarken şu checklist takip edilmelidir.

## 19.1 Endpoint checklist

```txt
[ ] Endpoint app/api/endpoints içinde mi?
[ ] Request body Pydantic schema ile mi alınıyor?
[ ] Auth gerekiyorsa Depends(get_current_user) var mı?
[ ] Admin gerekiyorsa Depends(get_admin_user) var mı?
[ ] Endpoint sadece service çağırıyor mu?
[ ] Ham dict response dönülmüyor mu?
[ ] success_response kullanılıyor mu?
[ ] Repository endpoint içinde import edilmemiş mi?
```

## 19.2 Schema checklist

```txt
[ ] Zorunlu alanlar tanımlı mı?
[ ] Min/max length var mı?
[ ] Sayısal alanlarda gt/ge/le gibi kurallar var mı?
[ ] Telefon/email formatı kontrol ediliyor mu?
[ ] Serbest metin alanları sanitize ediliyor mu?
[ ] model_dump() uyumlu mu?
```

## 19.3 Service checklist

```txt
[ ] Business rule'lar burada mı?
[ ] Repository dışında DB erişimi yok mu?
[ ] HTTPException yerine AppException türevleri mi kullanılıyor?
[ ] Stok, status, permission gibi kontroller burada mı?
[ ] Fonksiyonlar tek sorumluluğa sahip mi?
```

## 19.4 Repository checklist

```txt
[ ] Sadece DB sorgusu mu içeriyor?
[ ] SQLAlchemy ORM kullanılıyor mu?
[ ] f-string SQL yok mu?
[ ] String concatenation SQL yok mu?
[ ] Raw SQL varsa bindparams kullanılıyor mu?
[ ] Business logic yok mu?
```

## 19.5 Security checklist

```txt
[ ] SECRET_KEY kod içine yazılmamış mı?
[ ] LLM_API_KEY kod içine yazılmamış mı?
[ ] access_token response body içinde dönmüyor mu?
[ ] refresh_token response body içinde dönmüyor mu?
[ ] Tokenlar sadece HttpOnly cookie ile mi taşınıyor?
[ ] Authorization Bearer header dependency’si kullanılmıyor mu?
[ ] Protected endpointler cookie auth dependency kullanıyor mu?
[ ] CORS allow_credentials=True mi?
[ ] allow_origins wildcard değil mi?
[ ] Logout cookie’leri temizliyor mu?
[ ] Password response'a eklenmiyor mu?
[ ] Password loglanmıyor mu?
[ ] Admin endpoint'ler korunuyor mu?
[ ] Security headers aktif mi?
```

---

# 20. Kısa Özet

```txt
Validation        → schemas/
XSS               → schemas validators + security headers + frontend safe render
Auth              → core/security.py + core/dependencies.py
Business Rules    → services/
SQL Injection     → repositories/ + SQLAlchemy ORM
DB Consistency    → PostgreSQL constraints
Error Handling    → global exception handlers
Response Format   → core/response_builder.py
Logging           → core/logging.py + RequestIDMiddleware
Agent Tool Flow   → agent/tools → services → repositories
```

En önemli mimari kural:

```txt
Endpoint sadece alır, doğrulatır, service'e iletir ve standart response döner.
Service iş mantığını yönetir.
Repository sadece veriye erişir.
```
