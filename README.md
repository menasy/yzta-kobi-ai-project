# KobiAI (KOBİ AI Agent)

KobiAI, KOBİ'lerin günlük operasyonlarını tek panelden yönetmesini hedefleyen, yapay zeka destekli bir operasyon otomasyon platformudur. Mevcut kod tabanı; ürün, stok, sipariş, kargo, bildirim ve müşteri etkileşimi akışlarını aynı sistem içinde birleştirir. Bu README, proje kökündeki tek ana dokümandır; backend, frontend, AI agent, auth, veritabanı, seed ve Docker akışlarını birlikte açıklar.

Kod tabanında marka ve servis adları `KobiAi`, `KOBİ Agent` ve `KOBİ AI Agent` biçimlerinde geçebilir. Bu dokümanda proje adı tutarlı olması için `KobiAI` olarak kullanılmıştır.

## 1. Proje Özeti

### Ne yapar?

Platform, iki ana kullanım eksenine odaklanır:

- **Yönetim paneli:** admin kullanıcılar ürünleri, siparişleri, envanteri, kargo durumlarını ve bildirimleri yönetir.
- **Müşteri deneyimi:** customer kullanıcılar ürünleri inceler, sipariş oluşturur, kendi siparişlerini takip eder ve AI destekli sohbet ekranını kullanır.

### Hangi problemi çözer?

Kod tabanının hedeflediği problem, KOBİ operasyonlarının dağınık araçlar arasında yönetilmesidir:

- müşteri iletişimi farklı kanallara dağılır,
- sipariş ve kargo takibi manuel yürür,
- kritik stok görünürlüğü zayıftır,
- yönetici aksiyonları gecikmeli alınır,
- operasyon ekipleri veri yerine yorumla karar verir.

### Temel değer önerisi

- müşteri iletişimini standartlaştırmak,
- sipariş ve teslimat görünürlüğünü artırmak,
- kritik stokları erken fark etmek,
- yöneticiye operasyonel özet ve uyarılar üretmek,
- AI destekli soru-cevap ile destek ve operasyon yükünü azaltmak,
- dashboard üzerinden günlük performansı hızlı izlenebilir hale getirmek.

### Hedef kullanıcılar

- projeye yeni katılan geliştiriciler,
- backend geliştiricileri,
- frontend geliştiricileri,
- demo / hackathon jürileri,
- sistemi teknik olarak inceleyen ekipler,
- daha sonra projeyi devralacak AI coding agent'ler.

## 2. Ürün Amacı ve Kapsam

Bu proje, KOBİ'lerin günlük operasyonlarını tek panelde toplama fikri üzerine kurulmuş bir MVP / ürünleşebilir demo mimarisidir. Kod tabanı, tek bir panelde aşağıdaki iş akışlarını bir araya getirir:

- ürün kataloğu ve stok yönetimi,
- sipariş oluşturma ve sipariş yaşam döngüsü,
- kargo oluşturma, gecikme izleme ve teslimat durumu,
- bildirim merkezi,
- AI destekli operasyon ve destek asistanı,
- temel dashboard ve haftalık performans görünümü.

Mevcut mimari hackathon/MVP kullanımına uygundur; aynı zamanda katmanlı backend, monorepo frontend, migration/seed ve env yönetimi sayesinde ürünleşme yönünde geliştirilebilir bir temel sunar.

## 3. Mevcut Özellikler

Aşağıdaki maddeler doğrudan mevcut koddan türetilmiştir; kodda olmayan özellikler bilerek listelenmemiştir.

### Genel platform özellikleri

- Cookie tabanlı JWT auth sistemi
- `admin` ve `customer` rolleri
- merkezi API response formatı
- PostgreSQL + Alembic migration yapısı
- Redis tabanlı konuşma hafızası, SSE ve rate limit desteği
- idempotent demo seed sistemi
- Docker ile backend + PostgreSQL + Redis local kurulum akışı

### Admin tarafı

- dashboard genel bakış ekranı
- haftalık performans grafiği
- ürün listeleme / oluşturma / güncelleme / silme
- düşük stok ve kritik stok görünümü
- envanter güncelleme
- sipariş listeleme ve sipariş durumu güncelleme
- kargo oluşturma, kargo detay görüntüleme ve durum yenileme
- geciken kargo listesi
- bildirim merkezi ve okunma yönetimi
- AI chat ekranı ve global AI asistan paneli

### Customer tarafı

- kayıt ve giriş
- ürün katalog ekranı
- ürün detayından doğrudan sipariş oluşturma
- kendi siparişlerini listeleme
- sipariş detayını görüntüleme
- profil ve varsayılan adres yönetimi
- AI chat ekranı

### AI / destek tarafı

- authenticated chat endpoint'i
- Redis tabanlı konuşma hafızası
- Gemini function-calling tabanlı tool orchestration
- sipariş, stok, kritik stok ve kargo tool'ları
- bildirim sistemi üzerinden AI özet üretimi
- public müşteri destek sorgu endpoint'leri:
  - sipariş numarası ile sorgu,
  - ürün / SKU ile stok sorgu,
  - takip numarası ile kargo sorgu

### Operasyon ve analiz tarafı

- düşük stok uyarıları
- shipment delay bildirimi
- günlük gecikme özeti
- haftalık sipariş/gelir dashboard verisi
- ürün bazlı haftalık stok tahmini endpoint'i
- market growth simülasyonu ve stok analizi servisleri

## 4. Teknoloji Stack

### Backend

| Teknoloji | Durum | Not |
| --- | --- | --- |
| Python 3.12 | Kullanılıyor | `backend/pyproject.toml` |
| FastAPI | Kullanılıyor | Ana HTTP API katmanı |
| SQLAlchemy 2.x Async | Kullanılıyor | Async ORM ve session yönetimi |
| Alembic | Kullanılıyor | Migration sistemi |
| PostgreSQL 16 | Kullanılıyor | `docker-compose.yml` içinde `db` servisi |
| Redis 7 | Kullanılıyor | chat memory, SSE event dağıtımı, rate limiting |
| Pydantic / pydantic-settings | Kullanılıyor | schema ve config yönetimi |
| python-jose | Kullanılıyor | JWT üretimi / doğrulama |
| passlib[bcrypt] | Kullanılıyor | şifre hashleme |
| pandas | Kullanılıyor | basit forecast hesapları |
| google-genai | Aktif | mevcut orchestrator Gemini kullanıyor |
| anthropic | Bağımlılık var | fakat aktif orchestrator akışına bağlı değil |
| RabbitMQ / aio-pika | Kısmen var | worker kodları var, default compose akışında yok |
| Docker | Kullanılıyor | backend container, db, redis |

### Frontend

| Teknoloji | Durum | Not |
| --- | --- | --- |
| Next.js 15 | Kullanılıyor | App Router yapısı |
| React 19 | Kullanılıyor | UI katmanı |
| TypeScript | Kullanılıyor | tüm frontend packages |
| pnpm + Turbo | Kullanılıyor | monorepo/workspace orchestration |
| TanStack Query v5 | Kullanılıyor | server state, cache, invalidation |
| Zustand | Kullanılıyor | auth, chat, system, UI state |
| Tailwind CSS | Kullanılıyor | tasarım sistemi tabanı |
| Radix UI + shadcn-benzeri wrapper'lar | Kullanılıyor | `frontend/packages/ui-web/components/shadcn` |
| react-hook-form + zod | Kullanılıyor | form yönetimi ve doğrulama |
| framer-motion | Kullanılıyor | animasyonlar |
| recharts | Kullanılıyor | dashboard grafikleri |
| next-themes | Kullanılıyor | fakat uygulama şu anda zorunlu light theme ile açılıyor |

### Kaynak doğruluğu notu

- Backend için **asıl bağımlılık kaynağı** `backend/pyproject.toml` dosyasıdır.
- Proje kökündeki `requirements.txt` dosyası daha dar ve kısmen eski bir liste görünümündedir; Poetry tabanlı backend bağımlılıklarını tam temsil etmez.

## 5. Klasör Mimarisi

### Proje kökü

```text
.
├── backend/
├── frontend/
├── docker-compose.yml
├── README.md
└── requirements.txt
```

### Kök seviyesindeki önemli dosyalar

- `backend/`: FastAPI uygulaması, AI agent, servis katmanı, migration ve seed.
- `frontend/`: Next.js tabanlı monorepo; web app + shared packages.
- `docker-compose.yml`: varsayılan local stack; `api`, `db`, `redis`.
- `README.md`: bu ana teknik doküman.
- `requirements.txt`: legacy/minimal Python dependency listesi; backend için ana kaynak değildir.

