# services/notification_service.py
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

    # ── Notification Oluşturma ───────────────────────────

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

        Akış:
            1. Duplicate kontrolü — son 1 saat içinde aynı ürün için okunmamış bildirim varsa atla.
            2. PostgreSQL'e Notification kaydı oluştur (flush ile kalıcı hale getir).
            3. Redis Pub/Sub ile canlı notification event yayınla.

        Returns:
            Oluşturulan Notification veya duplicate durumunda None.
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

        # 1. Önce DB'ye kaydet (flush → ID alınır, commit session dependency'de)
        notification = await self._repo.create_notification(notification_data)

        logger.info(
            "Low stock notification oluşturuldu.",
            extra={
                "notification_id": notification.id,
                "product_id": product_id,
                "sku": sku,
                "quantity": current_quantity,
            },
        )

        # 2. DB kaydı başarılı olduktan SONRA Redis event yayınla
        event_payload = {
            "id": notification.id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "severity": notification.severity,
            "payload": notification_data["payload"],
            "created_at": str(notification.created_at),
        }
        await publish_notification_event(event_payload)

        return notification

    # ── Listeleme ────────────────────────────────────────

    async def list_notifications(
        self,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Notification]:
        """Tüm bildirimleri sayfalı listeler."""
        return await self._repo.list_notifications(skip=skip, limit=limit)

    async def list_unread(
        self,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Notification]:
        """Okunmamış bildirimleri sayfalı listeler."""
        return await self._repo.list_unread_notifications(skip=skip, limit=limit)

    # ── Okundu İşaretleme ────────────────────────────────

    async def mark_read(self, notification_id: int) -> Notification:
        """Tek bildirimi okundu olarak işaretler."""
        notification = await self._repo.mark_as_read(notification_id)
        if notification is None:
            raise NotFoundError(
                message=f"{notification_id} numaralı bildirim bulunamadı."
            )
        return notification

    async def mark_all_read(self) -> int:
        """Tüm okunmamış bildirimleri okundu olarak işaretler. Güncellenen sayıyı döndürür."""
        return await self._repo.mark_all_as_read()
