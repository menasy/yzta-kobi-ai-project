# KOBİ AI Agent

KOBİ'ler ve kooperatifler için yapay zeka destekli operasyon asistanı.

## Gereksinimler

- **Docker** ve **Docker Compose** (v2+)
- **Python 3.12+** (local geliştirme için)
- **Poetry** (dependency yönetimi)

## Hızlı Başlangıç

### 1. Poetry Kurulumu

```bash
# Poetry yükle (henüz kurulu değilse)
curl -sSL https://install.python-poetry.org | python3 -

# Kurulumu doğrula
poetry --version
```

### 2. Bağımlılık Yükleme

```bash
cd backend

# Tüm bağımlılıkları yükle (dev dahil)
poetry install

# Sadece production bağımlılıkları
poetry install --only main
```

### 3. Environment Dosyası

```bash
# Proje kökünde .env dosyasını oluştur
cp .env.example .env

# SECRET_KEY ve LLM_API_KEY değerlerini güncelle
# Güvenli bir SECRET_KEY üretmek için:
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

### 4. Docker ile Çalıştırma

```bash
# İlk çalıştırma (image build eder)
docker compose up --build

# Sonraki çalıştırmalarda
docker compose up

# Arka planda çalıştırma
docker compose up -d

# Durdurma
docker compose down
```

API container başlangıcında sırasıyla şu akış çalışır:

1. `alembic upgrade head`
2. `python scripts/seed_all.py`
3. `uvicorn app.main:app --host 0.0.0.0 --port 8000`

Seed sistemi `seed_runs` tablosuna başarılı çalışma kaydı yazar.
Aynı seed sürümü tekrar çalıştırıldığında duplicate ürün, sipariş, stok hareketi,
kargo, bildirim veya konuşma verisi üretmez; mevcut gerçek kullanıcı verilerini silmez.

### Demo Giriş Bilgileri

```text
Admin:      admin@kobi.local / Admin123!
İşletme:    isletme@kobi.local / Demo12345!
Operasyon:  operasyon@kobi.local / Demo12345!
Demo user:  demo@kobi.local / Demo12345!
```

### Manuel Seed Çalıştırma

Migration sonrası seed'i elle çalıştırmak için:

```bash
docker compose exec api python scripts/seed_all.py
```

Local backend ortamında:

```bash
cd backend
poetry run alembic upgrade head
poetry run python scripts/seed_all.py
```

### 5. Durum Kontrolleri

```bash
# PostgreSQL sağlık kontrolü
docker inspect --format='{{.State.Health.Status}}' kobi_db

# Redis çalışıyor mu?
docker exec kobi_redis redis-cli ping
# Beklenen yanıt: PONG

# Tüm servislerin durumu
docker compose ps
```

### 6. Logları İzleme

```bash
# Tüm servis logları
docker compose logs -f

# Sadece backend logları
docker compose logs -f api

# Sadece veritabanı logları
docker compose logs -f db
```

### 8. Veritabanı ve Redis Bağlantısı

Geliştirme sırasında veritabanına ve Redis'e iki farklı şekilde bağlanılabilir:

*   **Docker İçinden (Backend -> DB):**
    *   **Host:** `db` (PostgreSQL), `redis` (Redis)
    *   **Port:** `5432`, `6379`
    *   **Config:** `.env` içindeki `DATABASE_URL` ve `REDIS_URL` bu hostları kullanır.

*   **Dışarıdan (DBeaver, pgAdmin -> Docker):**
    *   **Host:** `localhost`
    *   **PostgreSQL Port:** `.env` içindeki `POSTGRES_PORT` (Varsayılan: `5433`)
    *   **Redis Port:** `.env` içindeki `REDIS_PORT` (Varsayılan: `6380`)

**Bağlantı Örneği:**
*   **Host:** `localhost` | **Port:** `5433` | **User:** `kobi_user` | **Pass:** `kobi_pass`

---

## Sistem Mimarisi

```
FastAPI Backend → Service Layer → Repository Layer → PostgreSQL
                → Agent Layer  → LLM (Claude)
                               → Redis (Konuşma Hafızası)
```

## API Dokümantasyonu

Uygulama çalışırken:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

## Proje Yapısı

```
├── backend/
│   ├── app/              # Ana uygulama paketi
│   │   ├── core/         # Config, exceptions, responses, security
│   │   ├── db/           # SQLAlchemy engine & session
│   │   ├── models/       # ORM modelleri
│   │   ├── schemas/      # Pydantic şemaları
│   │   ├── repositories/ # Veri erişim katmanı
│   │   ├── services/     # İş mantığı katmanı
│   │   ├── agent/        # AI Agent sistemi
│   │   ├── api/          # HTTP endpoint'leri
│   │   └── integrations/ # Dış servis adaptörleri
│   ├── alembic/          # DB migration'ları
│   ├── scripts/          # Seed data vb.
│   ├── Dockerfile
│   └── pyproject.toml
├── docker-compose.yml
├── .env.example
└── .env                  # (gitignore'da)
```
