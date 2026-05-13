import asyncio
from datetime import datetime, timedelta
import random
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5433/kobidb"

async def fix_seed():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Eski siparişler temizleniyor ve yenileri ekleniyor...")
        await conn.execute(text("TRUNCATE order_items, orders CASCADE;"))
        
        # 5 farklı ürün için 60 günlük veri
        for p_id in range(1, 6):
            for i in range(60):
                tarih = datetime.now() - timedelta(days=i)
                order_id = (p_id * 100) + i
                
                # 1. Sipariş oluştur
                await conn.execute(text("""
                    INSERT INTO orders (id, order_number, customer_id, placed_at, shipping_full_name, shipping_phone, shipping_address, shipping_city, shipping_district)
                    VALUES (:id, :num, 1, :dt, 'Test', '123', 'Adres', 'City', 'Dist')
                """), {"id": order_id, "num": f"ORD-{order_id}", "dt": tarih})
                
                # 2. Sipariş kalemi (satış) oluştur
                miktar = random.randint(20, 50) if tarih.weekday() >= 5 else random.randint(5, 20)
                await conn.execute(text("""
                    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                    VALUES (:oid, :pid, :qty, 10.0, :total)
                """), {"oid": order_id, "pid": p_id, "qty": miktar, "total": miktar * 10})

        print("BAŞARILI: Artık tahmin motoru gerçek veri görecek!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix_seed())