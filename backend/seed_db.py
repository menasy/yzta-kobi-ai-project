import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# 1. Veritabanı adresin (Burası net)
DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5433/kobidb"

async def seed_data():
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    # 2. Önce tabloları elle (SQL ile) oluşturuyoruz 
    async with engine.begin() as conn:
        print("🛠️ Tablolar oluşturuluyor...")
        # Products tablosu
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        """))
        # Inventory tablosu
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS inventory (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                low_stock_threshold INTEGER DEFAULT 10,
                reserved_quantity INTEGER DEFAULT 0,
                last_updated_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """))

    # 3. Veriyi ekle
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        try:
            print("🚀 Veri ekleniyor...")
            # Domatesi ekle
            await session.execute(text("INSERT INTO products (id, name) VALUES (1, 'Domates') ON CONFLICT (id) DO NOTHING"))
            # Stoğu ekle (Miktar: 5, Eşik: 10)
            await session.execute(text("""
                INSERT INTO inventory (product_id, quantity, low_stock_threshold) 
                VALUES (1, 5, 10) 
                ON CONFLICT DO NOTHING
            """))
            await session.commit()
            print("✅ BAŞARILI! Veritabanı hazır, Domates eklendi.")
        except Exception as e:
            print(f"❌ Bir hata çıktı: {e}")
        finally:
            await engine.dispose()

if __name__ == "__main__":
    if os.name == 'nt': # Windows için özel ayar
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_data())