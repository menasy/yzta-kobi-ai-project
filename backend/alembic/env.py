import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Proje Ana Dizini
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    
    # Proje Bilgileri
    PROJECT_NAME: str = "YZTA Kobi AI Project"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Veritabanı ve RabbitMQ (Hataları önlemek için default değerler)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5433/kobidb")
    RABBITMQ_URL: str = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672//")

    # --- Pydantic'in hata verdiği "Ekstra" alanları buraya ekleyelim ---
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    DEBUG: Optional[bool] = False
    REDIS_URL: Optional[str] = None
    SECRET_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    class Config:
        case_sensitive = True
        env_file = ".env"
        # KRİTİK DÜZELTME: .env içindeki fazladan değişkenleri hata olarak görme, görmezden gel.
        extra = "ignore" 

def get_settings() -> Settings:
    return Settings()

settings = get_settings()