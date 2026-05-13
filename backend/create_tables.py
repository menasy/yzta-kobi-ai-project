import asyncio
import sys
import os

# Python'un klasörleri doğru görmesi için path 
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import _get_engine
from app.db.base import Base  # db altındaki base'den çekiyoruz
from app.models.product import Product # Tabloyu görmesi için modeli de import etmeliyiz

async def init_db():
    try:
        engine = _get_engine()
        async with engine.begin() as conn:
            # Modelleri veritabanına yansıtmak icin 
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Tablolar başarıyla oluşturuldu!")
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")

if __name__ == "__main__":
    asyncio.run(init_db())