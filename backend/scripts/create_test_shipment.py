import asyncio
import sys
import os
import uuid

# Proje kök dizinini Python yoluna ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.db.session import _get_session_factory
from app.models.shipment import Shipment
from app.models.order import Order
from app.models.customer import Customer

async def create_test_data():
    session_factory = _get_session_factory()
    
    async with session_factory() as session:
        try:
            # 1. Önce bir test müşterisi bul
            result = await session.execute(select(Customer).limit(1))
            customer = result.scalar_one_or_none()
            
            if not customer:
                print("❌ Hata: Veritabanında müşteri bulunamadı. Önce seed_data.py çalıştırın.")
                return

            # 2. Test Siparişi Oluştur
            random_suffix = str(uuid.uuid4())[:8].upper()
            test_order = Order(
                order_number=f"ORD-TEST-{random_suffix}",
                customer_id=customer.id,
                total_amount=1250.0,
                status="processing",
                shipping_full_name=customer.full_name,
                shipping_phone=customer.phone or "555-000-0000",
                shipping_address="Test Mah. Deneme Sok. No:1",
                shipping_city="İstanbul",
                shipping_district="Kadıköy",
                shipping_postal_code="34000",
                shipping_note="Test siparişi"
            )
            session.add(test_order)
            await session.flush() 

            # 3. Test Kargosu Oluştur (Her seferinde farklı Takip No)
            # 'TRACK-DELAY' ile başladığı için Worker bunu gecikmiş sayacak
            unique_tracking = f"TRACK-DELAY-{str(uuid.uuid4())[:4].upper()}"
            
            test_shipment = Shipment(
                order_id=test_order.id,
                carrier="yurtici",
                tracking_number=unique_tracking, 
                status="in_transit"
            )
            session.add(test_shipment)
            
            await session.commit()
            
            print("-" * 40)
            print(f"✅ TEST VERİSİ BAŞARIYLA OLUŞTURULDU")
            print(f"📦 Sipariş No: {test_order.order_number}")
            print(f"🚚 Takip No:  {test_shipment.tracking_number}")
            print(f"👤 Müşteri:   {customer.full_name}")
            print("-" * 40)

        except Exception as e:
            await session.rollback()
            print(f"❌ Bir hata oluştu: {e}")

if __name__ == "__main__":
    asyncio.run(create_test_data())