### Backend klasör yapısı

```text
backend/
├── app/
│   ├── agent/
│   │   ├── orchestrator.py
│   │   ├── memory.py
│   │   ├── prompts.py
│   │   └── tools/
│   ├── api/
│   │   ├── router.py
│   │   └── endpoints/
│   ├── core/
│   ├── db/
│   ├── integrations/
│   │   └── cargo/
│   ├── mappers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── schemas/
│   ├── services/
│   └── workers/
├── alembic/
├── scripts/
├── Dockerfile
├── entrypoint.sh
├── pyproject.toml
└── .env.example
```

#### Backend klasörlerinin rolü

- `app/main.py`: FastAPI giriş noktası.
- `app/api/endpoints/`: domain bazlı HTTP endpoint'ler.
- `app/core/`: config, security, response builder, exceptions, dependencies, rate limiting.
- `app/db/`: async engine, session factory, schema bootstrap.
- `app/models/`: SQLAlchemy ORM modelleri.
- `app/schemas/`: request/response Pydantic şemaları.
- `app/repositories/`: DB erişim katmanı.
- `app/services/`: iş kuralları ve uygulama servisleri.
- `app/agent/`: AI orchestrator, prompt, tool registry, Redis memory.
- `app/integrations/cargo/`: mock kargo provider ve provider abstraction.
- `app/workers/`: opsiyonel / manuel çalıştırılan worker script'leri.
- `alembic/`: migration dosyaları.
- `scripts/`: seed ve bootstrap script'leri.

### Frontend klasör yapısı

```text
frontend/
├── apps/
│   ├── .env.example
│   └── web/
│       ├── app/
│       ├── components/
│       ├── middleware.ts
│       └── public/
├── packages/
│   ├── core/
│   ├── domain/
│   ├── state/
│   ├── theme/
│   ├── ui-contracts/
│   ├── ui-web/
│   └── i18n/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

#### Frontend klasörlerinin rolü

- `apps/web/app/`: Next.js App Router sayfaları ve route group layout'ları.
- `apps/web/components/`: app-level provider, auth, system ve navigation bileşenleri.
- `apps/web/public/product/`: seed veride kullanılan demo ürün görselleri.
- `packages/core/`: ortak HTTP client, error handling ve utility'ler.
- `packages/domain/`: domain bazlı API modülleri, hook'lar, type ve schema'lar.
- `packages/state/`: TanStack Query client + Zustand store'ları.
- `packages/ui-web/`: tekrar kullanılabilir UI bileşenleri.
- `packages/theme/`: tasarım token'ları.
- `packages/ui-contracts/`: bazı UI contract tanımları.
- `package.json`: monorepo root script'leri.

## 6. Yüksek Seviye Sistem Mimarisi

```text
Next.js Web App
   │
   ├── TanStack Query / Zustand
   │
   ▼
FastAPI API
   │
   ├── Endpoint Layer
   ├── Dependency Layer
   ├── Service Layer
   ├── Repository Layer
   │
   ├── PostgreSQL
   ├── Redis
   │   ├── Chat memory
   │   ├── Notification pub/sub
   │   └── Rate limiting
   │
   └── AI Agent Orchestrator
       ├── Prompt
       ├── Tool Registry
       ├── Order / Inventory / Cargo tools
       └── Gemini API
```

### Varsayılan local runtime bileşenleri

- `api`: FastAPI backend
- `db`: PostgreSQL
- `redis`: Redis

### Kod tabanında olup varsayılan compose akışına dahil olmayan bileşenler

- RabbitMQ tabanlı worker / consumer script'leri
- gerçek kargo provider entegrasyonu
- frontend container servisi

Bu nedenle mevcut local kurulumun standart yolu:

1. backend + db + redis için `docker compose up --build`
2. frontend'i ayrı olarak `pnpm dev` ile başlatmak

## 7. Backend Mimarisi

### 7.1 Uygulama nasıl başlıyor?

Backend giriş noktası `backend/app/main.py` dosyasıdır. Container tarafında başlangıç akışı `backend/entrypoint.sh` ile şöyledir:

1. PostgreSQL bağlantısı hazır olana kadar beklenir
2. `python scripts/bootstrap_alembic.py`
3. `alembic upgrade head`
4. `python scripts/seed_all.py`
5. `uvicorn app.main:app --host 0.0.0.0 --port 8000`

`bootstrap_alembic.py`, legacy tablolar mevcut ama `alembic_version` yoksa veritabanını mevcut revizyona stamp etmek için geliştirme kolaylığı sağlar. Yetkili migration kaynağı yine Alembic'tir.

### 7.2 FastAPI başlangıç davranışı

`app/main.py` içinde:

- FastAPI app oluşturulur.
- `api_router`, `settings.API_PREFIX` altında mount edilir.
- `RequestIDMiddleware`, `CORSMiddleware` ve `SecurityHeadersMiddleware` eklenir.
- global exception handler'lar tanımlanır.
- `/health` endpoint'i API prefix dışında public olarak sunulur.
- `lifespan` içinde development ortamında `ensure_schema()` çağrılır.

`ensure_schema()` development rahatlığı için `Base.metadata.create_all()` çalıştırabilir; yine de migration otoritesi Alembic olarak düşünülmelidir.

### 7.3 Request yaşam döngüsü

Genel backend akışı şu şekildedir:

```text
HTTP Request
→ Middleware
→ Pydantic validation
→ Auth dependency / role check
→ Service layer
→ Repository layer
→ SQLAlchemy
→ Response builder
→ Standard ApiResponse
```

### 7.4 Middleware katmanı

#### RequestIDMiddleware

- Her request için `request_id` üretir veya gelen `X-Request-ID` header'ını kullanır.
- `request.state.request_id` alanına yazar.
- response'a `X-Request-ID` ekler.
- süre ölçümü ve structured logging yapar.

#### CORS

- `allow_credentials=True` ile cookie auth akışını destekler.
- origin listesi `CORS_ORIGINS` ve development regex fallback ile yönetilir.

#### SecurityHeadersMiddleware

- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Content-Security-Policy`

header'larını ekler.

### 7.5 Katmanlı mimari

#### Endpoint layer

- route tanımı yapar,
- schema ile input alır,
- dependency injection ile servis alır,
- doğrudan repository veya SQL çağırmaz,
- sonucu `success_response()` ile döner.

#### Service layer

- iş kurallarını uygular,
- auth, stok, sipariş, kargo, bildirim, forecast gibi domain davranışlarını yönetir,
- repository'leri orkestre eder.

#### Repository layer

- SQLAlchemy sorgularını tutar,
- aggregate bazlı veri erişimini kapsüller,
- business rule içermez.

#### Model / schema ayrımı

- `models/`: persistence/ORM yapıları.
- `schemas/`: request/response ve validation yapıları.

### 7.6 Dependency injection ve session yönetimi

`app/core/dependencies.py`:

- DB session'ı `get_db_session()` ile sağlar.
- `get_current_user()` cookie'den kullanıcıyı çözer.
- `get_admin_user()` admin yetkisini enforce eder.
- servis factory'lerini request scope'ta sağlar.
- AI orchestrator'ı DB session ile üretir.

`app/db/session.py`:

- async engine ve session factory singleton benzeri lazy yapıda tutulur,
- request sonunda commit/rollback yönetilir,
- shutdown'da bağlantılar kapatılır.

### 7.7 Response formatı

