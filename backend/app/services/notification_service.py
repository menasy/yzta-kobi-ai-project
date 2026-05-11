# Notification iş mantığı katmanı.
# DB kaydı NotificationRepository üzerinden yapılır.
# Redis event publish, DB kaydı başarılı olduktan SONRA yapılır.
# Publish hatası ana akışı düşürmez (publisher zaten fail-safe).

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.core.logger import get_logger
from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository
from app.services.notification_publisher import publish_notification_event

logger = get_logger(__name__)


class NotificationService:
    """Notification iş mantığı servisi."""

    def __init__(self, db: AsyncSession) -> None:
        self._repo = NotificationRepository(db)

    # ── 1. Stok Bildirimi Oluşturma ───────────────────────────

    async def create_low_stock_notification(
        self,
        *,
        product_id: int,
        product_name: str,
        sku: str,
        current_quantity: int,
        threshold: int,
    ) -> Notification | None:
        """
        Kritik stok bildirimi oluşturur.
        """
        # Duplicate kontrolü
        has_recent = await self._repo.has_recent_unread_for_product(product_id)
        if has_recent:
            logger.info(
                "Duplicate low stock notification atlandı.",
                extra={"product_id": product_id, "sku": sku},
            )
            return None

        # Severity belirleme
        severity = "critical" if current_quantity == 0 else "warning"

        notification_data = {
            "type": "LOW_STOCK_ALERT",
            "title": f"Kritik stok uyarısı: {product_name}",
            "message": (
                f"{sku} kodlu ürün için stok {current_quantity} adede düştü. "
                f"Eşik değeri: {threshold}."
            ),
            "severity": severity,
            "payload": {
                "product_id": product_id,
                "product_name": product_name,
                "sku": sku,
                "current_quantity": current_quantity,
                "threshold": threshold,
            },
        }

        # DB'ye kaydet
        notification = await self._repo.create_notification(notification_data)

        # Redis event yayınla
        await self._publish_event(notification, notification_data["payload"])

        return notification

    # ── 2. Kargo Gecikme Bildirimi Oluşturma ───────────────────

    async def create_shipment_delay_notification(
        self,
        *,
        shipment_id: int,
        order_number: str,
        tracking_number: str,
        carrier: str,
        new_estimated_date: str,
        delay_reason: str = "Hava koşulları veya operasyonel yoğunluk",
    ) -> Notification | None:
        """
        Kargo gecikme bildirimi oluşturur.
        
        Akış:
            1. Duplicate kontrolü (Son 1 saatte aynı kargo için bildirim atıldıysa atla).
            2. DB Kaydı (SHIPMENT_DELAY tipiyle).
            3. Redis Event (Frontend anlık uyarı için).
        """
        # Duplicate kontrolü (Repository'de bu metodun olduğunu varsayıyoruz)
        has_recent = await self._repo.has_recent_unread_for_shipment(shipment_id)
        if has_recent:
            logger.info(
                "Duplicate kargo gecikme bildirimi atlandı.",
                extra={"shipment_id": shipment_id, "tracking_number": tracking_number},
            )
            return None

        notification_data = {
            "type": "SHIPMENT_DELAY",
            "title": f"Kargo Gecikmesi: {order_number}",
            "message": (
                f"{tracking_number} takip numaralı kargonuzda gecikme tespit edildi. "
                f"Yeni tahmini teslimat: {new_estimated_date}. Sebep: {delay_reason}"
            ),
            "severity": "warning",
            "payload": {
                "shipment_id": shipment_id,
                "order_number": order_number,
                "tracking_number": tracking_number,
                "carrier": carrier,
                "new_estimated_date": new_estimated_date,
                "delay_reason": delay_reason
            },
        }

        # DB'ye kaydet
        notification = await self._repo.create_notification(notification_data)

        logger.info(
            "Kargo gecikme bildirimi oluşturuldu.",
            extra={
                "notification_id": notification.id,
                "shipment_id": shipment_id,
                "tracking_number": tracking_number,
            },
        )

        # Redis event yayınla
        await self._publish_event(notification, notification_data["payload"])

        return notification

    # ── Yardımcı Metotlar ────────────────────────────────────────

    async def _publish_event(self, notification: Notification, payload: dict):
        """Redis üzerinden anlık event yayınlar."""
        event_payload = {
            "id": notification.id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "severity": notification.severity,
            "payload": payload,
            "created_at": str(notification.created_at),
        }
        await publish_notification_event(event_payload)

    async def list_notifications(self, *, skip: int = 0, limit: int = 50):
        """Tüm bildirimleri sayfalı listeler."""
        return await self._repo.list_notifications(skip=skip, limit=limit)

    async def list_unread(self, *, skip: int = 0, limit: int = 50):
        """Okunmamış bildirimleri sayfalı listeler."""
        return await self._repo.list_unread_notifications(skip=skip, limit=limit)

    async def mark_read(self, notification_id: int) -> Notification:
        """Tek bildirimi okundu olarak işaretler."""
        notification = await self._repo.mark_as_read(notification_id)
        if notification is None:
            raise NotFoundError(message=f"{notification_id} numaralı bildirim bulunamadı.")
        return notification

    async def mark_all_read(self) -> int:
        """Tüm okunmamış bildirimleri okundu olarak işaretler."""
        return await self._repo.mark_all_as_read()


    async def get_daily_delay_summary(self) -> str:
        """
        Son 24 saat içindeki geciken kargoları analiz eder ve özet rapor hazırlar.
        """
        from datetime import datetime, timedelta, timezone
        
        since_24h = datetime.now(timezone.utc) - timedelta(days=1)
        
        # Repository üzerinden son 24 saatteki SHIPMENT_DELAY bildirimlerini çek
        notifications = await self._repo.get_notifications_by_type_and_date(
            notification_type="SHIPMENT_DELAY",
            since_date=since_24h
        )
        
        if not notifications:
            return "Son 24 saat içinde herhangi bir kargo gecikmesi tespit edilmedi."
        
        count = len(notifications)
        summary = f"📢 **Kargo Gecikme Raporu ({count} Adet)**\n\n"
        
        for n in notifications:
            p = n.payload  # JSON payload
            summary += f"• **Sipariş:** {p.get('order_number')} | **Takip:** {p.get('tracking_number')}\n"
            summary += f"  - Sebep: {p.get('delay_reason')}\n"
            summary += f"  - Yeni Teslimat: {p.get('new_estimated_date')}\n\n"
            
        return summary
    


    