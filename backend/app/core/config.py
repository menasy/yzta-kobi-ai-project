# core/config.py
# Tüm ortam değişkenleri merkezi olarak bu dosyadan yönetilir.
# Başka hiçbir dosyada doğrudan os.environ kullanılmaz.
# Settings singleton olarak @lru_cache ile sunulur.

from functools import lru_cache
from typing import Any

from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Uygulama konfigürasyon modeli. Tüm ayarlar .env dosyasından okunur."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Uygulama ──────────────────────────────────────────
    APP_NAME: str = "KOBİ Agent"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"  # development | staging | production
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # ── Veritabanı ────────────────────────────────────────
    DATABASE_URL: str  # .env dosyasında tanımlı olmalı
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 5
    DATABASE_ECHO: bool = False

    # ── Redis ─────────────────────────────────────────────
    # Docker dışında çalışırken localhost:6379, içindeyken redis:6379 kullanılır.
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CONVERSATION_TTL: int = 86400  # 24 saat (saniye)
    AI_PENDING_ACTION_TTL_SECONDS: int = 1200  # 20 dakika
    RATE_LIMIT_CHAT_MAX_REQUESTS: int = 20
    RATE_LIMIT_CHAT_WINDOW_SECONDS: int = 60
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"

    # ── Güvenlik ──────────────────────────────────────────
    SECRET_KEY: str  # JWT imzalama anahtarı — .env'den okunur
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 saat
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 gün

    # ── Cookie Ayarları ───────────────────────────────────
    AUTH_ACCESS_COOKIE_NAME: str = "access_token"
    AUTH_REFRESH_COOKIE_NAME: str = "refresh_token"
    AUTH_COOKIE_PATH: str = "/"
    AUTH_COOKIE_DOMAIN: str | None = Field(
        default=None,
        validation_alias=AliasChoices("AUTH_COOKIE_DOMAIN", "COOKIE_DOMAIN"),
    )
    AUTH_COOKIE_SECURE: bool = Field(
        default=False,
        validation_alias=AliasChoices("AUTH_COOKIE_SECURE", "COOKIE_SECURE"),
    )
    AUTH_COOKIE_HTTPONLY: bool = True
    AUTH_COOKIE_SAMESITE: str = Field(
        default="lax",
        validation_alias=AliasChoices("AUTH_COOKIE_SAMESITE", "COOKIE_SAMESITE"),
    )

    # ── LLM ───────────────────────────────────────────────
    LLM_API_KEY: str = ""
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-2.0-flash"

    # ── Kargo ─────────────────────────────────────────────
    USE_MOCK_CARGO: bool = True
    CARGO_API_KEY: str = ""

    # ── Logging ───────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = True

    # ── Derived Properties ────────────────────────────────

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def cors_allow_origin_regex(self) -> str | None:
        """
        Development ortamında tipik local origin'leri port bağımsız kabul eder.
        Cookie auth nedeniyle production'da regex fallback kapalı tutulur.
        """
        if not self.is_development:
            return None
        return (
            r"^https?://("
            r"localhost|"
            r"127\.0\.0\.1|"
            r"0\.0\.0\.0|"
            r"[a-zA-Z0-9-]+\.local|"
            r"192\.168\.\d{1,3}\.\d{1,3}|"
            r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
            r"172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}"
            r")(:\d{1,5})?$"
        )

    @property
    def auth_cookie_cleanup_paths(self) -> list[str]:
        """Canonical path yanında olası legacy path'leri de temizlemek için adaylar."""
        candidates = [
            self.AUTH_COOKIE_PATH,
            "/",
            self.API_PREFIX,
            f"{self.API_PREFIX}/auth",
        ]
        normalized: list[str] = []
        for path in candidates:
            if not path:
                continue
            value = path if path == "/" else path.rstrip("/")
            if not value.startswith("/"):
                value = f"/{value}"
            if value not in normalized:
                normalized.append(value)
        return normalized

    @property
    def auth_cookie_cleanup_domains(self) -> list[str | None]:
        """Canonical domain yanında host-only legacy cookie temizliği için adaylar."""
        candidates = [self.AUTH_COOKIE_DOMAIN, None]
        normalized: list[str | None] = []
        for domain in candidates:
            if domain not in normalized:
                normalized.append(domain)
        return normalized

    # ── Validators ────────────────────────────────────────

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Secret key boş veya çok kısa olmamalı."""
        if len(v) < 32:
            raise ValueError(
                "SECRET_KEY en az 32 karakter uzunluğunda olmalıdır."
            )
        return v

    @field_validator("AUTH_COOKIE_DOMAIN", mode="before")
    @classmethod
    def normalize_cookie_domain(cls, v: str | None) -> str | None:
        """Boş domain değeri host-only cookie anlamına gelecek şekilde None'a çevrilir."""
        if v is None:
            return None
        value = str(v).strip()
        return value or None

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        """Production ortamında güvenlik açısından kritik kontroller."""
        if "*" in self.CORS_ORIGINS:
            raise ValueError("Cookie auth kullanıldığı için CORS_ORIGINS içinde wildcard (*) kullanılamaz.")

        allowed_samesite = {"lax", "strict", "none"}
        if self.AUTH_COOKIE_SAMESITE.lower() not in allowed_samesite:
            raise ValueError("AUTH_COOKIE_SAMESITE yalnızca lax, strict veya none olabilir.")

        self.AUTH_COOKIE_SAMESITE = self.AUTH_COOKIE_SAMESITE.lower()

        if self.AUTH_COOKIE_SAMESITE == "none" and not self.AUTH_COOKIE_SECURE:
            raise ValueError("AUTH_COOKIE_SAMESITE=none kullanılırsa AUTH_COOKIE_SECURE=true olmalıdır.")

        if not self.AUTH_ACCESS_COOKIE_NAME.strip():
            raise ValueError("AUTH_ACCESS_COOKIE_NAME boş olamaz.")
        if not self.AUTH_REFRESH_COOKIE_NAME.strip():
            raise ValueError("AUTH_REFRESH_COOKIE_NAME boş olamaz.")
        if not self.AUTH_COOKIE_PATH.startswith("/"):
            raise ValueError("AUTH_COOKIE_PATH '/' ile başlamalıdır.")
        if self.AUTH_COOKIE_PATH != "/" and self.AUTH_COOKIE_PATH.endswith("/"):
            self.AUTH_COOKIE_PATH = self.AUTH_COOKIE_PATH.rstrip("/")

        if self.is_production:
            if self.DEBUG:
                raise ValueError("Production ortamında DEBUG=true olmamalıdır.")
            if not self.AUTH_COOKIE_SECURE:
                raise ValueError("Production ortamında AUTH_COOKIE_SECURE=true olmalıdır.")
        return self


@lru_cache()
def get_settings() -> Settings:
    """Settings singleton instance. İlk çağrıda oluşturulur, sonraki çağrılarda cache'ten döner."""
    return Settings()
