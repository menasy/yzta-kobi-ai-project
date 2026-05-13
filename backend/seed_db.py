import asyncio
import os
import random
from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Veritabanı adresi
DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5433/kobidb"

async def seed_data():
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    # 1. Tabloları tek tek oluştur
    async with engine.begin() as conn:
        print("Tablolar yapilandiriliyor...")
        
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY, 
                name VARCHAR(255) NOT NULL
            );
        """))

        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS inventory (
                id SERIAL PRIMARY KEY, 
                product_id INTEGER REFERENCES products(id), 
                quantity INTEGER NOT NULL, 
                low_stock_threshold INTEGER DEFAULT 10,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """))

        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                sale_date TIMESTAMP DEFAULT NOW()
            );
        """))

    # 2. Veri ekleme oturumu
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        try:
            print("Veriler uretiliyor...")
            
            # Urunleri ve Stoklari Ekle
            products = [(1, "Domates"), (2, "Salatalik"), (3, "Biber")]
            for p_id, p_name in products:
                await session.execute(
                    text("INSERT INTO products (id, name) VALUES (:id, :name) ON CONFLICT (id) DO NOTHING"), 
                    {"id": p_id, "name": p_name}
                )
                await session.execute(
                    text("INSERT INTO inventory (product_id, quantity) VALUES (:id, 50) ON CONFLICT DO NOTHING"), 
                    {"id": p_id}
                )

            # 3. Son 60 gunun satis verisini olustur
            print("Satis gecmisi yaziliyor...")
            for p_id, _ in products:
                for i in range(60):
                    tarih = datetime.now() - timedelta(days=i)
                    # Hafta sonu daha yuksek satis simulasyonu
                    if tarih.weekday() >= 5:
                        miktar = random.randint(40, 60)
                    else:
                        miktar = random.randint(20, 40)
                    
                    await session.execute(text("""
                        INSERT INTO sales (product_id, quantity, sale_date) 
                        VALUES (:p_id, :qty, :s_date)
                    """), {"p_id": p_id, "qty": miktar, "s_date": tarih})
            
            await session.commit()
            print("ISLEM TAMAMLANDI: Tahminleme icin veriler hazir.")
            
        except Exception as e:
            print(f"Hata olustu: {e}")
        finally:
            await engine.dispose()

if __name__ == "__main__":
    if os.name == 'nt': # Windows icin event loop ayari
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_data())