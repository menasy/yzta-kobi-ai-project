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

    # Güvenlik
    SECRET_KEY: str                            # JWT imzalama anahtarı
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440   # 24 saat

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