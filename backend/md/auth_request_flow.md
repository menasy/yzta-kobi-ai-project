# Auth/Register ve Request Akışı

Bu doküman, backend içinde kayıt (register), giriş (login), yetkilendirme (authorization) ve request işleme akışının nasıl çalıştığını özetler.

## 1) Genel request akışı

1. **FastAPI app** yüklenir ve `API_PREFIX` ile router'lar bağlanır.
   - Tüm endpoint'ler `/api` prefix'i altındadır.
   - Örnek: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
2. **Middleware sırası (LIFO):**
   - `RequestIDMiddleware`: Her isteğe `X-Request-ID` atar, süreyi ölçer, loglar ve response'a ekler.
   - `CORS`: `Origin` kontrolü ve izinli header/method politikası. `allow_credentials=True` olarak set edilmiştir.
   - `SecurityHeadersMiddleware`: Güvenlik header'ları ekler.
3. **Dependency Injection:**
   - DB session `get_db_session` ile oluşturulur, request sonunda commit/rollback yapılır.
   - Auth servisleri `get_auth_service` ile sağlanır.
4. **Endpoint handler:**
   - Request body Pydantic schema'ları ile doğrulanır.
   - İş mantığı `AuthService` içinde çalışır.
5. **Response formatı:**
   - Tüm cevaplar standart `ApiResponse` formatında döner.
   - Başarılı cevaplar `success_response` ile oluşturulur.
   - **Önemli:** Auth token'lar response body içinde dönmez.
6. **Hata yakalama:**
   - `AppException` türevleri (401, 403, 409 vb.) merkezi handler tarafından standart şekilde döner.
   - Pydantic validation hataları 422 ile tek bir formatta döner.

## 2) Register (Kayıt) akışı

**Endpoint:** `POST /api/auth/register`

**Request body:**
- `email` (unique, e-posta formatı)
- `password` (min 8 karakter)
- `full_name` (opsiyonel)
- `role` (varsayılan: `admin`)

**İş adımları:**
1. `UserCreate` schema doğrulama yapar.
2. `AuthService.register()` çalışır.
3. Email daha önce kayıtlı ise `ConflictError (409)` döner.
4. Şifre `bcrypt` ile hashlenir ve DB'ye kaydedilir.
5. Response olarak `UserResponse` döner (hash/token dönmez).

## 3) Login (Giriş) akışı

**Endpoint:** `POST /api/auth/login`

**Request body:**
- `email`
- `password`

**İş adımları:**
1. `LoginRequest` schema doğrulama yapar.
2. `AuthService.login()` çalışır.
3. Kullanıcı bulunamaz veya şifre yanlışsa `UnauthorizedError (401)` döner.
4. Kullanıcı pasifse `ForbiddenError (403)` döner.
5. Başarılıysa `access_token` ve `refresh_token` üretilir.
6. Response önce mevcut auth cookie varyantlarını temizler, ardından **token'lar Set-Cookie header'ı ile HttpOnly cookie olarak canonical cookie adı/path/domain ayarlarıyla set edilir.**
7. Response body'de token bilgisi yer almaz.

**Response (örnek):**
```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Giriş başarılı.",
  "data": null,
  "errors": null
}
```

## 4) Yetkilendirme (Authorization) akışı

**Yetkili endpoint örneği:** `GET /api/auth/me`

**Token nasıl iletilir?**
- Login sonrası token'lar **HttpOnly cookie** içine yazılır.
- Frontend (Browser), sonraki tüm isteklerde bu cookie'leri otomatik olarak gönderir.
- Frontend tarafında `credentials: "include"` (veya Axios `withCredentials: true`) kullanılmalıdır.
- Local geliştirmede `localhost` ve `127.0.0.1` aynı auth akışında karıştırılmamalıdır.
- `Authorization: Bearer` header'ı **kullanılmaz**.

**Doğrulama adımları (get_current_user):**
1. Merkezi cookie helper canonical `access_token` cookie'sini okur. Yoksa 401.
2. JWT decode edilir (`SECRET_KEY` + `JWT_ALGORITHM`).
3. Token payload'ında `sub` (user_id) olmalıdır.
4. Kullanıcı DB'den bulunur, yoksa 401.
5. `is_active = false` ise 403.
6. Başarılıysa `CurrentUser` olarak endpoint'e iletilir.

## 5) Token Yapısı ve Yenileme (Refresh)

**JWT payload:**
- `sub`: kullanıcı ID (string)
- `role`: kullanıcı rolü (admin, operator)
- `iat`: token oluşturma zamanı
- `exp`: token bitiş zamanı

**Token süreleri:**
- Access Token: `ACCESS_TOKEN_EXPIRE_MINUTES` (örn. 24 saat)
- Refresh Token: `REFRESH_TOKEN_EXPIRE_MINUTES` (örn. 7 gün)

**Refresh Akışı:**
- Access token süresi dolduğunda `/api/auth/refresh` endpoint'i çağrılır.
- Backend `refresh_token` cookie'sini doğrular, legacy cookie varyantlarını temizler ve canonical auth cookie'lerini yeniden set eder.
- Mevcut mimaride stateful refresh session-store yoktur; bu nedenle refresh token revoke/rotation yapılmaz. Refresh endpoint yeni access token üretir, mevcut refresh token'ı kalan ömrüyle yeniden yazar. Bu sayede multi-tab paralel refresh istekleri deterministic kalır.

## 6) Logout (Çıkış) Akışı

**Endpoint:** `POST /api/auth/logout`

**İş adımları:**
1. `access_token` ve `refresh_token` cookie'leri temizlenir (expires=0).
2. Canonical path/domain yanında bilinen legacy path/domain varyantları da temizlenmeye çalışılır.

## 7) Özet: Neden HttpOnly Cookie?

- **Güvenlik:** Token'lar JS tarafında okunamaz (XSS koruması).
- **Yönetim:** Frontend'in token saklama/yönetme yükü azalır.
- **CSRF:** SameSite=Lax/Strict ayarlarıyla CSRF riski minimize edilir.

## 8) İlgili dosyalar

- Auth endpointleri: [backend/app/api/endpoints/auth.py](backend/app/api/endpoints/auth.py)
- Auth servis: [backend/app/services/auth_service.py](backend/app/services/auth_service.py)
- Auth dependency: [backend/app/core/dependencies.py](backend/app/core/dependencies.py)
- JWT ve hashing: [backend/app/core/security.py](backend/app/core/security.py)
- Response format: [backend/app/core/response_builder.py](backend/app/core/response_builder.py)
- Settings: [backend/app/core/config.py](backend/app/core/config.py)
