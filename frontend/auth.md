# Auth API Referansı

Bu doküman backend içindeki kimlik doğrulama (auth) ile ilgili tüm endpointlerin istek (request) ve yanıt (response) tiplerini toplar. Proje cookie-tabanlı HttpOnly JWT akışı kullanır: tokenlar response body içinde dönmez, Set-Cookie ile HttpOnly cookie olarak yazılır.

---

## Genel: API yanıt formatı (ApiResponse)
Tüm endpointler ortak sarmalayıcıyla yanıt döner (app/core/responses.py -> ApiResponse):

- statusCode: integer
- key: string (ör. SUCCESS, UNAUTHORIZED, CONFLICT)
- message: string
- data: object | null
- errors: array | null

Örnek başarılı gövde:
```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "İşlem başarıyla tamamlandı.",
  "data": null,
  "errors": null
}
```

---

## JWT / Cookie Davranışı
- Cookie isimleri: `access_token`, `refresh_token` (app/core/cookie.py).
- Cookie özellikleri: HttpOnly, Secure (settings.COOKIE_SECURE), SameSite (settings.COOKIE_SAMESITE), domain settings.COOKIE_DOMAIN.
- Tokenlar response body içinde dönmez (kural: tokenlar sadece HttpOnly cookie ile taşınır).
- Access token payload alanları (app/core/security.py):
  - sub: kullanıcı ID (string)
  - role: kullanıcı rolü
  - iat, exp
- Refresh token payload:
  - sub, type: "refresh", iat, exp

---

# Endpointler
Aşağıda `/api/auth` altındaki endpointler listelenmiştir.

### 1) POST /api/auth/register
- Açıklama: Yeni kullanıcı oluşturur.
- Erişim: Public
- Request (application/json) — schema: `UserCreate` (app/schemas/auth.py)
  - email: string (email pattern, min_length=5, max_length=255)
  - password: string (min_length=8, max_length=128)
  - full_name: string | null (min_length=2, max_length=255)
  - role: string (default: "admin") — izin verilen: `admin`, `operator`

Örnek istek gövdesi:
```json
{
  "email": "user@kobi.ai",
  "password": "StrongPass123!",
  "full_name": "Ahmet Demir",
  "role": "admin"
}
```

- Başarılı Yanıt (201): `ApiResponse` içine `UserResponse` döner.
  - UserResponse alanları (app/schemas/auth.py):
    - id: int
    - email: string
    - full_name: string | null
    - role: string
    - is_active: bool
    - last_login_at: datetime | null
    - created_at: datetime
    - updated_at: datetime

Başarılı örnek (kısaltılmış):
```json
{
  "statusCode": 201,
  "key": "SUCCESS",
  "message": "Kullanıcı başarıyla oluşturuldu.",
  "data": {
    "id": 1,
    "email": "admin@kobi.ai",
    "full_name": "Mehmet Yılmaz",
    "role": "admin",
    "is_active": true,
    "last_login_at": "2024-05-10T10:00:00Z",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-05-10T10:00:00Z"
  },
  "errors": null
}
```

- Hatalar:
  - 409 CONFLICT — e-posta zaten kayıtlı (ApiResponse ile key="CONFLICT").
  - 422 VALIDATION_ERROR — pydantic doğrulama hatası (field bazlı errors array).

---

### 2) POST /api/auth/login
- Açıklama: Kullanıcı girişi. Başarılıysa `access_token` ve `refresh_token` HttpOnly cookie olarak set edilir.
- Erişim: Public
- Request (application/json) — schema: `LoginRequest` (app/schemas/auth.py)
  - email: string (email pattern)
  - password: string (min_length=6)

Örnek istek:
```json
{
  "email": "admin@kobi.ai",
  "password": "StrongPass123!"
}
```

- Başarılı Yanıt (200): ApiResponse, `data` genelde `null` (tokens cookie'ye yazılır).
  - Set-Cookie headers:
    - `access_token` (HttpOnly)
    - `refresh_token` (HttpOnly)
  - Örnek gövde:
```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Giriş başarılı.",
  "data": null,
  "errors": null
}
```

- Hatalar:
  - 401 UNAUTHORIZED — e-posta/şifre hatalı veya token problemi.
  - 403 FORBIDDEN — kullanıcı pasif/devre dışı ise (AuthService tarafından fırlatılabilir).

Not: Access/refresh tokenlar asla response body içinde dönmez.

---

### 3) POST /api/auth/refresh
- Açıklama: Mevcut `refresh_token` cookie'si ile yeni access/refresh token üretir ve cookie'leri günceller.
- Erişim: Cookie (refresh_token)
- Request: body yok. `refresh_token` cookie okunur (FastAPI Cookie dependency).

- Başarılı Yanıt (200): ApiResponse (data: null). Yeni cookie'ler Set-Cookie ile set edilir.
```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Token başarıyla yenilendi.",
  "data": null,
  "errors": null
}
```

- Hatalar:
  - 401 UNAUTHORIZED — refresh_token eksik/yanlış/süresi dolmuş.
  - 403 FORBIDDEN — kullanıcı pasif ise.

---

### 4) POST /api/auth/logout
- Açıklama: Access/refresh cookie'lerini temizler (logout).
- Erişim: Cookie (varsa)
- Request: body yok.
- Yanıt (200): ApiResponse (data: null)
```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Çıkış başarılı.",
  "data": null,
  "errors": null
}
```

- Etki: `clear_auth_cookies(response)` çağrılarak `access_token` ve `refresh_token` cookie'leri silinir (response.delete_cookie).

---

### 5) GET /api/auth/me
- Açıklama: Mevcut kullanıcı bilgisi. `access_token` cookie gerektirir.
- Erişim: Cookie (access_token)
- Request: body yok. `access_token` cookie okunur ve decode edilerek kullanıcı DB'den alınır.
- Başarılı Yanıt (200): `ApiResponse` içinde `UserResponse` (bkz. UserResponse alanları).

Örnek:
```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Kullanıcı bilgisi başarıyla getirildi.",
  "data": {
    "id": 1,
    "email": "admin@kobi.ai",
    "full_name": "Mehmet Yılmaz",
    "role": "admin",
    "is_active": true,
    "last_login_at": "2024-05-10T10:00:00Z",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-05-10T10:00:00Z"
  },
  "errors": null
}
```

- Hatalar:
  - 401 UNAUTHORIZED — cookie eksik/invalid/süresi dolmuş.

---

## Hata formatı
Tüm hatalar `ApiResponse` şeklinde döner; `errors` alanı validation detaylarını içerir (ör. field mesajları). Örnek validation error: `VALIDATION_ERROR` (422) — body içindeki `errors` alanı dizi şeklinde `{ field, message }` objeleri içerir.

---

## Kaynak dosyalar
- Endpointler: `backend/app/api/endpoints/auth.py`
- Service: `backend/app/services/auth_service.py`
- Schemas (request/response): `backend/app/schemas/auth.py`
- JWT & hash: `backend/app/core/security.py`
- Cookie helper: `backend/app/core/cookie.py`
- Genel response modeli: `backend/app/core/responses.py`

---

İhtiyaç varsa bu dokümana örnek curl istekleri veya OpenAPI (YAML/JSON) dönüşlerini de ekleyebilirim.