Tüm API yanıtları `app/core/responses.py` içindeki `ApiResponse` modeli üzerinden standardize edilir:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "İşlem başarıyla tamamlandı.",
  "data": {},
  "errors": null
}
```

Pagination kullanılan yerlerde `PaginatedData` tipli `items`, `total`, `page`, `size`, `pages` yapısı kullanılabilir.

### 7.8 Hata yönetimi

Global exception handler'lar:

- `AppException` türevleri için standart hata cevabı üretir.
- `RequestValidationError` için `VALIDATION_ERROR` döner.
- `SQLAlchemyError` için DB hazır değilse `DATABASE_NOT_READY` / `503` döner.
- beklenmeyen hatalar için `INTERNAL_ERROR` / `500` döner.

Bu yapı, endpoint içinde tekrarlı `try/except` ihtiyacını büyük ölçüde ortadan kaldırır.

### 7.9 Backend domain servisleri

Önemli servisler:

- `AuthService`: register, login, refresh, logout mantığı
- `UserService`: profil ve adres self-service işlemleri
- `ProductService`: ürün CRUD ve low stock görünümü
- `InventoryService`: stok güncelleme, order deduction, low stock notification tetikleme
- `OrderService`: sipariş oluşturma, statü güncelleme, dashboard hesapları
- `ShipmentService`: kargo oluşturma, refresh, delayed listesi, order sync
- `NotificationService`: bildirim listeleme, mark-read, delay summary, Redis event publish
- `CustomerSupportService`: public ve deterministik müşteri destek sorguları
- `ForecastingService`: pandas ile basit haftalık tahmin
- `StockAnalysisService`: stok sağlık analizi, dashboard özeti, simülasyon

### 7.10 Background/worker yapısı

Kod tabanında üç worker bulunur:

- `app/workers/inventory_worker.py`: düşük stok kayıtlarını RabbitMQ kuyruğuna yayınlar
- `app/workers/ai_consumer.py`: RabbitMQ kuyruğundaki stok uyarılarını Gemini ile kısa tavsiyeye çevirir
- `app/workers/cargo_worker.py`: aktif kargoları periyodik izler ve gecikme bildirimleri üretir

Önemli gerçek durum:

- `docker-compose.yml` içinde RabbitMQ servisi yoktur.
- Bu worker'lar default local demo akışının aktif parçası değildir.
- `cargo_worker.py` ve notification akışları mimaride genişlemeye açık bir zemin sunar.

## 8. API Domainleri ve Endpoint Yapısı

Tüm route'lar varsayılan olarak `/api` prefix'i altındadır. Tek istisna health endpoint'idir: `/health`.

### 8.1 Auth endpoint'leri

| Method | Path | Auth | Açıklama |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Yeni kullanıcı kaydı oluşturur; kayıt olan kullanıcı customer rolü ile açılır |
| `POST` | `/api/auth/login` | Public | Email/şifre ile giriş yapar, token'ları HttpOnly cookie olarak set eder |
| `POST` | `/api/auth/refresh` | Refresh cookie | Yeni access token üretir |
| `POST` | `/api/auth/logout` | Public/Auth | Auth cookie'lerini temizler |
| `GET` | `/api/auth/me` | Authenticated | Aktif kullanıcı bilgisini döner |

### 8.2 User endpoint'leri

| Method | Path | Auth | Açıklama |
| --- | --- | --- | --- |
| `GET` | `/api/user/profile` | Authenticated | Kullanıcının kendi profilini getirir |
| `PATCH` | `/api/user/profile` | Authenticated | Kullanıcının kendi profilini günceller |
| `GET` | `/api/user/address` | Authenticated | Varsayılan adresi getirir |
| `PUT` | `/api/user/address` | Authenticated | Varsayılan adresi oluşturur/günceller |

### 8.3 Product endpoint'leri

| Method | Path | Auth | Açıklama |
| --- | --- | --- | --- |
| `GET` | `/api/products` | Public | Ürün listesi |
| `GET` | `/api/products/{product_id}` | Public | Ürün detayları |
| `GET` | `/api/products/low-stock` | Admin | Kritik/düşük stokta ürünleri listeler |
| `POST` | `/api/products` | Admin | Yeni ürün oluşturur |
| `PUT` | `/api/products/{product_id}` | Admin | Ürünü günceller |
| `DELETE` | `/api/products/{product_id}` | Admin | Ürünü siler |

### 8.4 Public customer support endpoint'leri

Bu grup AI chat'ten ayrıdır; deterministik, read-only müşteri destek sorgularıdır.

| Method | Path | Auth | Açıklama |
| --- | --- | --- | --- |
| `GET` | `/api/support/orders/{order_number}` | Public | Sipariş numarasına göre sipariş durumu |
| `GET` | `/api/support/stock` | Public | `query` parametresi ile ürün/SKU stok sorgusu |
| `GET` | `/api/support/cargo/{tracking_number}` | Public | Takip numarasına göre kargo durumu |

### 8.5 Order endpoint'leri

| Method | Path | Auth | Açıklama |
| --- | --- | --- | --- |
| `POST` | `/api/orders` | Customer | Doğrudan sipariş oluşturur |
| `GET` | `/api/orders/my` | Customer | Kendi siparişlerini listeler |
| `GET` | `/api/orders/my/{order_id}` | Customer | Kendi sipariş detayını getirir |
| `GET` | `/api/orders` | Admin | Tüm siparişleri listeler |
| `GET` | `/api/orders/{order_id}` | Admin | Sipariş detayı |
| `PATCH` | `/api/orders/{order_id}/status` | Admin | Sipariş durumunu günceller |
| `GET` | `/api/orders/summary/today` | Admin | Günlük özet verisi |
| `GET` | `/api/orders/dashboard/overview` | Admin | Dashboard overview verisi |

### 8.6 Inventory endpoint'leri

| Method | Path | Auth | Açıklama |
| --- | --- | --- | --- |
| `GET` | `/api/inventory` | Admin | Envanter listesi |
| `GET` | `/api/inventory/low-stock` | Admin | Düşük stok listesini getirir |
| `GET` | `/api/inventory/critical-stocks` | Admin | Kritik stok analizi |
| `GET` | `/api/inventory/analysis/{product_id}` | Admin | Ürün bazlı stok sağlık analizi |
| `PUT` | `/api/inventory/{product_id}` | Admin | Stok ve eşik güncellemesi |
| `GET` | `/api/inventory/dashboard-summary` | Admin | Dashboard için stok özeti |
| `GET` | `/api/inventory/simulate` | Admin | Büyüme faktörüne göre simülasyon |

### 8.7 Shipment endpoint'leri

| Method | Path | Auth | Açıklama |
| --- | --- | --- | --- |
| `POST` | `/api/shipments` | Admin | Siparişe bağlı kargo oluşturur |
| `GET` | `/api/shipments` | Admin | Kargo listesi / filtreleme |
| `GET` | `/api/shipments/delayed` | Admin | Geciken veya overdue kargolar |
| `GET` | `/api/shipments/{tracking_number}` | Admin | Kargo detayı |
| `PATCH` | `/api/shipments/{tracking_number}/refresh` | Admin | Kargo durumunu provider üzerinden yeniler |

### 8.8 Notification endpoint'leri

| Method | Path | Auth | Açıklama |
| --- | --- | --- | --- |
| `GET` | `/api/notifications` | Admin | Tüm bildirimler |
| `GET` | `/api/notifications/unread` | Admin | Okunmamış bildirimler |
| `GET` | `/api/notifications/daily-summary` | Admin | AI destekli günlük gecikme özeti |
| `GET` | `/api/notifications/stream` | Admin | SSE canlı bildirim akışı |
| `PATCH` | `/api/notifications/read-all` | Admin | Tüm bildirimleri okundu işaretler |
| `PATCH` | `/api/notifications/{notification_id}/read` | Admin | Tek bildirimi okundu işaretler |

### 8.9 Chat / AI endpoint'leri

| Method | Path | Auth | Açıklama |
| --- | --- | --- | --- |
| `POST` | `/api/chat/message` | Authenticated | AI agent'a mesaj gönderir |
| `GET` | `/api/chat/history/{session_id}` | Authenticated | Redis'teki chat geçmişini getirir |
| `DELETE` | `/api/chat/history/{session_id}` | Authenticated | Chat geçmişini temizler |

### 8.10 Forecast endpoint'i

| Method | Path | Auth | Açıklama |
| --- | --- | --- | --- |
| `GET` | `/api/forecast/{product_id}` | Admin | Ürün bazlı haftalık talep / stok forecast |

### 8.11 Health endpoint'i

| Method | Path | Auth | Açıklama |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | DB, migration ve seed readiness kontrolü |

## 9. Auth ve Yetkilendirme Sistemi

### 9.1 Roller

Mevcut kod tabanında geçerli roller:

- `admin`
- `customer`

`operator` rolü artık aktif sistem rolü değildir. `a9c4d2e7f1b8_normalize_legacy_user_roles.py` migration'ı legacy `operator` kayıtlarını `admin` olarak normalize eder.

### 9.2 Login nasıl çalışır?

1. Kullanıcı `POST /api/auth/login` ile email/şifre gönderir.
2. `AuthService` kullanıcıyı bulur, şifreyi bcrypt ile doğrular.
3. Başarılı girişte access + refresh JWT üretilir.
4. Token'lar response body'ye değil, **HttpOnly cookie** olarak yazılır.
5. `last_login_at` güncellenir.

### 9.3 Cookie / token modeli

- `access_token`: kısa/orta ömürlü JWT
- `refresh_token`: daha uzun ömürlü JWT
- `AUTH_COOKIE_HTTPONLY=true`
- `AUTH_COOKIE_SAMESITE=lax` varsayılanı kullanılır
- frontend tüm isteklerde `credentials: "include"` ile çalışır
- `Authorization: Bearer` akışı kullanılmaz

### 9.4 Refresh akışı

`POST /api/auth/refresh`:

- refresh cookie doğrulanır,
- yeni access token üretilir,
- mevcut refresh token kalan ömrüyle tekrar yazılır.

Mevcut yapıda stateful refresh session store veya refresh token rotation yoktur; bu, mimarinin basit tutulduğunu gösterir.

### 9.5 Backend yetki kontrolü

- `get_current_user()`: cookie'den access token çözer, user yükler, aktiflik kontrol eder
- `get_admin_user()`: `role == admin` kuralını enforce eder
- customer yetkisi gerektiren sipariş endpoint'lerinde doğrudan rol doğrulaması uygulanır

### 9.6 Frontend auth guard mantığı

Frontend iki katmanda auth davranışı uygular:

#### Next.js middleware

`frontend/apps/web/middleware.ts`:

- `access_token` cookie'sini okur
- JWT içindeki role claim'ini **imzayı doğrulamadan** parse eder
- korumalı path'lerde kullanıcıyı login'e yönlendirir
- auth sayfalarına giriş yapmış kullanıcı gelirse rol bazlı ana ekrana redirect eder

Bu katman UX amaçlıdır; **gerçek yetki doğrulaması backend'dedir**.

#### Session senkronizasyonu

`AuthSessionSync`:

- cookie varsa `/api/auth/me` çağırır,
- store'u gerçek backend user verisiyle doldurur,
- 401 alırsa auth store temizlenir ve login'e yönlendirme yapılır.

### 9.7 Rol bazlı erişim

#### Public rotalar

- `/`
- `/products`
- `/products/[id]`
- `/auth/login`
- `/auth/register`

#### Tüm authenticated kullanıcılar

- `/chat`
- `/profile`

#### Customer'a özel

- `/orders/my`
- `/orders/my/[id]`

#### Admin'e özel

- `/dashboard`
- `/dashboard/products`
- `/orders`
- `/inventory`
- `/shipments`
- `/notifications`

Not: `/profile` route'u fiziksel olarak authenticated route group altında yer alır; middleware policy listesinde açıkça tanımlı değildir. Buna rağmen sayfa veri yüklerken backend auth endpoint'leri üzerinden doğrulanır ve yetkisiz kullanım 401 / redirect akışıyla engellenir.

## 10. AI Sistemi / Agent Mimarisi

Bu proje açısından en kritik katman `backend/app/agent/` altındaki AI altyapısıdır. Sistem, genel amaçlı serbest sohbetten çok; sipariş, stok ve kargo gibi operasyonel veri kaynaklarına kontrollü erişen tool tabanlı bir yardımcı olarak tasarlanmıştır.

### 10.1 AI katmanının amacı

AI agent'in mevcut kod içindeki ana amacı:

- müşteri veya kullanıcı sorularını Türkçe yanıtlamak,
- sipariş / stok / kargo sorularında gerçek veri kaynaklarını kullanmak,
- düşük stok ve gecikme verilerini yönetsel içgörüye dönüştürmek,
- serbest metin üzerinden daha doğal bir operasyon arayüzü sunmak.

### 10.2 AI ile hangi kanallardan konuşulur?

#### 1. Authenticated chat API

- `POST /api/chat/message`
- tam sayfa `/chat`
- global yüzen AI paneli

Bu, Gemini tabanlı gerçek AI katmandır.

#### 2. Bildirim özetleri

`NotificationService.get_daily_delay_summary()` geciken kargoları AI ile özetler ve yöneticiler için sistem raporu üretir.

#### 3. Public support endpoint'leri

`/api/support/*` endpoint'leri kullanıcı sorularını cevaplar, fakat LLM çağırmaz. Bunlar deterministik, read-only müşteri destek servisleridir. README boyunca bunları AI ile ilişkili destek yüzeyi olarak anıyoruz, ancak teknik olarak `/api/chat` akışından ayrıdır.

### 10.3 Temel dosyalar

| Dosya | Rolü |
| --- | --- |
| `backend/app/agent/orchestrator.py` | merkezi agent döngüsü |
| `backend/app/agent/prompts.py` | system prompt |
| `backend/app/agent/memory.py` | Redis konuşma hafızası |
| `backend/app/agent/tools/base.py` | base tool contract ve `ToolResult` |
| `backend/app/agent/tools/__init__.py` | `ToolRegistry` |
| `backend/app/agent/tools/order_tools.py` | sipariş tool'ları |
| `backend/app/agent/tools/inventory_tools.py` | stok tool'ları |
| `backend/app/agent/tools/cargo_tools.py` | kargo tool'u |

### 10.4 Orchestrator nasıl çalışır?

`AgentOrchestrator` akışı:

1. `ConversationMemory` üzerinden Redis'ten `session_id` bazlı konuşma geçmişi yüklenir.
2. Geçmiş + yeni kullanıcı mesajı Gemini `Content` formatına çevrilir.
3. `SYSTEM_PROMPT` ve tool declaration listesi ile Gemini'ye istek atılır.
4. Model function call üretirse ilgili tool `ToolRegistry` üzerinden çalıştırılır.
5. Tool sonucu tekrar modele verilir.
6. Model nihai metin cevabı üretirse cevap döndürülür.
7. Kullanıcı mesajı ve assistant cevabı Redis'e geri kaydedilir.

Bu döngü en fazla **5 iterasyon** ile sınırlandırılmıştır. Böylece sonsuz tool döngüsü engellenir.

### 10.5 Kullanılan model/provider durumu

Kod gerçeği şu şekildedir:

- `Settings` içinde `LLM_PROVIDER`, `LLM_MODEL`, `GEMINI_API_KEY` alanları vardır.
- aktif orchestrator implementasyonu `google.genai` istemcisi ile **Gemini** kullanır.
- `anthropic` bağımlılığı yüklü olsa da mevcut `AgentOrchestrator` içinde aktif provider switch yapılmamaktadır.

Pratik sonuç:

- AI chat'in düzgün çalışması için `GEMINI_API_KEY` gereklidir.
- `LLM_PROVIDER` şu an daha çok geleceğe dönük / konfigürasyon niyeti taşır.

### 10.6 Prompt davranışı

`prompts.py` içindeki system prompt:

- tüm yanıtların Türkçe olmasını ister,
- sipariş / telefon / stok / kritik stok / kargo sorularında ilgili tool'un zorunlu kullanılmasını ister,
- uydurma bilgi üretmemeyi zorunlu kılar,
- fiyat/iade/iptal gibi karar gerektiren konularda kullanıcıyı işletme yetkilisine yönlendirir.

Bu prompt, agent'i serbest üretim yapan bir chatbot yerine operasyonel güvenlik sınırları olan bir yardımcıya dönüştürür.

### 10.7 Memory sistemi

`ConversationMemory`:

- Redis üzerinde `chat:{session_id}` anahtarları kullanır,
- son **10 mesajı** tutar,
- TTL değeri `REDIS_CONVERSATION_TTL` ile yönetilir,
- varsayılan olarak 24 saatlik yaşam döngüsü hedefler,
- hata durumunda sistemi düşürmez; boş geçmiş ile devam eder.

Önemli ayrım:

- **Mesaj geçmişi** Redis'tedir.
- **Conversation SQL modeli** ise metadata tutar; tam chat transcript'i değildir.

### 10.8 Tool sistemi

Tool'lar `ToolRegistry` üzerinden modele function declaration olarak sunulur. Her tool bir servis çağırır; repository veya raw SQL'e doğrudan gitmez.

| Tool adı | Dosya | Veri kaynağı | Ne yapar? |
| --- | --- | --- | --- |
| `get_order_status` | `order_tools.py` | `OrderQueryService` | sipariş ID'sine göre sipariş durumu, tutar, müşteri, tarih |
| `get_orders_by_phone` | `order_tools.py` | `OrderQueryService` | telefon numarasına göre son 5 sipariş |
| `check_product_stock` | `inventory_tools.py` | `InventoryQueryService` | ürün adına göre stok ve low-stock bilgisi |
| `get_low_stock_report` | `inventory_tools.py` | `InventoryQueryService` | kritik stok listesini döndürür |
| `get_stock_prediction` | `inventory_tools.py` | `StockAnalysisService` | ürün ID'si için stok riski / tahmin analizi |
| `get_cargo_status` | `cargo_tools.py` | `CargoQueryService` | tracking number ile kargo durumu |

### 10.9 AI hangi backend servislerinden veri alır?

AI doğrudan ORM sorgusu yapmaz; aşağıdaki servisler üzerinden veri alır:

- `OrderQueryService`
- `InventoryQueryService`
- `StockAnalysisService`
- `CargoQueryService`
- dolaylı olarak `NotificationService` içindeki günlük özet akışı

Bu servisler de repository katmanı üzerinden DB erişimi yapar.

### 10.10 Güvenlik ve veri erişim sınırları

Mevcut agent tasarımı aşağıdaki güvenlik sınırlarına sahiptir:

- `/api/chat/message` authenticated kullanıcı ister
- chat endpoint'i rate-limitedir
- agent tool seti **read-only** veri sorgularına odaklanır
- agent üzerinden sipariş değiştirme, stok güncelleme, admin aksiyonu çalıştırma yoktur
- tool'lar service layer kullanır; repository/SQL'e doğrudan bağlanmaz
- konuşma geçmişi sınırlı ve TTL'li tutulur

### 10.11 AI ve frontend ilişkisi

Frontend tarafında AI iki yüzeyde kullanılır:

- `/chat` tam sayfa sohbet ekranı
- çoğu authenticated layout içinde görünen global AI paneli

Her iki yüzey de aynı backend `/api/chat` endpoint'ini kullanır. Ancak global AI paneli için ayrı Zustand provider (`AiPanelChatStoreProvider`) kullanıldığı için panel state'i, tam sayfa chat state'inden izoledir.

### 10.12 Örnek senaryolar

Mevcut kodun yanıtlayabildiği senaryolar:

- "Siparişim nerede?"
- "0532... numarasına ait siparişlerimi göster"
- "Bu ürün stokta var mı?"
- "Kritik stokta neler var?"
- "Şu takip numarasının kargosu nerede?"
- "Bugünkü geciken kargoların özetini çıkar"

Kısmen destekli / sınırlı senaryolar:

- stok tahminleri (`get_stock_prediction`) mümkün, ancak tool ürün adı değil `product_id` bekler
- doğal dilden çok karmaşık operasyon komutları için orchestration henüz sınırlıdır

### 10.13 Queue / worker durumu

AI ile ilişkili iki ek yapı daha vardır:

- `inventory_worker.py`: düşük stokları RabbitMQ kuyruğuna yollar
- `ai_consumer.py`: bu kuyruktaki mesajları Gemini ile kısa tavsiyeye dönüştürür

Ancak:

- bu akış default compose'ta çalışmaz,
- RabbitMQ servis tanımı eksiktir,
- `ai_consumer.py` aktif orchestrator'dan ayrı, daha deneysel/yardımcı bir script görünümündedir.

### 10.14 AI mimarisi hakkında dürüst notlar

- Aktif AI katmanı müşteri destek ve read-only operasyon soruları için uygundur.
- Çok adımlı write-action agent, görev planlama veya role-aware tool orchestration henüz yoktur.
- Public support endpoint'leri ile Gemini chat katmanı birbirinden ayrıdır; sistem tek bir omnichannel agent seviyesinde birleşmiş değildir.

## 11. Frontend Mimarisi

### 11.1 Organizasyon yapısı

Frontend, `frontend/` altında bir monorepo olarak kurulmuştur.

- `apps/web`: kullanıcıya görünen Next.js uygulaması
- `packages/core`: altyapı ve API client
- `packages/domain`: domain hook/API katmanı
- `packages/state`: query client + store'lar
- `packages/ui-web`: reusable bileşenler
- `packages/theme`: tasarım token'ları

Bu yapı, feature'leri doğrudan `app/` içine yığmak yerine, veri ve UI sorumluluklarını ayrıştırır.

### 11.2 Next.js başlangıç noktaları

Önemli dosyalar:

- `frontend/apps/web/app/layout.tsx`
- `frontend/apps/web/middleware.ts`
- `frontend/apps/web/components/providers/index.tsx`

`layout.tsx`:

- `Providers` ağacını kurar
- cookie varlığına göre auth başlangıç durumu verir
- `MessageContainer` ve `sonner` toaster'ı mount eder

`Providers`:

- `ThemeProvider`
- `QueryProvider`
- `SystemStoreProvider`
- `AuthStoreProvider`
- `UIStoreProvider`
- `MessageStoreProvider`
- `ChatStoreProvider`
- `SystemStatusSync`
- `AuthSessionSync`
- `SystemGate`

şeklinde katmanlanır.

### 11.3 App Router route yapısı

Route group'lar fiziksel klasör olarak ayrılmıştır:

- `(public)`
- `(authenticated)`
- `(admin)`
- `auth`

Ancak URL path'ler route group adlarını içermez.

### 11.4 Frontend sayfa haritası

#### Public / ortak sayfalar

| Route | Açıklama |
| --- | --- |
| `/` | role-aware home; public/customer/admin varyantı |
| `/auth/login` | giriş |
| `/auth/register` | kayıt |
| `/products` | ürün listesi |
| `/products/[id]` | ürün detay sayfası |

#### Authenticated ortak sayfalar

| Route | Açıklama |
| --- | --- |
| `/chat` | authenticated AI chat |
| `/profile` | profil ve adres yönetimi |

#### Customer odaklı sayfalar

| Route | Açıklama |
| --- | --- |
| `/orders/my` | customer sipariş listesi |
| `/orders/my/[id]` | customer sipariş detayı |

#### Admin odaklı sayfalar

| Route | Açıklama |
| --- | --- |
| `/dashboard` | genel bakış ekranı |
| `/dashboard/products` | ürün yönetim listesi |
| `/dashboard/products/new` | yeni ürün oluşturma |
| `/dashboard/products/[id]` | ürün düzenleme/detay |
| `/orders` | sipariş listesi |
| `/orders/[id]` | sipariş detayı ve status güncelleme |
| `/inventory` | envanter ve düşük stok görünümü |
| `/shipments` | kargo listeleme, özet ve oluşturma |
| `/shipments/[tracking_number]` | kargo detay sayfası |
| `/notifications` | bildirim merkezi |

### 11.5 Veri akışı

Frontend veri akışı genel olarak şu modeldedir:

```text
Page
→ UI component
→ domain hook
→ domain API module / client
→ @repo/core ApiClient
→ backend ApiResponse
→ TanStack Query cache
→ UI render
```

### 11.6 API client yapısı

`frontend/packages/core/client/client.ts`:

- base URL `NEXT_PUBLIC_API_BASE_URL`
- tüm isteklerde `credentials: "include"`
- `Authorization` header'ını bilerek kaldırır
- backend `ApiResponse<T>` formatını parse eder
- HTTP hata veya `statusCode >= 400` durumunda `ApiError` fırlatır

Bu nedenle frontend auth modeli tamamen cookie tabanlıdır; access token Zustand'a yazılmaz.

### 11.7 TanStack Query kullanımı

`frontend/packages/state/query/client.ts`:

- ortak query client tanımlar
- retry/backoff davranışı merkezidir
- bazı sistem-hazırlık hata anahtarlarında retry kapatılır

`packages/domain/*/hooks` yapısında:

- query key standardizasyonu vardır
- mutation sonrası ilgili query'ler invalidate edilir
- çoğu hook `useSystemReady()` kontrolü ile backend hazır değilse çalışmaz

### 11.8 Zustand state yönetimi

Önemli store'lar:

- `authStore`: user, session loading, isAuthenticated
- `systemStore`: health status / ready / error
- `chatStore`: session id, optimistic messages, typing durumu
- `uiStore`: panel ve genel UI state'leri
- `messageStore`: uygulama içi mesajlaşma / toast benzeri yapı

### 11.9 Auth ve redirect akışı

- Next middleware UX-level guard sağlar
- `AuthSessionSync` backend `/api/auth/me` ile gerçek session'ı doğrular
- `handleUnauthorized()` istemci tarafında 401 alınırsa `/auth/login` yönlendirmesi yapar

### 11.10 Backend hazır değilken frontend nasıl davranır?

`SystemStatusSync`, health query'si üzerinden uygulama açılışında ve query invalidation sonrası `/health` endpoint'ini çağırır. `SystemGate`:

- backend erişilemiyorsa hata paneli gösterir,
- migration eksikse kurulum ekranı gösterir,
- seed eksikse kullanıcıyı bilgilendirir,
- sistem hazır olana kadar ana uygulama UI'ını bloklar.

Bu davranış, ilk kurulum ve demo senaryoları için önemlidir.

### 11.11 Admin ekranlarının veri kaynakları

#### Dashboard

- `useDashboardOverview()`
- günlük toplam gelir
- toplam sipariş
- pending/processing iş yükü
- shipped/delivered metrikleri
- son 7 günlük performans grafiği

#### Ürünler

- `useProducts()`
- `useProduct()`
- `useCreateProduct()`
- `useUpdateProduct()`
- `useDeleteProduct()`

#### Siparişler

- `useOrders()`
- `useOrder()`
- `useUpdateOrderStatus()`

#### Envanter

- `useInventory()`
- `useLowStock()`
- `useUpdateStock()`

#### Kargolar

- `useShipments()`
- `useShipment()`
- `useCreateShipment()`
- `useRefreshShipment()`
- `useDelayedShipments()`

#### Bildirimler

- `useNotifications()`
- `useUnreadNotifications()`
- `useDailySummary()`
- `useNotificationStream()`
- `useMarkNotificationRead()`
- `useMarkAllNotificationsRead()`

### 11.12 Customer akışları

#### Ürün inceleme ve sipariş oluşturma

- customer ürün listesinden ürün seçer
- detay sayfasında `OrderCreateSheet` açılır
- sipariş tek adımlı direct checkout olarak oluşturulur
- ayrı cart / sepet akışı yoktur

Sipariş oluşturma sırasında gönderim adresi order içine snapshot olarak yazılır; bu yapı kullanıcı profilindeki varsayılan adresten bağımsızdır.

#### Sipariş takibi

- `/orders/my`
- `/orders/my/[id]`

#### Profil

- `ProfileForm`
- `AddressForm`

### 11.13 Chat/support ekranı

#### Tam sayfa chat

`@repo/ui-web/components/chat/ChatWindow.tsx`:

- session id yönetir
- geçmişi yükler
- mesaj gönderir
- optimistic render yapar
- gönderim sonrası history query invalidate edilir

#### Global AI paneli

`GlobalAiAssistant`:

- authenticated layout'larda görünür
- `/chat` sayfasında gizlenir
- ayrı provider ile izole store kullanır

### 11.14 Notifications canlı akışı

Frontend notifications katmanı SSE kullanır:

- `/api/notifications/stream` ile `EventSource` bağlantısı açılır
- reconnect/backoff mantığı vardır
- event geldikçe notification query'leri invalidate edilir

### 11.15 Public support tarafı hakkında önemli not

Frontend domain katmanında `customer` support hook'ları (`useOrderLookup`, `useStockQuery`, `useCargoTracking`) tanımlıdır. Ancak mevcut `apps/web` route yapısında bu endpoint'leri kullanan ayrı bir public destek sayfası görünmemektedir. Yani backend destek API'leri hazırdır; frontend wiring bu bölümde henüz tamamlanmamış görünür.

## 12. Veri Modeli ve Domain İlişkileri

### Ana modeller

| Model | Amaç |
| --- | --- |
| `User` | auth kimliği ve sistem kullanıcısı |
| `UserAddress` | kullanıcının varsayılan adresi |
| `Customer` | destek / konuşma / kontakt odaklı müşteri varlığı |
| `Product` | ürün katalog kaydı |
| `Inventory` | ürünün stok kaydı |
| `InventoryMovement` | stok hareketleri |
| `Order` | sipariş ana kaydı |
| `OrderItem` | sipariş satırları |
| `OrderStatusHistory` | sipariş statü geçiş geçmişi |
| `Shipment` | siparişe bağlı kargo kaydı |
| `ShipmentEvent` | kargo olay zaman çizelgesi |
| `Notification` | operasyon bildirimleri |
| `Conversation` | konuşma metadata kaydı |
| `AuditLog` | değişiklik/audit kaydı |
| `SeedRun` | seed sürüm takibi |

### İlişki haritası

```text
User
 ├── UserAddress (1-1)
 ├── Orders (1-N)
 ├── OrderStatusHistory (1-N)
 ├── InventoryMovements (1-N)
 └── AuditLogs (1-N)

