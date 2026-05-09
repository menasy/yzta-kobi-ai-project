# core/config.py
# Tüm ortam değişkenleri merkezi olarak bu dosyadan yönetilir.
# Başka hiçbir dosyada doğrudan os.environ kullanılmaz.
# Settings singleton olarak @lru_cache ile sunulur.

from functools import lru_cache

from pydantic import field_validator, model_validator
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
    DEBUG: bool = False
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # ── Veritabanı ────────────────────────────────────────
    DATABASE_URL: str  # postgresql+asyncpg://...
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 5
    DATABASE_ECHO: bool = False

    # ── Redis ─────────────────────────────────────────────
    REDIS_URL: str = "redis://redis:6379/0"
    REDIS_CONVERSATION_TTL: int = 86400  # 24 saat (saniye)

    # ── Güvenlik ──────────────────────────────────────────
    SECRET_KEY: str  # JWT imzalama anahtarı — min 32 karakter
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 saat

    # ── LLM ───────────────────────────────────────────────
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "claude-sonnet-4-20250514"

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

    # ── Validators ────────────────────────────────────────

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Secret key boş veya çok kısa olmamalı."""
        if len(v) < 32:
            raise ValueError(
                "SECRET_KEY en az 32 karakter uzunluğunda olmalıdır. "
                "python -c \"import secrets; print(secrets.token_urlsafe(48))\" ile üretebilirsiniz."
            )
        return v

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        """Production ortamında güvenlik açısından kritik kontroller."""
        if self.is_production:
            weak_keys = {"secret", "change", "dev", "test", "example", "placeholder"}
            key_lower = self.SECRET_KEY.lower()
            if any(weak in key_lower for weak in weak_keys):
                raise ValueError(
                    "Production ortamında zayıf SECRET_KEY kullanılamaz. "
                    "Güvenli, rastgele bir key üretin."
                )
            if self.DEBUG:
                raise ValueError(
                    "Production ortamında DEBUG=true olmamalıdır."
                )
        return self


@lru_cache()
def get_settings() -> Settings:
    """Settings singleton instance. İlk çağrıda oluşturulur, sonraki çağrılarda cache'ten döner."""
    return Settings()
