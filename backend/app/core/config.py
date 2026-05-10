# backend/seed_db.py
import asyncio
from sqlalchemy import text
from app.core.database import get_db_session 

async def seed_data():
    # get_db_session bir generator olduğu için __anext__() ile session'ı alıyoruz
    session_gen = get_db_session()
    session = await session_gen.__anext__()
    
    try:
        print("🚀 Veri ekleme işlemi başlıyor...")
        
        # 1. Önce ürün var mı kontrol et/ekle
        await session.execute(text(
            "INSERT INTO products (id, name) VALUES (1, 'Domates') "
            "ON CONFLICT (id) DO NOTHING"
        ))
        
        # 2. Stok verisini ekle (Stok: 5, Eşik: 10)
        await session.execute(text(
            "INSERT INTO inventory (product_id, quantity, low_stock_threshold, reserved_quantity, last_updated_at, updated_at) "
            "VALUES (1, 5, 10, 0, NOW(), NOW()) "
            "ON CONFLICT (product_id) DO UPDATE SET quantity = 5"
        ))
        
        await session.commit()
        print("✅ Başarılı: Domates stoğu 5 adet olarak güncellendi (Eşik: 10).")
        
    except Exception as e:
        await session.rollback()
        print(f"❌ Hata oluştu: {e}")
    finally:
        await session.close()

if __name__ == "__main__":
    # Windows'ta Event Loop hatası almamak için:
    if hasattr(asyncio, 'WindowsSelectorEventLoopPolicy'):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_data())