Product
 ├── Inventory (1-1)
 ├── OrderItems (1-N)
 └── InventoryMovements (1-N)

Order
 ├── OrderItems (1-N)
 ├── Shipment (1-1)
 ├── OrderStatusHistory (1-N)
 └── InventoryMovements (1-N)

Shipment
 └── ShipmentEvents (1-N)

Customer
 └── Conversations (1-N)
```

### Önemli model notları

#### `User` ve `Customer` ayrımı

Bu kod tabanında `User` ile `Customer` aynı şey değildir:

- `User`: auth yapan gerçek uygulama kullanıcısıdır
- `Customer`: destek, iletişim kanalı ve conversation metadata için ayrı bir domaindir

En kritik fark:

- `Order.customer_id` artık **`users.id`** alanına bağlıdır
- `Customer` modeli sipariş sahibi olmaktan çok destek/iletişim tarafında kullanılır

#### `Order`

`Order` modeli:

- `customer_id` ile `User`'a bağlıdır
- shipping alanlarını snapshot olarak kendi üzerinde tutar
- `shipment` ile birebir ilişkilidir

#### `Inventory`

- `quantity`
- `reserved_quantity`
- `low_stock_threshold`
- `available_quantity` property

Mevcut order akışında rezervasyon yerine doğrudan stok düşümü kullanılır; `reserved_quantity` alanı ileri akışlara açık bir altyapı sunar.

#### `Notification`

Notification modeli artık context'i doğrudan foreign key yerine ağırlıklı olarak `payload` JSONB alanında taşır. Bu, bildirim tiplerini esnek genişletmek için seçilmiş görünür.

#### `Conversation`

`Conversation` tablosu tam chat transcript saklamaz. Mesaj geçmişi Redis'te tutulur; SQL tarafta session metadata vardır.

## 13. Database, Migration ve Seed Sistemi

### 13.1 PostgreSQL kullanımı

Varsayılan veritabanı PostgreSQL'dir.

- container içi port: `5432`
- host port: `5433`

Docker içinde backend, DB'ye `db:5432` üzerinden bağlanır. Dışarıdan bağlanmak için `localhost:5433` kullanılır.

### 13.2 Alembic migration akışı

Migration dosyaları `backend/alembic/versions/` altındadır. Önemli migration başlıkları:

- initial schema
- notification foundation refactor
- orders/customer direct checkout dönüşümü
- user default address yapısı
- seed metadata tablosu
- legacy role normalization

### 13.3 Seed sistemi

`backend/scripts/seed_all.py`:

- idempotent çalışır
- `seed_runs` tablosu üzerinden versiyon takibi yapar
- aynı seed versiyonu tekrar çalıştırıldığında duplicate veri üretmez

Seed; demo kullanıcılar, adresler, ürünler, stoklar, siparişler, kargolar, shipment event'leri, inventory movement kayıtları, bildirimler, conversation metadata, Redis chat history ve audit log kayıtları üretir.

### 13.4 Demo kullanıcıları

Mevcut seed dosyasında öne çıkan girişler:

| Rol | Email | Şifre |
| --- | --- | --- |
| Admin | `admin@kobi.local` | `Admin123!` |
| Admin / işletme sahibi | `isletme@kobi.local` | `Demo12345!` |
| Demo customer | `demo@kobi.local` | `Demo12345!` |

Not:

- Eski README'deki `operasyon@kobi.local` hesabı mevcut seed gerçeğiyle uyumlu görünmüyor.
- Bu README'de yalnızca seed script'te doğrulanabilen hesaplar listelenmiştir.

### 13.5 Uygulama ilk açılışta ne yapar?

Container başlangıcında:

1. PostgreSQL bağlantısı beklenir
2. Alembic bootstrap kontrolü yapılır
3. migration head uygulanır
4. merkezi seed script çalışır
5. app ayağa kalkar

`seed_all.py` her restart'ta güvenle tetiklenebilir:

- aynı seed daha önce başarıyla çalıştıysa duplicate üretmeden skip edilir
- seed metadata yok ama mevcut iş verisi varsa demo veri enjekte etmemek için otomatik skip edilir
- boş veya daha önce yarım kalmış demo DB'de idempotent upsert mantığıyla çalışır

Frontend ise `/health` üzerinden:

- DB bağlantısı hazır mı?
- migration tamam mı?
- seed data var mı?

sorularını kontrol eder.

### 13.6 Veritabanı boşsa sistem nasıl davranır?

- Backend bazı DB hatalarını `DATABASE_NOT_READY` olarak döndürür
- `/health` `ready=false` döner
- Frontend `SystemGate` üzerinden kurulum eksik uyarısı verir

Bu davranış demo ortamında önemli bir güvenlik katmanıdır.

## 14. Docker ve Local Development

### 14.1 Gereksinimler

- Docker
- Docker Compose v2+
- Python 3.12+
- Poetry
- Node.js `>=20`
- pnpm `>=9`

### 14.2 Portlar

| Bileşen | Container | Host |
| --- | --- | --- |
| Backend API | `8000` | `8000` |
| PostgreSQL | `5432` | `5433` |
| Redis | `6379` | `6380` |
| Frontend (Next dev) | `3000` | `3000` varsayılan |

Frontend için compose servisi yoktur; Next.js varsayılan geliştirme portu `3000` kullanılır.

### 14.3 Docker ile hızlı başlangıç

#### Backend env oluştur

```bash
cp backend/.env.example backend/.env
```

#### Stack'i ayağa kaldır

```bash
docker compose up --build -d
```

Bu akışta `api` container'ı sırasıyla PostgreSQL'i bekler, migration çalıştırır, seed yükler ve en son FastAPI'yi başlatır. Manuel `alembic upgrade` veya `python scripts/seed_all.py` çalıştırmak gerekmez.

#### Log kontrolü

```bash
docker compose logs -f api
```

#### Durdur

```bash
docker compose down
```

#### Temiz veritabanı ile yeniden kur

```bash
docker compose down -v
docker compose up --build -d
```

### 14.4 Frontend local başlatma

Örnek frontend env değerleri `frontend/apps/.env.example` altında tutuluyor. Next.js uygulaması için pratik yaklaşım, bu içeriği `frontend/apps/web/.env.local` dosyasına taşımaktır.

```bash
cd frontend
pnpm install
pnpm dev
```

Bu komut `turbo run dev` ile workspace'i çalıştırır; mevcut repo yapısında ana UI uygulaması `apps/web`'dir.

### 14.5 Backend'i Docker dışında çalıştırma

Docker içindeki `backend/.env.example` varsayılan olarak:

- `DATABASE_URL=...@db:5432/...`
- `REDIS_URL=redis://redis:6379/0`

