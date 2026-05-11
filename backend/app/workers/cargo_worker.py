import asyncio
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import _get_session_factory
from app.integrations.cargo.mock_provider import MockCargoProvider
from app.models.shipment import Shipment
from app.services.notification_service import NotificationService
from app.core.logger import get_logger

logger = get_logger(__name__)

class CargoTrackingWorker:
    """
    Arka planda kargo durumlarını periyodik olarak kontrol eden işçi.
    Teslim edilmemiş kargoları sorgular ve gecikme durumunda bildirim sistemini tetikler.
    """

    def __init__(self):
        self.provider = MockCargoProvider()

    async def track_active_shipments(self):
        """Teslim edilmemiş tüm kargoları kontrol eder."""

        session_factory = _get_session_factory()
        async with session_factory() as session:
            # 1. Henüz teslim edilmemiş kargoları DB'den çek
            # (delivered, cancelled veya failed olmayanlar)
            query = select(Shipment).where(
                Shipment.status.notin_(["delivered", "cancelled", "failed"])
            )
            result = await session.execute(query)
            active_shipments = result.scalars().all()

            if not active_shipments:
                logger.debug("Takip edilecek aktif kargo bulunamadı.")
                return

            notification_service = NotificationService(session)

            for shipment in active_shipments:
                try:
                    # 2. Mock Provider'dan güncel durumu al
                    current_status = await self.provider.get_status(shipment.tracking_number)
                    
                    logger.info(
                        f"Kargo sorgulandı: {shipment.tracking_number} -> {current_status.status}"
                    )

                    # 3. Eğer durum 'delayed' ise ve DB'de henüz işlenmemişse
                    if current_status.status == "delayed":
                        # Bildirim servisini çağır (Service kendi içinde duplicate kontrolü yapacak)
                        await notification_service.create_shipment_delay_notification(
                            shipment_id=shipment.id,
                            order_number=f"ORD-{shipment.order_id}", # Örnek format
                            tracking_number=shipment.tracking_number,
                            carrier=shipment.carrier,
                            new_estimated_date=current_status.estimated_delivery,
                            delay_reason=current_status.detail
                        )
                        
                        # DB'deki kargo durumunu güncelle
                        shipment.status = "delayed"
                        shipment.estimated_delivery_date = datetime.strptime(
                            current_status.estimated_delivery, "%Y-%m-%d"
                        ).replace(tzinfo=timezone.utc)

                    # 4. Eğer kargo teslim edildiyse durumu güncelle
                    elif current_status.status == "delivered":
                        shipment.status = "delivered"
                        shipment.delivered_at = datetime.now(timezone.utc)

                    shipment.last_checked_at = datetime.now(timezone.utc)
                    
                except Exception as e:
                    logger.error(f"Kargo {shipment.tracking_number} izlenirken hata: {e}")

            # Tüm değişiklikleri kaydet
            await session.commit()

    async def run(self, interval_seconds: int = 60):
        """Worker'ı belirli aralıklarla çalıştıran ana döngü."""
        logger.info(f"Kargo Takip Worker başlatıldı. Kontrol aralığı: {interval_seconds}sn")
        while True:
            try:
                await self.track_active_shipments()
            except Exception as e:
                logger.error(f"Worker döngüsünde kritik hata: {e}")
            
            await asyncio.sleep(interval_seconds)

# Test veya tek başına çalıştırmak icin
if __name__ == "__main__":
    worker = CargoTrackingWorker()
    asyncio.run(worker.run())