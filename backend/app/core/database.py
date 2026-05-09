from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings

settings = get_settings()

# veritabanı motoru (engine) 
# echo=True yaparsak arka planda dönen SQL sorgularını terminalde görebiliriz
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

# veritabanı oturumu (session) fabrikası
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# tablolarımızın miras alacağı ana sınıf (Base)
class Base(DeclarativeBase):
    pass

# veritabanı bağlantısını güvenli bir şekilde açıp kapatan yardımcı fonksiyon
async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()