kullanır. Backend'i host makinede Docker dışından çalıştıracaksanız bu değerleri host portlarına göre uyarlamanız gerekir:

```env
DATABASE_URL=postgresql+asyncpg://kobi_user:kobi_pass@localhost:5433/kobi_db
REDIS_URL=redis://localhost:6380/0
```

### 14.6 Cookie tabanlı local geliştirme notu

Cookie auth nedeniyle `localhost` ve `127.0.0.1` karışık kullanıldığında session davranışı şaşabilir. Frontend ve backend'e erişirken mümkün olduğunca tek host adıyla tutarlı kalın.

## 15. Ortam Değişkenleri

Tam örnekler için:

- `backend/.env.example`
- `frontend/apps/.env.example`

incelenmelidir. Aşağıdaki tablolar ana değişkenleri özetler.

### 15.1 Backend env değişkenleri

| Variable | Required | Açıklama | Örnek |
| --- | --- | --- | --- |
| `APP_NAME` | Hayır | uygulama adı | `KOBİ Agent` |
| `ENVIRONMENT` | Hayır | `development/staging/production` | `development` |
| `DEBUG` | Hayır | debug mod | `true` |
| `API_PREFIX` | Hayır | API prefix | `/api` |
| `CORS_ORIGINS` | Hayır | izinli origin listesi | `["http://localhost:3000"]` |
| `DATABASE_URL` | Evet | async PostgreSQL bağlantısı | `postgresql+asyncpg://...@db:5432/kobi_db` |
| `REDIS_URL` | Evet | Redis bağlantısı | `redis://redis:6379/0` |
| `SECRET_KEY` | Evet | JWT imzalama anahtarı, min 32 karakter | `dev-only-secret-key-...` |
| `JWT_ALGORITHM` | Hayır | JWT algoritması | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Hayır | access token süresi | `1440` |
| `REFRESH_TOKEN_EXPIRE_MINUTES` | Hayır | refresh token süresi | `10080` |
| `AUTH_ACCESS_COOKIE_NAME` | Hayır | access cookie adı | `access_token` |
| `AUTH_REFRESH_COOKIE_NAME` | Hayır | refresh cookie adı | `refresh_token` |
| `AUTH_COOKIE_PATH` | Hayır | cookie path | `/` |
| `AUTH_COOKIE_SECURE` | Hayır | secure cookie | `false` |
| `AUTH_COOKIE_SAMESITE` | Hayır | same-site politikası | `lax` |
| `GEMINI_API_KEY` | AI için evet | aktif AI sağlayıcı anahtarı | `your-key` |
| `LLM_PROVIDER` | Hayır | provider niyeti | `gemini` |
| `LLM_MODEL` | Hayır | model adı | `gemini-2.5-flash` |
| `USE_MOCK_CARGO` | Hayır | mock cargo provider kullanımı | `true` |
| `CARGO_API_KEY` | Hayır | gelecekte gerçek cargo entegrasyonu için | boş bırakılabilir |
| `RABBITMQ_URL` | Hayır | opsiyonel worker akışı | `amqp://guest:guest@localhost:5672/` |
| `SEED_ADMIN_EMAIL` | Hayır | seed admin email override | `admin@kobi.local` |
| `SEED_ADMIN_PASSWORD` | Hayır | seed admin şifresi | `Admin123!` |
| `SEED_OWNER_EMAIL` | Hayır | seed owner email | `isletme@kobi.local` |
| `SEED_DEMO_EMAIL` | Hayır | demo customer email | `demo@kobi.local` |
| `SEED_DEMO_PASSWORD` | Hayır | demo customer şifresi | `Demo12345!` |

