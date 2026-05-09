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

### 7. Veritabanı İşlemleri

```bash
# Migration uygulama
docker compose exec api alembic upgrade head

# Örnek veri yükleme
docker compose exec api python scripts/seed_data.py
```

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