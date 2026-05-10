import asyncio
import json
import os
import aio_pika
import google.generativeai as genai
from dotenv import load_dotenv


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")

# 1. Gemini Yapılandırması
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

async def process_message(message: aio_pika.IncomingMessage):
    async with message.process():
        try:
            data = json.loads(message.body.decode())
            print(f"📥 Yeni stok uyarısı alındı: {data['urun']}")

            # 2. Gemini'ye sorulacak soruyu hazırla
            prompt = f"""
            Sen bir KOBİ asistanısın. Aşağıdaki stok verisine göre yöneticiye kısa, 
            akıllıca ve profesyonel bir tavsiye ver:
            Ürün: {data['urun']}
            Mevcut Stok: {data['mevcut_stok']}
            Kritik Eşik: {data['kritik_esik']}
            
            Tavsiyen çok kısa (en fazla 2 cümle) ve aksiyon odaklı olsun.
            """

            # 3. Gemini'den yanıt al
            response = model.generate_content(prompt)
            print("\n" + "="*40)
            print(f"🤖 GEMINI TAVSİYESİ: {response.text}")
            print("="*40 + "\n")
            
        except Exception as e:
            print(f"❌ İşlem hatası: {e}")

async def main():
    if not GEMINI_API_KEY:
        print("❌ HATA: .env dosyasında GEMINI_API_KEY bulunamadı!")
        return

    try:
        # RabbitMQ'ya bağlan
        connection = await aio_pika.connect_robust(RABBITMQ_URL)
        channel = await connection.channel()
        
        queue = await channel.declare_queue("stok_uyarilari", durable=True)
        
        print("🎧 AI Consumer çalışıyor, stok uyarıları bekleniyor...")
        await queue.consume(process_message)

        await asyncio.Future() # Çalışmaya devam et
    except Exception as e:
        print(f"❌ Bağlantı hatası: {e}")

if __name__ == "__main__":
    # Windows için event loop ayarı
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())