### 15.2 Frontend env değişkenleri

| Variable | Required | Açıklama | Örnek |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Evet | backend ana host'u | `http://localhost:8000` |
| `NEXT_PUBLIC_AUTH_API_URL` | Hayır | auth base path | `/api/auth` |
| `NEXT_PUBLIC_CHAT_API_URL` | Hayır | chat base path | `/api/chat` |
| `NEXT_PUBLIC_PRODUCTS_API_URL` | Hayır | products base path | `/api/products` |
| `NEXT_PUBLIC_ORDERS_API_URL` | Hayır | orders base path | `/api/orders` |
| `NEXT_PUBLIC_INVENTORY_API_URL` | Hayır | inventory base path | `/api/inventory` |
| `NEXT_PUBLIC_SHIPMENTS_API_URL` | Hayır | shipments base path | `/api/shipments` |
| `NEXT_PUBLIC_NOTIFICATIONS_API_URL` | Hayır | notifications base path | `/api/notifications` |
| `NEXT_PUBLIC_HEALTH_API_URL` | Hayır | health endpoint'i | `/health` |
| `NEXT_PUBLIC_AI_API_URL` | Hayır | örnek env'de var, fakat mevcut aktif client akışında kullanılmıyor | `/api/ai` |

### 15.3 Frontend kodunda desteklenip env example'da görünmeyen opsiyonel değişkenler

