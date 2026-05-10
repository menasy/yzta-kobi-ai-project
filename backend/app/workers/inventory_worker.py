import asyncio
import json
import aio_pika
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Ayarlar
DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5433/kobidb"
RABBITMQ_URL = "amqp://guest:guest@localhost:5672/"

async def check_inventory_and_notify():
    # 1. Veritabanına Bağlan
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # 2. RabbitMQ'ya Bağlan
    connection = await aio_pika.connect_robust(RABBITMQ_URL)
    
    async with connection:
        channel = await connection.channel()
        # "stok_uyarilari" adında bir kuyruk oluştur
        queue = await channel.declare_queue("stok_uyarilari", durable=True)

        async with async_session() as session:
            # Stoğu eşik değerinin altında olanları bul
            result = await session.execute(text("""
                SELECT p.name, i.quantity, i.low_stock_threshold 
                FROM inventory i 
                JOIN products p ON i.product_id = p.id 
                WHERE i.quantity < i.low_stock_threshold
            """))
            
            for row in result:
                message_data = {
                    "urun": row[0],
                    "mevcut_stok": row[1],
                    "kritik_esik": row[2],
                    "uyari": "Stok kritik seviyenin altında!"
                }
                
                # Mesajı RabbitMQ'ya gönder
                await channel.default_exchange.publish(
                    aio_pika.Message(body=json.dumps(message_data).encode()),
                    routing_key="stok_uyarilari"
                )
                print(f"📢 RabbitMQ'ya uyarı gönderildi: {row[0]} (Stok: {row[1]})")

    await engine.dispose()

if __name__ == "__main__":
    print("🕵️ Stok Dedektifi çalışıyor...")
    asyncio.run(check_inventory_and_notify())