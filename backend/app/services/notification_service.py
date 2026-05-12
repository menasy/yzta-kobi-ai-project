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
from app.services.stock_analysis_service import StockAnalysisService
from app.models.product import Product
from sqlalchemy import select

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
        Son 24 saat içindeki gecikmeleri analiz eder, AgentOrchestrator (Gemini) 
        ile özetler ve sonucu bir Sistem Bildirimi olarak kaydeder.
        """
        from datetime import datetime, timedelta, timezone
        from app.agent.orchestrator import AgentOrchestrator # AIService yerine bunu ekledik

        since_24h = datetime.now(timezone.utc) - timedelta(days=1)
        
        # 1. Gecikme verilerini çek
        notifications = await self._repo.get_notifications_by_type_and_date(
            notification_type="SHIPMENT_DELAY",
            since_date=since_24h
        )
        
        if not notifications:
            return "Son 24 saat içinde herhangi bir kargo gecikmesi tespit edilmedi."
        
        # 2. Agent'a gönderilecek ham metni hazırla
        raw_data = ""
        for n in notifications:
            p = n.payload
            raw_data += f"- Sipariş: {p.get('order_number')}, Takip: {p.get('tracking_number')}, Sebep: {p.get('delay_reason')}\n"

        # 3. AgentOrchestrator ile Analiz Yap
        try:
            orchestrator = AgentOrchestrator(db=self._repo.session) 
            
            user_prompt = (
                f"Aşağıdaki kargo gecikme verilerini profesyonelce analiz et, "
                f"nedenlerini gruplandır ve yönetici özeti çıkar:\n\n{raw_data}"
            )
            
            summary_text = await orchestrator.run(user_prompt, session_id="system_delay_report")
        except Exception as e:
            logger.error(f"AI Analiz hatası: {e}", exc_info=True)
            summary_text = f"Toplam {len(notifications)} gecikme var ancak rapor oluşturulamadı."

        # 4. Analiz sonucunu veritabanına bir "SYSTEM_REPORT" bildirimi olarak kaydet
        report_notification_data = {
            "type": "SYSTEM_REPORT",
            "title": "Günlük Kargo Gecikme Analizi (Agent)",
            "message": summary_text,
            "severity": "info",
            "payload": {
                "total_delayed": len(notifications),
                "generated_at": str(datetime.now(timezone.utc))
            }
        }
        
        # DB'ye kaydet
        await self._repo.create_notification(report_notification_data)
        
        return summary_text
    

    async def generate_daily_tasks(self):

        db_session = getattr(self._repo, 'db', getattr(self._repo, 'session', None))
        
        if not db_session:
            return {"status": "error", "message": "Veritabanı bağlantısı kurulamadı."}

        
        analysis_service = StockAnalysisService(db_session) 
        product_query = select(Product)
        product_result = await db_session.execute(product_query)
        all_products = product_result.scalars().all()

        critical_items_list = ""
        for product in all_products:
            # Her ürünü analiz et
            analysis = await analysis_service.analyze_stock_health(product.id)
            if analysis.get("status") == "danger":
                days = analysis.get("days_to_zero", "Belirsiz")
                shortage = analysis.get("forecasted_demand_3d", 0) - analysis.get("current_stock", 0)
                critical_items_list += f"- {product.name}: {round(max(0, shortage), 2)} birim lazım (Kalan: {days} gün)\n"

    
        if not critical_items_list:
            depo_message = "Bugün acil bir stok takviyesi gerekmiyor. Tüm stoklar güvenli seviyede."
        else:
            depo_message = "SABAH LİSTESİ: Acil takviye gereken ürünler:\n" + critical_items_list

        depo_task = Notification(
            title="Dinamik Depo Hazırlık Listesi",
            message=depo_message,
            type="task_assignment"
        )

        kargo_task = Notification(
            title="Günlük Teslimat Rotası",
            message="Rota: Merkez -> Bölge Dağıtım -> Müşteri Teslimat Noktaları.",
            type="task_assignment"
        )

        
        try:
            db_session.add(depo_task)
            db_session.add(kargo_task)
            await db_session.commit()
        except Exception as e:
            await db_session.rollback()
            return {"status": "error", "message": f"Kayıt hatası: {str(e)}"}

        return {"status": "success", "message": "Gerçek verilere dayalı dinamik görevler oluşturuldu."}