Kodda default fallback ile kullanılan ek değişkenler:

- `NEXT_PUBLIC_USER_API_URL` → varsayılan `/api/user`
- `NEXT_PUBLIC_CUSTOMER_SUPPORT_API_URL` → varsayılan `/api/support`

Bu iki değişken örnek env dosyasında yer almıyor, ancak client kodu bunları destekliyor.

## 16. Çalıştırma Komutları

### 16.1 Docker

```bash
docker compose up --build
docker compose up -d
docker compose ps
docker compose logs -f api
docker compose down
docker compose down -v
```

### 16.2 Backend bağımlılık kurulumu

```bash
cd backend
poetry install
```

### 16.3 Backend development server

```bash
cd backend
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 16.4 Migration komutları

```bash
cd backend
poetry run alembic upgrade head
poetry run alembic revision --autogenerate -m "your_message"
```

### 16.5 Seed komutları

Container startup'ında seed otomatik çalışır. Manuel çalıştırmak yalnızca gerektiğinde kullanılır:

```bash
cd backend
poetry run python scripts/seed_all.py
```

Container içinde:

```bash
docker compose exec api python scripts/seed_all.py
```

### 16.6 Backend kalite komutları

```bash
cd backend
poetry run ruff check .
poetry run pytest
```

Not: `pytest` yapılandırması mevcut olsa da repoda görünür test kapsamı sınırlıdır; `backend/test_kobi.py` bir RabbitMQ/AI akışı deneme script'i niteliğindedir, klasik test suite karşılığı değildir.

### 16.7 Frontend bağımlılık kurulumu

```bash
cd frontend
pnpm install
```

### 16.8 Frontend development

```bash
cd frontend
pnpm dev
```

Sadece web app için:

```bash
cd frontend
pnpm --filter @repo/web dev
```

### 16.9 Frontend kalite komutları

```bash
cd frontend
pnpm lint
pnpm typecheck
pnpm --filter @repo/web type-check
pnpm build
```

## 17. Response Formatı ve Hata Yönetimi

### 17.1 Standart response formatı

Backend şu şemayı standartlaştırır:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "İşlem başarıyla tamamlandı.",
  "data": null,
  "errors": null
}
```

