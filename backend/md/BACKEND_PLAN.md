# KOBİ AI Agent — Backend Mimari & Geliştirme Planı

> Bu döküman hem geliştirici yol haritası hem de AI geliştirme ajanı için referans kaynaktır.
> Her karar gerekçelidir. Her katmanın tek ve net bir sorumluluğu vardır.
> SOLID, DRY ve Clean Architecture prensipleri esas alınmıştır.

---

## İçindekiler

1. [Proje Vizyonu ve Kapsam](#1-proje-vizyonu-ve-kapsam)
2. [Teknoloji Seçimleri ve Gerekçeleri](#2-teknoloji-seçimleri-ve-gerekçeleri)
3. [Sistem Mimarisi](#3-sistem-mimarisi)
4. [Tam Proje Ağacı](#4-tam-proje-ağacı)
5. [Katman Görev Tanımları](#5-katman-görev-tanımları)
6. [Standart API Response Sistemi](#6-standart-api-response-sistemi)
7. [Exception Handling ve Hata Yönetimi](#7-exception-handling-ve-hata-yönetimi)
8. [Validation Sistemi](#8-validation-sistemi)
9. [Güvenlik Mimarisi](#9-güvenlik-mimarisi)
10. [Logging ve İzlenebilirlik](#10-logging-ve-i̇zlenebilirlik)
11. [Veritabanı Şeması](#11-veritabanı-şeması)
12. [Agent ve Tool Sistemi](#12-agent-ve-tool-sistemi)
13. [Data Flow — Senaryo Bazlı](#13-data-flow--senaryo-bazlı)
14. [Docker Kurulumu](#14-docker-kurulumu)
15. [Geliştirme Yol Haritası — Gün Gün](#15-geliştirme-yol-haritası--gün-gün)
16. [API Endpoint Sözlüğü](#16-api-endpoint-sözlüğü)
17. [Geliştirme Kuralları](#17-geliştirme-kuralları)

---

## 1. Proje Vizyonu ve Kapsam

### Problem

KOBİ'ler ve kooperatifler günlük operasyonlarını büyük ölçüde manuel yürütmektedir:

- Müşteri soruları ("siparişim nerede?") iş gücü ve zaman tüketir.
- Stok tükenmesi fark edilmeden müşteri kaybedilir.
- Kargo gecikmeleri, müşteri şikayet etmeden önce tespit edilemez.
- İş akışları kişiden kişiye farklılaşır; büyüdükçe kaos artar.

Bu proje, söz konusu süreçleri yapay zeka destekli bir sistemle otomatize eder.

### Çözüm Kapsamı (3 Günlük MVP)

| Modül | Açıklama | Öncelik |
|-------|----------|---------|
| **Müşteri İletişim Ajanı** | Doğal dil ile sipariş/stok sorgusu, otomatik yanıt üretme | P0 |
| **Sipariş & Ürün Takibi** | Anlık sipariş durumu ve ürün stok bilgisi | P0 |
| **Stok & Envanter Yönetimi** | Kritik eşik uyarıları ve otomatik bildirim | P1 |
| **Kargo Süreç Yönetimi** | Kargo durumu sorgulama ve gecikme tespiti | P1 |
| **Yönetici Dashboard API** | Günlük özet ve bekleyen sipariş görünümü | P2 |

### Hedef Kullanıcılar

- **Müşteri:** Web chat veya WhatsApp üzerinden sipariş sorgular.
- **İşletme Yöneticisi:** Dashboard üzerinden günlük operasyonu izler.
- **Sistem:** Otomatik stok uyarıları üretir, bildirim gönderir.

---

## 2. Teknoloji Seçimleri ve Gerekçeleri

### Backend Framework — FastAPI

**Neden FastAPI:**
- `async/await` native desteği: aynı anda yüzlerce isteği bloke etmeden işler.
- Pydantic ile otomatik request/response validasyonu sağlar.
- Otomatik OpenAPI (Swagger) dokümantasyonu üretir.
- Python AI/ML ekosistemiyle mükemmel uyum içindedir.

**Neden Django veya Flask değil:** Django sync-first mimariye sahiptir ve gereksiz yük getirir. Flask'ta async desteği sonradan eklenmiştir ve tip güvenliği yoktur.

### Veritabanı — PostgreSQL

**Neden PostgreSQL:**
- ACID uyumludur: sipariş ve stok gibi kritik verilerde tutarlılık zorunludur.
- JSON kolon desteği ile esnek veri saklama imkânı sunar.
- `asyncpg` async sürücüsü sayesinde FastAPI ile tam uyum sağlar.
- Production ortamında kanıtlanmış, ölçeklenebilir bir yapıya sahiptir.

**Neden SQLite veya MongoDB değil:** SQLite eşzamanlı yazma kilitlenmesi yaşatır. MongoDB ise ilişkisel veri için zayıf kalır.

### ORM — SQLAlchemy 2.0

**Neden SQLAlchemy 2.0:**
- Native async desteği sunar (1.x sürümünde bu destek yoktu).
- Type-safe query builder ile güvenli sorgular yazılır.
- Alembic migration aracıyla entegre çalışır.
- Repository pattern ile temiz bir soyutlama katmanı kurulmasına olanak tanır.

**Kullanıldığı yer:** `app/models/` ve `app/repositories/`

### Cache / Konuşma Hafızası — Redis

**Neden Redis:**
- Agent konuşma geçmişi her mesajda PostgreSQL'e sorgu atmak yerine Redis'te tutulur.
- In-memory yapısı sayesinde mikrosaniye düzeyinde okuma performansı sağlar.
- TTL (yaşam süresi) desteği ile eski konuşmalar otomatik temizlenir.
- İleride rate limiting ve task queue için de kullanılabilir.

**Kullanıldığı yer:** `app/agent/memory.py`

### Migration — Alembic

**Neden Alembic:**
- Veritabanı şema değişikliklerini versiyon kontrolüne alır.
- "Şu tabloya şu kolon ekle" işlemi kod olarak saklanır ve geri alınabilir (downgrade).
- Ekip çalışmasında şema çakışmalarını önler.

**Kullanıldığı yer:** `alembic/` klasörü

### HTTP Client — httpx

**Neden httpx:**
- Kargo API'leri gibi dış servislere async HTTP isteği atmak için kullanılır.
- Python'un `requests` kütüphanesi sync çalışır ve FastAPI event loop'unu bloke eder.
- `httpx.AsyncClient` ile non-blocking dış servis çağrısı mümkündür.

**Kullanıldığı yer:** `app/integrations/`

### Validation — Pydantic v2

**Neden Pydantic:**
- Request geldiğinde otomatik tip dönüşümü ve doğrulama yapar.
- Response dönerken şema garantisi sağlar.
- Settings yönetimini `pydantic-settings` ile merkezileştirir.
- FastAPI ile native olarak entegre çalışır.

**Kullanıldığı yer:** `app/schemas/`, `app/core/config.py`

### AI / LLM SDK

**Tercih:** Projenin kullandığı LLM sağlayıcısının resmi Python SDK'sı (Anthropic, OpenAI vb.)

**Gereksinimler:**
- Native tool/function calling desteği
- Async HTTP client uyumluluğu
- Streaming response desteği (ileride)

**Kullanıldığı yer:** `app/agent/orchestrator.py`

### Containerization — Docker + Docker Compose

**Neden Docker:**
- "Bende çalışıyor, sende çalışmıyor" sorununu ortadan kaldırır.
- PostgreSQL ve Redis'i local kurulum gerektirmeden başlatır.
- Volume mount ile kod değişikliği anında yansır (`--reload`).
- Production geçişi için aynı `Dockerfile` kullanılır.

**Yaklaşım:** FastAPI + PostgreSQL + Redis tek `docker-compose up` komutuyla başlar.

### Dependency Management — Poetry

**Neden Poetry:**
- `requirements.txt`'e göre deterministik bağımlılık çözümü sağlar.
- Virtual environment yönetimi otomatiktir.
- `pyproject.toml` ile tek konfigürasyon dosyasında toplanır.

---

## 3. Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                                                          │
│  ┌──────────┐    ┌──────────────────────────────────┐   │
│  │ React UI │───▶│         FastAPI Backend           │   │
│  │  (dış)   │    │                                   │   │
│  └──────────┘    │  ┌─────────┐  ┌───────────────┐  │   │
│                  │  │   API   │  │ Agent         │  │   │
│                  │  │ Layer   │  │ Orchestrator  │  │   │
│                  │  └────┬────┘  └──────┬────────┘  │   │
│                  │       │              │            │   │
│                  │  ┌────▼──────────────▼────────┐  │   │
│                  │  │      Service Layer          │  │   │
│                  │  └────────────┬───────────────┘  │   │
│                  │               │                   │   │
│                  │  ┌────────────▼───────────────┐  │   │
│                  │  │     Repository Layer        │  │   │
│                  │  └────────────┬───────────────┘  │   │
│                  └───────────────┼───────────────────┘   │
│                                  │                        │
│              ┌───────────────────┼──────────────┐        │
│              │                   │              │         │
│  ┌───────────▼──┐   ┌────────────▼──┐  ┌───────▼─────┐  │
│  │  PostgreSQL  │   │     Redis     │  │ External API │  │
│  │  (Ana Veri)  │   │  (Chat Mem.)  │  │ (Kargo vb.) │  │
│  └──────────────┘   └───────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Katman Kuralları (İhlal Edilemez)

Her katmanın neyi görebileceği ve neyi göremeyeceği aşağıda tanımlanmıştır. Bu kurallar, kodun zamanla karmaşıklaşmasını önler.

```
API Layer (Endpoint'ler)
  ✅ Service katmanını çağırabilir
  ✅ HTTP Request/Response ile çalışır
  ❌ Repository'e doğrudan erişemez
  ❌ DB session göremez
  ❌ LLM SDK kullanamaz

Service Layer (İş Mantığı)
  ✅ Repository katmanını çağırabilir
  ✅ Agent orchestrator'ı çağırabilir
  ✅ Başka Service çağırabilir (dikkatli ol, döngüsel bağımlılık)
  ❌ HTTP Request/Response objesi göremez
  ❌ Doğrudan DB sorgusu yazamaz

Repository Layer (Veri Erişimi)
  ✅ Sadece DB (SQLAlchemy session) ile çalışır
  ❌ Service göremez
  ❌ İş mantığı içeremez
  ❌ Sadece CRUD + özel DB sorguları

Agent Layer (AI Orchestration)
  ✅ Tool'ları çağırır
  ✅ Service'leri DI ile alır
  ✅ LLM SDK kullanır
  ❌ HTTP katmanını göremez
  ❌ Repository'e doğrudan erişemez
```

---

## 4. Tam Proje Ağacı

```
kobi-agent/
│
├── backend/                          # Tüm backend kodu bu klasörde
│   │
│   ├── app/                          # Ana uygulama paketi
│   │   │
│   │   ├── __init__.py
│   │   │
│   │   ├── main.py                   # Uygulamanın başlangıç noktası
│   │   │                             # FastAPI app factory
│   │   │                             # Middleware kayıtları (CORS, logging vb.)
│   │   │                             # Router kayıtları
│   │   │                             # Global exception handler'lar
│   │   │                             # Startup/shutdown event'leri
│   │   │
│   │   ├── core/                     # Çekirdek katman — dışa bağımlılığı sıfır
│   │   │   │                         # Uygulama içindeki her yerden import edilir
│   │   │   │                         # Ama core/ hiçbir uygulama modülünü import etmez
│   │   │   │
│   │   │   ├── __init__.py
│   │   │   ├── config.py             # Tüm ortam değişkenleri (Pydantic Settings)
│   │   │   │                         # .env dosyasından okur, @lru_cache ile singleton
│   │   │   ├── security.py           # JWT token üretimi ve doğrulaması
│   │   │   │                         # Şifre hashing (bcrypt)
│   │   │   ├── exceptions.py         # Tüm custom exception sınıfları
│   │   │   │                         # HTTP status code mapping
│   │   │   ├── responses.py          # Global standart response modelleri
│   │   │   │                         # SuccessResponse, ErrorResponse, PaginatedResponse
│   │   │   ├── logging.py            # Structured JSON logging kurulumu
│   │   │   │                         # Request ID injection, log formatı
│   │   │   └── dependencies.py       # FastAPI Depends() factory'leri
│   │   │                             # get_db_session(), get_current_user(),
│   │   │                             # get_order_service(), get_agent()
│   │   │
│   │   ├── db/                       # Veritabanı altyapısı
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # SQLAlchemy Base sınıfı, AsyncEngine
│   │   │   └── session.py            # AsyncSession factory, connection pool
│   │   │
│   │   ├── models/                   # SQLAlchemy ORM modelleri
│   │   │   │                         # Sadece tablo şeması tanımı — iş mantığı yok
│   │   │   ├── __init__.py           # Tüm modelleri export eder (Alembic için)
│   │   │   ├── base_model.py         # Ortak alanlar: id, created_at, updated_at
│   │   │   ├── user.py               # User tablosu
│   │   │   ├── product.py            # Product tablosu
│   │   │   ├── inventory.py          # Inventory tablosu (stok)
│   │   │   ├── order.py              # Order tablosu
│   │   │   ├── order_item.py         # OrderItem tablosu (sipariş kalemleri)
│   │   │   ├── shipment.py           # Shipment tablosu (kargo)
│   │   │   └── conversation.py       # Conversation tablosu (agent oturumları)
│   │   │
│   │   ├── schemas/                  # Pydantic request/response şemaları
│   │   │   │                         # API'ye giren ve çıkan JSON'ın şekli burda tanımlanır
│   │   │   │                         # ORM model'lerinden AYRI tutulur
│   │   │   ├── __init__.py
│   │   │   ├── common.py             # Ortak şemalar: PaginatedResponse[T], HealthCheck
│   │   │   ├── auth.py               # LoginRequest, TokenResponse, UserCreate/Response
│   │   │   ├── product.py            # ProductCreate, ProductUpdate, ProductResponse
│   │   │   ├── order.py              # OrderCreate, OrderResponse, OrderSummary
│   │   │   ├── inventory.py          # InventoryUpdate, LowStockAlert, StockReport
│   │   │   ├── shipment.py           # ShipmentCreate, ShipmentResponse
│   │   │   └── chat.py               # ChatMessage, ChatResponse, ConversationHistory
│   │   │
│   │   ├── repositories/             # Veri erişim katmanı
│   │   │   │                         # Veritabanı ile tek temas noktası
│   │   │   │                         # Sadece CRUD ve özel sorgular — iş mantığı yok
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Generic BaseRepository[ModelType]
│   │   │   ├── user_repository.py    # get_by_email(), get_active_users()
│   │   │   ├── product_repository.py # get_by_sku(), search(), get_active_products()
│   │   │   ├── order_repository.py   # get_with_items(), get_by_status(), get_today_orders()
│   │   │   ├── inventory_repository.py # get_by_product(), get_low_stock_items()
│   │   │   └── shipment_repository.py  # get_by_order(), get_by_tracking()
│   │   │
│   │   ├── services/                 # İş mantığı katmanı
│   │   │   │                         # Tüm iş kuralları burada uygulanır
│   │   │   │                         # Repository'leri orchestrate eder
│   │   │   │                         # HTTP veya DB katmanını doğrudan görmez
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py       # login(), create_user(), verify_token()
│   │   │   ├── product_service.py    # create_product(), search_products()
│   │   │   ├── order_service.py      # create_order(), update_status(), get_daily_summary()
│   │   │   ├── inventory_service.py  # check_stock(), deduct_stock(), get_low_stock_alerts()
│   │   │   └── shipment_service.py   # create_shipment(), refresh_cargo_status()
│   │   │
│   │   ├── agent/                    # AI Agent sistemi — projenin kalbi
│   │   │   │                         # LLM ile tüm iletişim buradan yürütülür
│   │   │   ├── __init__.py
│   │   │   ├── orchestrator.py       # Ana agent döngüsü (ReAct pattern)
│   │   │   ├── prompts.py            # System prompt tanımları (Türkçe)
│   │   │   ├── memory.py             # Redis tabanlı konuşma hafızası
│   │   │   └── tools/
│   │   │       ├── __init__.py       # ToolRegistry — tüm tool'ları yönetir
│   │   │       ├── base.py           # BaseTool abstract class
│   │   │       ├── order_tools.py    # GetOrderStatus, GetOrdersByPhone
│   │   │       ├── inventory_tools.py # CheckProductStock, GetLowStockReport
│   │   │       └── cargo_tools.py    # GetCargoStatus
│   │   │
│   │   ├── api/                      # HTTP routing katmanı
│   │   │   │                         # Sadece: al, doğrula, ilet, dön
│   │   │   │                         # İş mantığı yok, DB görmez
│   │   │   ├── __init__.py
│   │   │   ├── router.py             # Ana router — tüm route'ları bağlar
│   │   │   └── endpoints/
│   │   │       ├── __init__.py
│   │   │           ├── auth.py       # POST /auth/login, register | GET /auth/me
│   │   │           ├── chat.py       # POST /chat/message | GET,DELETE /chat/history
│   │   │           ├── products.py   # CRUD /products
│   │   │           ├── orders.py     # CRUD /orders + summary
│   │   │           ├── inventory.py  # GET,PUT /inventory + low-stock
│   │   │           └── shipments.py  # POST,GET,PUT /shipments
│   │   │
│   │   └── integrations/             # Dış servis adaptörleri (Strategy pattern)
│   │       └── cargo/
│   │           ├── base.py           # CargoProvider abstract class
│   │           ├── mock_provider.py  # Geliştirme için mock
│   │           └── yurtici.py        # Yurtiçi Kargo adaptörü
│   │
│   ├── alembic/                      # Veritabanı migration sistemi
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       └── 001_initial_tables.py
│   │
│   ├── scripts/
│   │   └── seed_data.py              # Geliştirme ve demo için örnek veri
│   │
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── alembic.ini
│
├── docker-compose.yml
├── .env.example
├── .env                              # Gerçek secret'lar — gitignore'da
├── .gitignore
└── README.md
```

---

## 5. Katman Görev Tanımları

### `core/config.py` — Tek Konfigürasyon Noktası

Tüm ortam değişkenleri buradan okunur. Başka hiçbir dosyada `os.environ` kullanılmaz.

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Uygulama
    APP_NAME: str = "KOBİ Agent"
    DEBUG: bool = False
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Veritabanı
    DATABASE_URL: str                          # postgresql+asyncpg://...
    DATABASE_POOL_SIZE: int = 10

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    REDIS_CONVERSATION_TTL: int = 86400        # 24 saat (saniye)

    # Güvenlik & Cookie Auth
    SECRET_KEY: str                            # JWT imzalama anahtarı
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440    # 24 saat
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7         # 7 gün
    
    AUTH_ACCESS_COOKIE_NAME: str = "access_token"
    AUTH_REFRESH_COOKIE_NAME: str = "refresh_token"
    AUTH_COOKIE_HTTPONLY: bool = True
    AUTH_COOKIE_SECURE: bool = True            # Production'da True olmalı
    AUTH_COOKIE_SAMESITE: str = "lax"
    AUTH_COOKIE_DOMAIN: str | None = None

    # LLM
    LLM_API_KEY: str
    LLM_MODEL: str

    # Kargo (opsiyonel)
    CARGO_API_KEY: str = ""
    USE_MOCK_CARGO: bool = True               # Geliştirmede mock kullan

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

### `models/base_model.py` — Ortak Alanlar (DRY)

Tüm tablolarda tekrarlayan alanlar bir kez tanımlanır; her model buradan miras alır.

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import datetime

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

# Kullanım örneği:
# class Order(Base, TimestampMixin):
#     __tablename__ = "orders"
#     id: Mapped[int] = mapped_column(primary_key=True)
```

### `repositories/base.py` — Generic CRUD (DRY)

Tüm repository'ler bu sınıftan miras alır. `get`, `create`, `update`, `delete` işlemleri otomatik olarak gelir; entity'ye özgü sorgular alt sınıfta eklenir.

```python
from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

ModelType = TypeVar("ModelType")

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get(self, id: int) -> Optional[ModelType]: ...
    async def get_multi(self, skip: int = 0, limit: int = 100) -> List[ModelType]: ...
    async def create(self, data: dict) -> ModelType: ...
    async def update(self, id: int, data: dict) -> Optional[ModelType]: ...
    async def delete(self, id: int) -> bool: ...
```

### `agent/tools/base.py` — Tool Sözleşmesi

Her tool bu sınıftan miras alır. LLM, hangi tool'ları kullanabileceğini buradaki tanımlardan öğrenir.

```python
from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Any, Optional

class ToolResult(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None

class BaseTool(ABC):
    name: str           # LLM bu isimle çağırır
    description: str    # LLM bu açıklamayı okuyarak ne yapacağını anlar
    input_schema: dict  # Parametreler ve tipleri

    @abstractmethod
    async def execute(self, **kwargs) -> ToolResult:
        """Tool'un asıl işi burada yapılır"""
        ...

    def to_llm_format(self) -> dict:
        """LLM API'sine gönderilecek formata dönüştürür"""
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": self.input_schema
        }
```

---

## 6. Standart API Response Sistemi

### Neden Standart Response?

Hardcode response yapıları — yani her endpoint'in kendi formatında JSON döndürmesi — ciddi sorunlara yol açar:

- Frontend geliştiricisi hangi alanda hata mesajı bulacağını bilmez.
- Bazı endpoint'ler `{"error": "..."}` dönerken diğerleri `{"message": "..."}` döner.
- Başarı ve hata durumları aynı yapıda değildir; tutarsızlık artar.

Bu projedeki her API yanıtı, aşağıda tanımlanan tek bir standart yapı üzerinden dönecektir.

---

### Response Yapısı

Her yanıt şu alanları içerir:

| Alan | Tip | Açıklama |
|------|-----|----------|
| `statusCode` | `int` | HTTP durum kodu (200, 201, 400, 404 vb.) |
| `key` | `str` | Makine tarafından okunabilir durum anahtarı (`SUCCESS`, `NOT_FOUND` vb.) |
| `message` | `str` | İnsan tarafından okunabilir açıklama |
| `data` | `any \| null` | Başarılı yanıtlarda dönen veri |
| `errors` | `list \| null` | Hata durumunda validasyon veya detay bilgisi |

---

### `core/responses.py` — Response Modelleri

```python
# core/responses.py
# Tüm API yanıtları bu modeller üzerinden döner. Doğrudan JSONResponse kullanılmaz.

from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Tüm API yanıtları için temel model."""
    statusCode: int
    key: str
    message: str
    data: Optional[T] = None
    errors: Optional[List[Any]] = None


class PaginatedData(BaseModel, Generic[T]):
    """Sayfalı liste sonuçları için veri sarmalayıcı."""
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
```

---

### `core/response_builder.py` — Response Builder

Endpoint'ler doğrudan `JSONResponse` oluşturmak yerine bu fonksiyonları kullanır.

```python
# core/response_builder.py
from typing import Any, List, Optional
from fastapi.responses import JSONResponse
from .responses import ApiResponse


def success_response(
    data: Any = None,
    message: str = "İşlem başarıyla tamamlandı.",
    key: str = "SUCCESS",
    status_code: int = 200,
) -> JSONResponse:
    """
    Başarılı yanıt döndürür.

    Kullanım:
        return success_response(data=product, message="Ürün oluşturuldu.", status_code=201)
    """
    body = ApiResponse(
        statusCode=status_code,
        key=key,
        message=message,
        data=data,
        errors=None,
    )
    return JSONResponse(status_code=status_code, content=body.model_dump())


def error_response(
    message: str,
    key: str = "ERROR",
    status_code: int = 400,
    errors: Optional[List[Any]] = None,
) -> JSONResponse:
    """
    Hata yanıtı döndürür.

    Kullanım:
        return error_response(message="Ürün bulunamadı.", key="NOT_FOUND", status_code=404)
    """
    body = ApiResponse(
        statusCode=status_code,
        key=key,
        message=message,
        data=None,
        errors=errors,
    )
    return JSONResponse(status_code=status_code, content=body.model_dump())
```

---

### Response Örnekleri

**Başarılı Yanıt (200 OK):**

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Sipariş başarıyla getirildi.",
  "data": {
    "id": 128,
    "status": "shipped",
    "customer_name": "Ahmet Yılmaz"
  },
  "errors": null
}
```

**Kaynak Bulunamadı (404):**

```json
{
  "statusCode": 404,
  "key": "NOT_FOUND",
  "message": "128 numaralı sipariş bulunamadı.",
  "data": null,
  "errors": null
}
```

**Validasyon Hatası (422):**

```json
{
  "statusCode": 422,
  "key": "VALIDATION_ERROR",
  "message": "İstek verisi geçersiz.",
  "data": null,
  "errors": [
    {"field": "customer_name", "message": "Bu alan zorunludur."},
    {"field": "quantity", "message": "0'dan büyük olmalıdır."}
  ]
}
```

**Sunucu Hatası (500):**

```json
{
  "statusCode": 500,
  "key": "INTERNAL_ERROR",
  "message": "Beklenmeyen bir hata oluştu.",
  "data": null,
  "errors": null
}
```

---

### Endpoint'lerde Kullanım

```python
# api/endpoints/orders.py

from app.core.response_builder import success_response, error_response

@router.get("/{order_id}")
async def get_order(
    order_id: int,
    order_service: OrderService = Depends(get_order_service),
):
    order = await order_service.get_order_details(order_id)
    return success_response(
        data=order,
        message="Sipariş başarıyla getirildi.",
    )
```

> **Kural:** Endpoint'ler asla `{"key": "value"}` gibi ham dict döndürmez.
> Her yanıt `success_response()` veya `error_response()` üzerinden geçer.

---

## 7. Exception Handling ve Hata Yönetimi

### Felsefe

Hatalar servis katmanında fırlatılır, API katmanında yakalanmaz. Global handler'lar tüm exception'ları merkezi olarak yakalar ve standart response formatına dönüştürür. Bu sayede her endpoint'te `try/except` yazmak gerekmez.

---

### `core/exceptions.py` — Custom Exception Hiyerarşisi

```python
# core/exceptions.py
# Tüm uygulama exception'ları buradan türetilir.
# HTTP durum kodları burada tanımlanır; servis katmanı HTTP bilmez ama bu sınıfları kullanır.

class AppException(Exception):
    """Tüm uygulama exception'larının base class'ı."""
    status_code: int = 500
    key: str = "INTERNAL_ERROR"
    message: str = "Beklenmeyen bir hata oluştu."

    def __init__(self, message: str = None, errors: list = None):
        self.message = message or self.__class__.message
        self.errors = errors
        super().__init__(self.message)


class NotFoundError(AppException):
    status_code = 404
    key = "NOT_FOUND"
    message = "Kayıt bulunamadı."


class ValidationError(AppException):
    status_code = 422
    key = "VALIDATION_ERROR"
    message = "İstek verisi geçersiz."


class UnauthorizedError(AppException):
    status_code = 401
    key = "UNAUTHORIZED"
    message = "Kimlik doğrulama başarısız."


class ForbiddenError(AppException):
    status_code = 403
    key = "FORBIDDEN"
    message = "Bu işlem için yetkiniz yok."


class ConflictError(AppException):
    status_code = 409
    key = "CONFLICT"
    message = "Kayıt zaten mevcut."


class InsufficientStockError(AppException):
    status_code = 409
    key = "INSUFFICIENT_STOCK"
    message = "Yeterli stok bulunmamaktadır."


class ExternalServiceError(AppException):
    status_code = 502
    key = "EXTERNAL_SERVICE_ERROR"
    message = "Harici servis yanıt vermedi."
```

---

### Global Exception Handler — `main.py`

Bu handler'lar, `main.py` içinde uygulamaya kayıt edilir. Tüm exception'lar merkezi olarak burada yakalanır ve standart response formatına dönüştürülür.

```python
# main.py (ilgili bölüm)

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.exceptions import AppException
from app.core.responses import ApiResponse

app = FastAPI()


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """
    Uygulama kaynaklı tüm exception'ları yakalar.
    NotFoundError, InsufficientStockError vb. buraya düşer.
    """
    request_id = getattr(request.state, "request_id", None)
    body = ApiResponse(
        statusCode=exc.status_code,
        key=exc.key,
        message=exc.message,
        data=None,
        errors=exc.errors,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=body.model_dump(),
        headers={"X-Request-ID": str(request_id)} if request_id else {},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Pydantic validasyon hatalarını yakalar.
    Hangi alanın neden geçersiz olduğunu döndürür.
    """
    field_errors = [
        {
            "field": " → ".join(str(loc) for loc in err["loc"]),
            "message": err["msg"],
        }
        for err in exc.errors()
    ]
    body = ApiResponse(
        statusCode=422,
        key="VALIDATION_ERROR",
        message="İstek verisi geçersiz. Lütfen alanları kontrol edin.",
        data=None,
        errors=field_errors,
    )
    return JSONResponse(status_code=422, content=body.model_dump())


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Beklenmeyen tüm hataları yakalar.
    Stack trace loglanır ama client'a döndürülmez.
    """
    import logging
    logging.getLogger("app").error(
        "Unhandled exception",
        exc_info=exc,
        extra={"request_id": getattr(request.state, "request_id", None)},
    )
    body = ApiResponse(
        statusCode=500,
        key="INTERNAL_ERROR",
        message="Beklenmeyen bir hata oluştu.",
        data=None,
        errors=None,
    )
    return JSONResponse(status_code=500, content=body.model_dump())
```

---

### Servis Katmanında Kullanım

```python
# services/order_service.py

from app.core.exceptions import NotFoundError, InsufficientStockError

async def get_order_details(self, order_id: int):
    order = await self.order_repo.get(order_id)
    if not order:
        raise NotFoundError(message=f"{order_id} numaralı sipariş bulunamadı.")
    return order

async def create_order(self, data: OrderCreate):
    for item in data.items:
        has_stock = await self.inventory_service.check_stock(item.product_id, item.quantity)
        if not has_stock:
            raise InsufficientStockError(
                message=f"Ürün #{item.product_id} için yeterli stok yok."
            )
    # ... sipariş oluşturma devam eder
```

> **Kural:** Servis katmanı `HTTPException` fırlatmaz. Sadece `AppException` türevlerini fırlatır. HTTP bilgisi (status code) sadece exception sınıfında tanımlıdır.

---

## 8. Validation Sistemi

### Neden Katmanlı Validation?

Validasyon yalnızca "alan boş mu?" kontrolünden ibaret değildir. Farklı validasyon türleri farklı katmanlarda yapılır:

| Katman | Ne Kontrol Eder | Teknoloji |
|--------|-----------------|-----------|
| **API Layer** | Tip uyumu, zorunlu alanlar, format (e-posta, telefon) | Pydantic v2 |
| **Service Layer** | İş kuralları (yeterli stok var mı?, sipariş iptal edilebilir mi?) | Python kodu |
| **Repository Layer** | DB kısıtlamaları (unique, not null) | PostgreSQL |

---

### Pydantic Schema Örneği

```python
# schemas/order.py

from pydantic import BaseModel, Field, field_validator
from typing import List
import re

class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0, description="Geçerli bir ürün ID'si olmalıdır.")
    quantity: int = Field(..., gt=0, le=1000, description="1 ile 1000 arasında olmalıdır.")

class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_phone: str = Field(..., pattern=r"^\+?[0-9]{10,15}$")
    customer_email: str | None = Field(default=None)
    items: List[OrderItemCreate] = Field(..., min_length=1)
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("customer_phone")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        """Telefon numarasını standart formata getirir."""
        return re.sub(r"\s+", "", v)

    @field_validator("notes")
    @classmethod
    def sanitize_notes(cls, v: str | None) -> str | None:
        """HTML taglerini temizler (XSS önlemi)."""
        if v is None:
            return v
        import bleach
        return bleach.clean(v, tags=[], strip=True)
```

---

### Pydantic Hata Mesajlarını Özelleştirme

Varsayılan Pydantic hata mesajları İngilizce ve teknik bir dille gelir. `validation_exception_handler` (bkz. Bölüm 7) bu mesajları yakalayarak standart `errors[]` formatına dönüştürür.

**Ham Pydantic hatası:**
```json
[{"loc": ["body", "quantity"], "msg": "Input should be greater than 0", "type": "greater_than"}]
```

**Standart response sonrası:**
```json
{
  "statusCode": 422,
  "key": "VALIDATION_ERROR",
  "message": "İstek verisi geçersiz.",
  "errors": [{"field": "body → quantity", "message": "Input should be greater than 0"}]
}
```

---

## 9. Güvenlik Mimarisi

### HttpOnly Cookie tabanlı JWT Akışı

```
1. Kullanıcı POST /api/auth/login gönderir → email + password
2. auth_service: email ile kullanıcıyı bul, bcrypt ile hash karşılaştır
3. Doğruysa backend access_token ve refresh_token üretir.
4. Tokenlar response body içinde dönmez.
5. Tokenlar Set-Cookie header ile HttpOnly cookie olarak yazılır.

6. Protected endpointlerde:
   - Browser HttpOnly cookie'yi her istekte otomatik gönderir.
   - dependencies.get_current_user() request.cookies üzerinden access_token'ı okur.
   - Token decode edilir (payload: user_id, role, exp).
   - Token yoksa/geçersizse/expired ise → UnauthorizedError (401).
   - Kullanıcı aktif değilse → ForbiddenError (403).
   - Kullanıcı nesnesini endpoint'e inject et.

7. Refresh akışı:
   - access_token expired olduğunda frontend /api/auth/refresh çağırır.
   - Backend refresh_token cookie'sini okur, doğrular ve yeni cookie'leri set eder.
   - Refresh token rotation ve revoke yaklaşımı esas alınır.

8. Logout akışı:
   - /api/auth/logout çağrıldığında backend auth cookie'lerini temizler.
```

### Role Kontrolü

```python
# core/dependencies.py

async def get_current_user(
    request: Request,
    settings: Settings = Depends(get_settings)
) -> User:
    """Access token cookie'sini okur ve kullanıcıyı doğrular."""
    access_token = request.cookies.get(settings.AUTH_ACCESS_COOKIE_NAME)
    
    if not access_token:
        raise UnauthorizedError(message="Oturum bulunamadı.")
    
    # JWT decode ve user validation adımları...
    # sub (user_id) yoksa -> UnauthorizedError
    # User DB'de yoksa -> UnauthorizedError
    # User is_active değilse -> ForbiddenError
    return user

async def get_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Tüm admin endpoint'leri bu dependency'yi kullanır."""
    if current_user.role != "admin":
        raise ForbiddenError(message="Bu işlem için admin yetkisi gereklidir.")
    return current_user
```

### Şifre Güvenliği

- Şifreler `bcrypt` ile hash'lenir. Düz metin olarak asla saklanmaz veya loglanmaz.
- JWT `SECRET_KEY` her zaman `.env`'den gelir; kod içinde sabit string olarak yazılmaz.
- `.env` dosyası `.gitignore`'dadır ve repository'ye asla commit edilmez.

---

### SQL Injection Koruması

**Yöntem:** SQLAlchemy ORM ile parameterized query kullanımı.

SQLAlchemy, tüm sorguları otomatik olarak parameterized hale getirir. Kullanıcıdan gelen değer asla string concatenation ile sorguya eklenmez.

```python
# ✅ DOĞRU — SQLAlchemy parametrize eder, injection imkansız
result = await session.execute(
    select(Order).where(Order.customer_phone == phone)
)

# ❌ YANLIŞ — Asla bu şekilde kullanılmaz
query = f"SELECT * FROM orders WHERE customer_phone = '{phone}'"
await session.execute(text(query))
```

**Ek önlem:** Ham SQL kullanılması zorunlu olan nadir durumlarda `sqlalchemy.text()` ile `bindparams` kullanılır:

```python
# Zorunlu ham SQL durumunda — yine de güvenli
stmt = text("SELECT * FROM orders WHERE status = :status")
result = await session.execute(stmt, {"status": status_value})
```

> **Kural:** `f-string` veya string concatenation ile SQL sorgusu oluşturmak yasaktır.

---

### XSS Koruması

XSS (Cross-Site Scripting) saldırıları, kullanıcıdan gelen verinin HTML/JS olarak tarayıcıya yansıtılmasıyla gerçekleşir. Bu projede birden fazla katmanda önlem alınır:

**1. Pydantic Validator ile Input Temizleme:**

```python
# schemas/common.py

import bleach

def sanitize_html(value: str | None) -> str | None:
    """Serbest metin alanlarından HTML tag'lerini temizler."""
    if value is None:
        return value
    return bleach.clean(value, tags=[], strip=True)
```

Notlar, açıklamalar, mesajlar gibi serbest metin alanları bu validator'dan geçirilir.

**2. Response Security Header'ları:**

`main.py`'de global bir middleware ile tüm yanıtlara güvenlik header'ları eklenir:

```python
# main.py

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response

app.add_middleware(SecurityHeadersMiddleware)
```

**3. CORS Kısıtlaması:**

Sadece bilinen origin'lere izin verilir. `*` (tüm origin'ler) production'da kullanılmaz.

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,   # ["http://localhost:3000"]
    allow_credentials=True,                # Cookie iletimi için zorunlu
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],        # Authorization header artık kullanılmıyor
)
```

---

## 10. Logging ve İzlenebilirlik

### Neden Structured Logging?

Düz metin loglar (`print("hata oluştu")`) üretimde işe yaramaz. Structured logging şu soruları anında yanıtlar:

- Bu hata hangi request'ten geldi?
- Hangi kullanıcı bu işlemi yaptı?
- Bu işlem ne kadar sürdü?

Her log satırı JSON formatında olur ve Elasticsearch, Datadog gibi araçlarla kolayca sorgulanabilir.

---

### `core/logging.py` — Logging Kurulumu

```python
# core/logging.py

import logging
import json
from datetime import datetime, timezone


class JsonFormatter(logging.Formatter):
    """Her log satırını JSON formatında üretir."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        # Ekstra alanlar (request_id, user_id vb.)
        for key in ("request_id", "user_id", "method", "path", "duration_ms"):
            if hasattr(record, key):
                log_data[key] = getattr(record, key)

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data, ensure_ascii=False)


def setup_logging(debug: bool = False) -> None:
    """Uygulama başlarken bir kez çağrılır."""
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if debug else logging.INFO)
    root_logger.handlers = [handler]

    # Üçüncü parti kütüphanelerin log seviyesini kıs
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
```

---

### Request ID ve Traceability (İzlenebilirlik)

Her HTTP isteğine benzersiz bir `request_id` atanır. Bu ID:

- Response header'ında döner (`X-Request-ID`)
- O request ile ilgili tüm log satırlarına eklenir
- Hata durumunda tam takip zinciri kurulmasını sağlar

```python
# middlewares/request_id.py

import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

logger = logging.getLogger("app.request")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Her isteğe benzersiz bir ID atar.
    - request.state.request_id olarak sonraki katmanlara geçer.
    - X-Request-ID header'ı olarak response'a eklenir.
    - İstek süresi (duration_ms) loglanır.
    """

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        import time
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        response.headers["X-Request-ID"] = request_id

        logger.info(
            f"{request.method} {request.url.path} → {response.status_code}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": str(request.url.path),
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )
        return response
```

**main.py'e kayıt:**

```python
# main.py
from app.middlewares.request_id import RequestIDMiddleware

app.add_middleware(RequestIDMiddleware)
```

---

### Log Çıktısı Örneği

Her request için üretilen JSON log satırı şu şekilde görünür:

```json
{
  "timestamp": "2024-01-15T08:32:14.123Z",
  "level": "INFO",
  "logger": "app.request",
  "message": "POST /api/chat/message → 200",
  "request_id": "f7a3c2e1-4b8d-4f2a-9c1e-3a7b5d8e2f0c",
  "method": "POST",
  "path": "/api/chat/message",
  "status_code": 200,
  "duration_ms": 342.7
}
```

Hata durumunda aynı `request_id` ile birden fazla log satırı aranarak tam zincir görülür.

---

### Middleware Kayıt Sırası (`main.py`)

Middleware'ler LIFO (Last In, First Out) sırasıyla çalışır. Kayıt sırası önemlidir:

```python
# main.py — middleware kayıt sırası

app.add_middleware(SecurityHeadersMiddleware)   # 3. çalışır (son)
app.add_middleware(CORSMiddleware, ...)          # 2. çalışır
app.add_middleware(RequestIDMiddleware)          # 1. çalışır (ilk — ID en erken atanır)
```

---

## 11. Veritabanı Şeması

```
users
├── id              INTEGER PK
├── email           VARCHAR(255) UNIQUE NOT NULL
├── hashed_password VARCHAR(255) NOT NULL
├── role            VARCHAR(20) DEFAULT 'admin'    -- admin | customer
├── is_active       BOOLEAN DEFAULT true
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP

products
├── id          INTEGER PK
├── name        VARCHAR(255) NOT NULL
├── sku         VARCHAR(100) UNIQUE NOT NULL       -- stok takip kodu
├── description TEXT
├── price       NUMERIC(10,2) NOT NULL
├── category    VARCHAR(100)
├── is_active   BOOLEAN DEFAULT true
├── created_at  TIMESTAMP
└── updated_at  TIMESTAMP

inventory                                          -- stok bilgisi (products ile 1:1)
├── id                  INTEGER PK
├── product_id          INTEGER FK → products.id UNIQUE
├── quantity            INTEGER NOT NULL DEFAULT 0
├── low_stock_threshold INTEGER NOT NULL DEFAULT 10
├── last_updated        TIMESTAMP
└── updated_at          TIMESTAMP

orders
├── id              INTEGER PK
├── customer_name   VARCHAR(255) NOT NULL
├── customer_phone  VARCHAR(20)
├── customer_email  VARCHAR(255)
├── status          VARCHAR(30)  -- pending | processing | shipped | delivered | cancelled
├── total_amount    NUMERIC(10,2)
├── notes           TEXT
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP

order_items                                        -- bir siparişin kalemleri
├── id          INTEGER PK
├── order_id    INTEGER FK → orders.id
├── product_id  INTEGER FK → products.id
├── quantity    INTEGER NOT NULL
├── unit_price  NUMERIC(10,2) NOT NULL             -- sipariş anındaki fiyat (anlık snapshot)
└── created_at  TIMESTAMP

shipments                                          -- kargo takip bilgileri
├── id                  INTEGER PK
├── order_id            INTEGER FK → orders.id UNIQUE
├── carrier             VARCHAR(50)               -- yurtici | aras | mng
├── tracking_number     VARCHAR(100)
├── status              VARCHAR(50)               -- in_transit | delivered | delayed
├── estimated_delivery  DATE
├── last_checked_at     TIMESTAMP
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP

conversations                                      -- agent oturumu metadata'sı
├── id              INTEGER PK
├── session_id      VARCHAR(100) UNIQUE NOT NULL  -- Redis'teki key ile eşleşir
├── user_identifier VARCHAR(255)                  -- telefon veya e-posta
├── channel         VARCHAR(30)                   -- web | whatsapp
├── created_at      TIMESTAMP
└── last_message_at TIMESTAMP
```

> **Not:** Konuşma mesajlarının içeriği Redis'te tutulur (hız ve TTL için). PostgreSQL'de sadece oturum metadata'sı saklanır.

---

## 12. Agent ve Tool Sistemi

### Nasıl Çalışır — ReAct Döngüsü

```
Kullanıcı: "128 numaralı siparişim nerede?"
     │
     ▼
[Orchestrator]
     │  1. Redis'ten konuşma geçmişini al
     │  2. LLM'e gönder:
     │     - System prompt (Türkçe KOBİ asistanı)
     │     - Konuşma geçmişi (son 10 mesaj)
     │     - Kullanılabilir tool listesi
     ▼
[LLM karar verir]
     │  → "get_order_status tool'unu çağır, order_id=128"
     ▼
[Orchestrator tool'u çalıştırır]
     │  → OrderTool.execute(order_id=128)
     │  → OrderService.get_order_details(128)
     │  → OrderRepository → PostgreSQL
     │  Sonuç: {status: "shipped", tracking: "YK123456"}
     ▼
[LLM'e sonucu ver]
     │  → "Kargo durumunu da sorgula"
     │  → CargoTool.execute(tracking_number="YK123456")
     │  → ShipmentService → CargoProvider → Harici API
     │  Sonuç: {location: "Ankara", estimated: "12 Mayıs"}
     ▼
[LLM final yanıt üretir]
     │  "Siparişiniz kargoda, şu an Ankara'da.
     │   Tahmini teslimat tarihi 12 Mayıs."
     ▼
[Orchestrator Redis'e kaydeder + HTTP Response döner]
```

### Tool Listesi (MVP)

| Tool Adı | Açıklama | Parametreler | Çağırdığı Servis |
|----------|----------|--------------|-----------------|
| `get_order_status` | Sipariş durumunu sorgular | `order_id: int` | OrderService |
| `get_orders_by_phone` | Telefona göre siparişleri listeler | `phone: str` | OrderService |
| `check_product_stock` | Ürün stok durumunu döndürür | `product_name: str` | InventoryService |
| `get_low_stock_report` | Kritik stok altındaki ürünleri listeler | — | InventoryService |
| `get_cargo_status` | Kargo konumunu ve durumunu sorgular | `tracking_number: str` | ShipmentService |
| `get_daily_summary` | Günün sipariş özetini döndürür | — | OrderService |

### System Prompt

```python
SYSTEM_PROMPT = """
Sen KOBİ işletmelerine yardımcı olan bir AI asistanısın.
Görevin: müşterilerin sipariş, stok ve kargo sorularını
doğru araçları kullanarak yanıtlamak.

KURALLAR:
- Her zaman Türkçe yanıt ver.
- Sipariş, stok veya kargo sorusu geldiğinde MUTLAKA ilgili tool'u kullan.
- Bilmediğin veya sistemde olmayan bir şeyi uydurma; "bulamadım" de.
- Kısa ve net yanıtlar ver.
- Hata durumunda kullanıcıyı müşteri hizmetlerine yönlendir.

Mevcut araçların: sipariş sorgulama, stok kontrolü, kargo takibi, günlük özet.
"""
```

---

## 13. Data Flow — Senaryo Bazlı

### Senaryo 1: Müşteri Sipariş Soruyor

```
POST /api/chat/message
Body: {"content": "128 nolu siparişim nerede?", "session_id": "abc123"}

1. [Middleware]
   - RequestIDMiddleware: benzersiz request_id ata
   - JWT token doğrula

2. [chat.py endpoint]
   - ChatMessage schema ile validate et
   - AgentOrchestrator'ı Depends() ile al
   - orchestrator.run(message, session_id) çağır

3. [orchestrator.py]
   - memory.load("abc123") → Redis'ten son 10 mesaj
   - LLM API çağrısı: system_prompt + history + tools
   - LLM: tool_call → get_order_status(order_id=128)

4. [order_tools.py → order_service.py → order_repository.py]
   - SELECT * FROM orders WHERE id=128 (JOIN ile items)
   - Sonuç: status="shipped", tracking_number="YK123456"

5. [orchestrator.py]
   - Tool sonucu LLM'e ver
   - LLM final Türkçe yanıtı üretir

6. [memory.py]
   - Yeni mesajları Redis'e kaydet (TTL: 24 saat)

7. Yanıt:
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Agent yanıtı alındı.",
  "data": {
    "reply": "Siparişiniz kargoda, şu an Ankara'da. Tahmini teslimat: 12 Mayıs.",
    "session_id": "abc123"
  }
}
```

### Senaryo 2: Stok Kritik Eşiğin Altına Düşüyor

```
PUT /api/inventory/{product_id}
Body: {"quantity": 8}  ← eşik 10, bu değer kritik

1. [inventory.py endpoint]
   - Admin token doğrula
   - InventoryUpdate schema validate et

2. [inventory_service.py]
   - inventory_repo.update_quantity(product_id, 8)
   - get_low_stock_alerts() → eşik kontrolü
   - Eşik altındaysa LowStockAlert oluştur

3. Yanıt:
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Stok güncellendi.",
  "data": {
    "quantity": 8,
    "alert": {"product": "Domates", "threshold": 10, "severity": "critical"}
  }
}
```

### Senaryo 3: Yönetici Sabah Özeti Alıyor

```
GET /api/orders/summary/today
Credentials: include

1. [orders.py endpoint] → Admin token doğrula
2. [order_service.py] → get_daily_summary()
3. [order_repository.py] → get_today_orders() + get_pending_orders()
4. Service aggregate eder: total, pending, shipped, revenue

Yanıt:
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Günlük özet alındı.",
  "data": {
    "date": "2024-01-15",
    "total_orders": 12,
    "pending": 3,
    "shipped": 7,
    "delivered": 2,
    "total_revenue": 4850.00,
    "low_stock_alerts": 2
  }
}
```

---

## 14. Docker Kurulumu

### `docker-compose.yml`

```yaml
version: "3.9"

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: kobi_api
    volumes:
      - ./backend/app:/app/app        # Kod değişikliği anında yansır (hot reload)
      - ./backend/alembic:/app/alembic
    ports:
      - "8000:8000"
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql+asyncpg://kobi_user:kobi_pass@db:5432/kobi_db
      REDIS_URL: redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy     # DB tamamen hazır olmadan başlama
      redis:
        condition: service_started
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    networks:
      - kobi_network

  db:
    image: postgres:16-alpine
    container_name: kobi_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: kobi_db
      POSTGRES_USER: kobi_user
      POSTGRES_PASSWORD: kobi_pass
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kobi_user -d kobi_db"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - kobi_network

  redis:
    image: redis:7-alpine
    container_name: kobi_redis
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - kobi_network

volumes:
  postgres_data:
  redis_data:

networks:
  kobi_network:
    driver: bridge
```

### `Dockerfile`

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Bağımlılıkları önce kopyala — Docker cache'den yararlanır
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `.env` Dosyası

```bash
# Güvenlik
SECRET_KEY=en-az-32-karakter-uzun-rastgele-bir-string

# LLM
LLM_API_KEY=sk-ant-xxxxx
LLM_MODEL=claude-sonnet-4-20250514

# Kargo (geliştirmede mock kullan)
USE_MOCK_CARGO=true
CARGO_API_KEY=

# Uygulama
DEBUG=true
```

### Başlatma Komutları

```bash
# İlk çalıştırma (image build eder):
docker-compose up --build

# Sonraki çalıştırmalarda:
docker-compose up

# Veritabanı migration'larını uygula:
docker-compose exec api alembic upgrade head

# Örnek veri yükle:
docker-compose exec api python scripts/seed_data.py

# API loglarını izle:
docker-compose logs -f api

# Sadece altyapıyı başlat (API'yi local çalıştırmak için):
docker-compose up db redis
```

---

## 15. Geliştirme Yol Haritası — Gün Gün

### GÜN 1 — Temel Altyapı + CRUD API

**Sabah (4 saat): Altyapı Kurulumu**

```
Adım 1: Klasör yapısını oluştur
  mkdir -p backend/app/{core,db,models,schemas,repositories,services,agent/tools,api/endpoints,integrations/cargo}
  touch (tüm __init__.py dosyaları)

Adım 2: pyproject.toml yaz, Poetry başlat
  Bağımlılıklar:
  - fastapi[all], sqlalchemy[asyncio], asyncpg, alembic
  - pydantic-settings, python-jose[cryptography], passlib[bcrypt]
  - redis[asyncio], httpx, bleach, (LLM SDK)

Adım 3: docker-compose.yml yaz
  docker-compose up --build
  PostgreSQL ve Redis ayakta mı? ✓

Adım 4: core/config.py yaz (Settings sınıfı)

Adım 5: core/exceptions.py yaz (tüm custom exception'lar)

Adım 6: core/responses.py ve core/response_builder.py yaz
  success_response() ve error_response() fonksiyonları

Adım 7: core/logging.py yaz (JsonFormatter + setup_logging)

Adım 8: db/base.py ve db/session.py yaz

Adım 9: app/main.py yaz
  - CORS middleware
  - RequestIDMiddleware
  - SecurityHeadersMiddleware
  - Global exception handler'lar (AppException, RequestValidationError, Exception)
  - Router kayıtları
  - GET /health endpoint'i

TEST: curl http://localhost:8000/health
→ {"statusCode": 200, "key": "SUCCESS", "message": "Sistem çalışıyor.", "data": {"status": "ok"}}
```

**Öğleden Sonra (4 saat): Modeller ve Migration**

```
Adım 10: Tüm SQLAlchemy modellerini yaz
  models/base_model.py → TimestampMixin
  models/user.py, product.py, inventory.py
  models/order.py, order_item.py, shipment.py, conversation.py

Adım 11: Alembic başlat ve ilk migration oluştur
  alembic init alembic
  alembic revision --autogenerate -m "initial_tables"
  alembic upgrade head

Adım 12: Tüm Pydantic schema'larını yaz
  schemas/common.py, auth.py, product.py
  schemas/order.py, inventory.py, shipment.py, chat.py

Adım 13: BaseRepository yaz, tüm repository'leri yaz

Adım 14: core/dependencies.py yaz
  get_db_session(), get_current_user(), get_admin_user()
  get_order_service(), get_product_service() vb.
```

**Akşam (2 saat): Auth + Seed Data**

```
Adım 15: core/security.py yaz (JWT + bcrypt)

Adım 16: auth_service.py ve auth endpoint'lerini yaz
  POST /auth/register, /auth/login, GET /auth/me

Adım 17: scripts/seed_data.py yaz
  Admin kullanıcı, 20 ürün, 10 sipariş, stok kayıtları

TEST: Login → token al → /auth/me çağır → kullanıcı dön
```

---

### GÜN 2 — İş Mantığı + Agent

**Sabah (4 saat): CRUD Service'ler ve Endpoint'ler**

```
Adım 18: product_service.py + products endpoint'leri
  GET /products, GET /products/{id}
  POST /products, PUT /products/{id}, DELETE /products/{id}

Adım 19: inventory_service.py + inventory endpoint'leri
  GET /inventory, GET /inventory/low-stock
  PUT /inventory/{product_id}, GET /inventory/report

Adım 20: order_service.py + orders endpoint'leri
  GET /orders, GET /orders/{id}
  POST /orders (stok kontrolü dahil)
  PUT /orders/{id}/status, GET /orders/summary/today

Adım 21: shipment_service.py + shipments endpoint'leri
  POST /shipments, GET /shipments/{id}
  PUT /shipments/{id}/refresh, GET /shipments/delayed

TEST: Tüm CRUD endpoint'leri Swagger üzerinden çalışıyor mu?
```

**Öğleden Sonra (4 saat): Agent Sistemi**

```
Adım 22: BaseTool ve ToolRegistry yaz (agent/tools/base.py + __init__.py)

Adım 23: order_tools.py yaz
  GetOrderStatus: order_id → sipariş detayı
  GetOrdersByPhone: phone → son 5 sipariş

Adım 24: inventory_tools.py yaz
  CheckProductStock: product_name → stok durumu
  GetLowStockReport: kritik stok listesi

Adım 25: cargo_tools.py yaz
  GetCargoStatus: tracking_number → kargo konumu

Adım 26: mock CargoProvider yaz (integrations/cargo/mock_provider.py)
  Rastgele gerçekçi kargo durumu döner

Adım 27: agent/memory.py yaz
  Redis tabanlı konuşma geçmişi (JSON serialization, son 10 mesaj)

Adım 28: agent/prompts.py yaz (Türkçe system prompt)

Adım 29: agent/orchestrator.py yaz
  ReAct döngüsü: LLM → tool_call → execute → LLM → final yanıt
  Max 5 iteration guard (sonsuz döngü önlemi)

Adım 30: chat endpoint'lerini yaz
  POST /chat/message → orchestrator.run()
  GET /chat/history/{session_id}
  DELETE /chat/history/{session_id}

TEST: "128 nolu siparişim nerede?" → agent doğru tool'u çağırıp yanıt veriyor mu?
```

**Akşam (2 saat): Entegrasyon Testleri**

```
Adım 31: Uçtan uca 3 senaryoyu test et:
  Senaryo 1: Müşteri sipariş soruyor
  Senaryo 2: Stok kritik eşiğin altına düşüyor
  Senaryo 3: Yönetici sabah özetini alıyor

Adım 32: Response formatlarını doğrula
  Her endpoint success_response() veya error_response() döndürüyor mu?
  Validation hataları standart errors[] formatında mı geliyor?
```

---

### GÜN 3 — Güvenlik, Logging ve Demo Hazırlığı

**Sabah (4 saat): Güvenlik ve Logging**

```
Adım 33: RequestIDMiddleware ekle ve test et
  Her response'da X-Request-ID header var mı?
  Log satırlarında request_id görünüyor mu?

Adım 34: SecurityHeadersMiddleware ekle ve test et
  X-Content-Type-Options, X-Frame-Options vb. header'lar var mı?

Adım 35: XSS korumasını test et
  Serbest metin alanlarına <script>alert(1)</script> gönder
  Temizlenerek mi kaydediliyor?

Adım 36: SQL injection korumasını doğrula
  Tüm DB sorgularında f-string yok, ORM kullanılıyor

Adım 37: Rate limiting değerlendirmesi
  Chat endpoint'i için basit Python-level counter

Adım 38: Tüm admin endpoint'lerinde get_admin_user() var mı kontrol et
  Public: /health, /auth/login, /auth/register
  Admin: diğer tüm endpoint'ler

Adım 39: Swagger dokümanını güncelle
  Her endpoint'e örnek response ekle
```

**Akşam (4 saat): Demo Hazırlığı**

```
Adım 40: seed_data.py zenginleştir
  Gerçekçi ürün ve sipariş verileri
  Birkaç geciken kargo kaydı
  Birkaç kritik stok altı ürün

Adım 41: README.md yaz
  Projeyi nasıl başlatırsın
  Sistem mimarisi
  API özeti
  Demo senaryoları

Adım 42: Demo senaryolarını hazırla:
  Senaryo 1: Müşteri sipariş sorgular → agent yanıtlar
  Senaryo 2: Yönetici sabah özetini görür
  Senaryo 3: Domates stoğu kritik → alert görünür

Adım 43: Son kontrol: docker-compose down && up
  Temiz başlatmada her şey çalışıyor mu?
```

---

## 16. API Endpoint Sözlüğü

### Auth

| Method | URL | Auth | Açıklama |
|--------|-----|------|----------|
| POST | `/api/auth/register` | Public | Yeni kullanıcı kaydı, opsiyonel cookie login |
| POST | `/api/auth/login` | Public | Kullanıcı girişi, access/refresh cookie set eder |
| POST | `/api/auth/refresh` | Cookie | refresh_token cookie ile yeni token cookie’leri üretir |
| POST | `/api/auth/logout` | Cookie | Auth cookie’lerini temizler/revoke eder |
| GET | `/api/auth/me` | Cookie | access_token cookie ile mevcut kullanıcıyı getirir |

### Chat (Agent)

| Method | URL | Auth | Açıklama |
|--------|-----|------|----------|
| POST | `/api/chat/message` | Cookie Auth | Agent'a mesaj gönder |
| GET | `/api/chat/history/{session_id}` | Cookie Auth | Konuşma geçmişini getir |
| DELETE | `/api/chat/history/{session_id}` | Cookie Auth | Konuşmayı temizle |

### Ürünler

| Method | URL | Auth | Açıklama |
|--------|-----|------|----------|
| GET | `/api/products` | Cookie Auth | Ürün listesi (sayfalı) |
| GET | `/api/products/{id}` | Cookie Auth | Tek ürün detayı |
| POST | `/api/products` | Cookie Auth | Yeni ürün ekle |
| PUT | `/api/products/{id}` | Cookie Auth | Ürün güncelle |
| DELETE | `/api/products/{id}` | Cookie Auth | Ürünü pasife al |

### Siparişler

| Method | URL | Auth | Açıklama |
|--------|-----|------|----------|
| GET | `/api/orders` | Cookie Auth | Sipariş listesi (sayfalı, filtrelenebilir) |
| GET | `/api/orders/{id}` | Cookie Auth | Sipariş detayı (kalemler dahil) |
| POST | `/api/orders` | Cookie Auth | Yeni sipariş oluştur |
| PUT | `/api/orders/{id}/status` | Cookie Auth | Sipariş durumunu güncelle |
| GET | `/api/orders/summary/today` | Cookie Auth | Günlük özet (dashboard) |

### Stok

| Method | URL | Auth | Açıklama |
|--------|-----|------|----------|
| GET | `/api/inventory` | Cookie Auth | Tüm stok durumu |
| GET | `/api/inventory/low-stock` | Cookie Auth | Kritik stok uyarıları |
| PUT | `/api/inventory/{product_id}` | Cookie Auth | Stok miktarını güncelle |
| GET | `/api/inventory/report` | Cookie Auth | Detaylı stok raporu |

### Kargo

| Method | URL | Auth | Açıklama |
|--------|-----|------|----------|
| POST | `/api/shipments` | Cookie Auth | Kargo kaydı oluştur |
| GET | `/api/shipments/{id}` | Cookie Auth | Kargo detayını getir |
| PUT | `/api/shipments/{id}/refresh` | Cookie Auth | Kargo durumunu harici API'den yenile |
| GET | `/api/shipments/delayed` | Cookie Auth | Geciken kargo listesi |

### Sistem

| Method | URL | Auth | Açıklama |
|--------|-----|------|----------|
| GET | `/health` | Public | Sistem sağlık kontrolü |

---

## 17. Geliştirme Kuralları

> Bu bölüm hem geliştiriciler hem de AI geliştirme ajanı için bağlayıcı kurallardır.

### Katman Kuralları

1. **API endpoint'leri** yalnızca `Depends()` ile aldığı service'leri çağırır. Repository import etmez.
2. **Service'ler** yalnızca repository'leri çağırır. SQLAlchemy session almaz, doğrudan DB sorgusu yazmaz.
3. **Repository'ler** yalnızca SQLAlchemy session ile çalışır. İş mantığı içermez.
4. **Agent tool'ları** yalnızca service'leri çağırır. Repository veya DB import etmez.

### Response Kuralları

5. Her endpoint, yanıtını `success_response()` veya `error_response()` fonksiyonları üzerinden döndürür.
6. Ham `dict`, `JSONResponse({...})` veya hardcode yanıt yapısı kullanılmaz.
7. Pydantic validasyon hataları `validation_exception_handler` tarafından otomatik yakalanır; endpoint'te `try/except` yazılmaz.
8. Her endpoint'in `response_model` parametresi `ApiResponse[SchemaType]` formatında tanımlanır.

### Exception Kuralları

9. Servis katmanı yalnızca `AppException` türevlerini fırlatır; `HTTPException` fırlatmaz.
10. `try/except Exception` bloğu yazılmaz. Spesifik exception'lar yakalanır.
11. Exception'lar global handler tarafından yakalanır; endpoint'te tekrar yakalamaya gerek yoktur.

### Async Kuralları

12. `async def` fonksiyon içinde `requests` kütüphanesi kullanılmaz; her zaman `httpx.AsyncClient` kullanılır.
13. SQLAlchemy sorguları `await` ile çağrılır.
14. Redis işlemleri `await` ile çağrılır.

### Pydantic Kuralları

15. Her request body, bir Pydantic schema ile alınır. Ham `dict` alınmaz.
16. `model_dump()` kullanılır; `dict()` (deprecated) kullanılmaz.
17. Serbest metin alanları (`notes`, `description` vb.) `bleach.clean()` ile sanitize edilir.

### Güvenlik & Auth Kuralları

18. Bu projede auth sistemi yalnızca HttpOnly cookie based JWT auth olarak uygulanır.
19. Yeni yazılacak hiçbir endpoint Authorization Bearer auth varsayımıyla tasarlanamaz.
20. Yeni yazılacak hiçbir service token’ı response body’ye koyamaz (Frontend’e token döndürmek yasaktır).
21. Yeni auth gerektiren endpointler `get_current_user` veya `get_admin_user` dependency’sini kullanır.
22. Login/refresh/logout dışında token üretimi veya cookie yönetimi dağınık yapılmaz. Cookie set/clear işlemleri merkezi helper üzerinden yapılmalıdır.
23. Şifre düz metin olarak asla loglanmaz, saklanmaz veya response'a eklenmez.
24. `SECRET_KEY`, `LLM_API_KEY` ve diğer hassas değerler kod içinde sabit string olarak yazılmaz. `get_settings()` üzerinden alınır.
25. SQL sorguları için f-string veya string concatenation kullanılmaz. SQLAlchemy ORM veya `bindparams` kullanılır.
26. CORSMiddleware `allow_credentials=True` olmalı ve `allow_origins` wildcard olmamalıdır.

### Kod Kalitesi

22. Her dosyanın başında o dosyanın sorumluluğunu açıklayan bir yorum satırı yer alır.
23. Magic number kullanılmaz. Sabitler `core/config.py` veya dosyanın üstünde tanımlanır.
24. Bir fonksiyon tek bir şey yapar. 30 satırı geçen fonksiyon bölünür.
25. Her yeni dosya oluşturulmadan önce bu döküman okunur ve ilgili katman kurallarına uyulur.

---

*Son güncelleme: MVP — Global Response Sistemi, Exception Handling, Güvenlik ve Logging eklendi.*