Alanların anlamı:

- `statusCode`: uygulama seviyesi durum kodu
- `key`: makinece okunabilir sonuç anahtarı
- `message`: kullanıcıya gösterilebilir mesaj
- `data`: asıl payload
- `errors`: field-level veya detay hata listesi

### 17.2 Frontend bunu nasıl parse eder?

`ApiClient`:

- ham HTTP response'u okur
- `ApiResponse<T>` formatını parse eder
- response `ok` değilse veya `statusCode >= 400` ise `ApiError` fırlatır

Bu sayede tüm domain hook'lar tek tip hata nesnesi ile çalışır.

### 17.3 Validasyon hataları

Validation hataları:

- `422`
- `VALIDATION_ERROR`
- `errors` listesi içinde `field` + `message`

şeklinde döner.

### 17.4 Sistem readiness / sağlık kontrolleri

`/health` response'u aşağıdaki gibi alanlar döndürür:

- `ready`
- `databaseReady`
- `migrationsReady`
- `seedReady`
- `missingTables`
- `message`

Frontend bu payload'u doğrudan sistem kapısı olarak kullanır.

## 18. Demo Akışı

### Admin demo akışı

1. `admin@kobi.local` veya `isletme@kobi.local` ile giriş yapın
2. `/dashboard` üzerinden toplam gelir, sipariş ve haftalık performansı inceleyin
3. `/dashboard/products` altında ürünleri görüntüleyin
4. `/inventory` ekranında düşük stokları ve kritik ürünleri kontrol edin
5. `/orders` ekranında siparişleri açın ve status değiştirin
6. `/shipments` ekranında kargo oluşturun veya geciken kargoları filtreleyin
7. `/notifications` ekranında canlı bildirim akışını inceleyin
8. `/chat` veya global AI panelinden stok/sipariş/kargo soruları sorun

### Customer demo akışı

1. `demo@kobi.local / Demo12345!` ile giriş yapın
2. `/products` üzerinden katalogu inceleyin
3. Bir ürün detayına girip doğrudan sipariş oluşturun
4. `/orders/my` üzerinden kendi siparişlerinizi kontrol edin
5. `/chat` ekranında AI asistanına sipariş veya ürün sorusu sorun
6. `/profile` üzerinden profil ve adres bilgilerinizi güncelleyin

## 19. Geliştirme Standartları

### 19.1 Yeni backend endpoint ekleme standardı

1. `schemas/` altında request/response şeması tanımlayın
2. `repositories/` katmanına veri erişimini ekleyin
3. `services/` katmanında business logic yazın
4. `api/endpoints/` altında route tanımlayın
5. `api/router.py` içine router'ı bağlayın
6. `success_response()` / standart hata modeli kullanın

### 19.2 Yeni frontend sayfası ekleme standardı

1. `apps/web/app/` altında route oluşturun
2. gerekli API çağrılarını `packages/domain/<domain>` içine ekleyin
3. server state için TanStack Query hook'u yazın
4. UI bileşenlerini `packages/ui-web` veya app-level component olarak yerleştirin
5. gerekiyorsa access policy ve navigation listelerini güncelleyin

### 19.3 Yeni AI tool ekleme standardı

1. `backend/app/agent/tools/` altında yeni tool sınıfı oluşturun
2. tool'un veri kaynağını bir service üzerinden çağırın
3. `ToolResult` dönecek şekilde contract'ı uygulayın
4. `AgentOrchestrator._build_registry()` içine tool'u register edin
5. gerekiyorsa `prompts.py` içindeki system prompt yönergelerini güncelleyin

### 19.4 Yeni model / migration ekleme standardı

1. ORM modeli `models/` altında tanımlayın
2. ilgili schema/repository/service alanlarını güncelleyin
3. Alembic migration üretin
4. seed gerekiyorsa `scripts/seed_all.py` içine idempotent şekilde ekleyin
5. `/health` readiness ve demo akışına etkisini düşünün

### 19.5 Auth protected route ekleme standardı

1. backend'de uygun dependency (`get_current_user`, `get_admin_user`) ekleyin
2. frontend'de `packages/domain/auth/access/policy.ts` dosyasını güncelleyin
3. gerekirse navigation listelerini düzenleyin
4. 401/403 davranışının UI tarafında bozulmadığını kontrol edin

### 19.6 Response format standardı

Yeni endpoint'ler:

- ham dict dönmemeli,
- mümkün olduğunca `success_response()` kullanmalı,
- hata durumlarında `AppException` türevleri tercih edilmeli,
- frontend `ApiClient` ile uyumlu `ApiResponse` yapısını korumalıdır.

## 20. Bilinen Sınırlamalar ve Gelecek Geliştirmeler

Kod tabanından görülen mevcut sınırlamalar:

- rol sistemi şu anda sadece `admin` / `customer` düzeyindedir
- frontend compose akışına dahil değildir
- RabbitMQ worker akışı kodda var ama default ortamda çalışmıyor
- AI orchestration read-only ve sınırlı tool seti ile çalışıyor
- aktif provider implementasyonu fiilen Gemini'ye bağlı
- gerçek kargo entegrasyonu henüz mock provider seviyesinde
- payment / iade / iptal gibi transaction akışları yok
- cart/sepet akışı yok, checkout doğrudan tek adım
- forecast endpoint'i var ama buna bağlı belirgin bir frontend ekranı yok
- public support hook'ları frontend route seviyesinde tam bağlanmış görünmüyor
- test kapsamı sınırlı
- `reserved_quantity` ve bazı ileri operasyon alanları geleceğe dönük hazırlık niteliğinde

Gerçekçi sonraki adımlar:

- daha ayrıntılı role/permission sistemi
- AI tool orchestration'ın write-safe aksiyonlara genişletilmesi
- gerçek cargo provider entegrasyonu
- ödeme ve iade süreçleri
- gelişmiş analytics / forecasting ekranları
- production monitoring / tracing
- daha yüksek test coverage
- admin kullanıcı yönetimi
- çok kanallı müşteri bildirimleri

## 21. Hızlı Başlangıç Dosya Rehberi

Projeyi devralan bir geliştirici veya AI agent için ilk bakılması gereken dosyalar:

| Amaç | Dosya |
| --- | --- |
| Backend giriş noktası | `backend/app/main.py` |
| API router ağacı | `backend/app/api/router.py` |
| Auth endpoint'leri | `backend/app/api/endpoints/auth.py` |
| Order domain | `backend/app/api/endpoints/orders.py`, `backend/app/services/order_service.py` |
| Inventory domain | `backend/app/api/endpoints/inventory.py`, `backend/app/services/inventory_service.py` |
| Shipment domain | `backend/app/api/endpoints/shipments.py`, `backend/app/services/shipment_service.py` |
| AI orchestrator | `backend/app/agent/orchestrator.py` |
| AI prompt | `backend/app/agent/prompts.py` |
| AI tools | `backend/app/agent/tools/` |
| Notification akışı | `backend/app/api/endpoints/notifications.py`, `backend/app/services/notification_service.py` |
| Migration sistemi | `backend/alembic/env.py`, `backend/alembic/versions/` |
| Seed sistemi | `backend/scripts/seed_all.py` |
| Frontend layout / provider ağacı | `frontend/apps/web/app/layout.tsx`, `frontend/apps/web/components/providers/index.tsx` |
| Frontend route guard | `frontend/apps/web/middleware.ts`, `frontend/packages/domain/auth/access/policy.ts` |
| Frontend API client | `frontend/packages/core/client/client.ts` |
| Domain hook yapısı | `frontend/packages/domain/` |
| Global state | `frontend/packages/state/` |
| Reusable UI | `frontend/packages/ui-web/` |

## 22. Ek Notlar

- Swagger / OpenAPI dokümantasyonu debug modunda `http://localhost:8000/docs` altında erişilebilir.
- `frontend/service_info.md`, `frontend/User-settings.md` ve bazı `backend/md/*.md` dosyaları yardımcı referanslar içerir; ancak bu README ve çalışan kod daha güncel kaynak olarak değerlendirilmelidir.
- Bu README, mevcut repo durumu üzerinden hazırlanmıştır. Kod ilerledikçe özellikle env example'lar, frontend support sayfaları ve worker entegrasyonlarının tekrar eşlenmesi gerekir.
