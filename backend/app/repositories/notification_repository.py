# Notification tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import Integer as SqlInteger, and_, cast, select, update
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification

from .base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    """Notification tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Notification, session)

    async def create_notification(self, data: dict[str, Any]) -> Notification:
        """Yeni bildirim kaydı oluşturur."""
        return await self.create(data)

    async def get_by_id(self, notification_id: int) -> Notification | None:
        """ID ile bildirim kaydı getirir."""
        result = await self.session.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        return result.scalar_one_or_none()

    async def list_notifications(
        self,
        *,
        skip: int = 0,
        limit: int = 50,
        is_read: bool | None = None,
        notification_type: str | None = None,
        severity: str | None = None,
    ) -> list[Notification]:
        """Bildirimleri sayfalı listeler."""
        stmt = select(Notification)
        if is_read is not None:
            stmt = stmt.where(Notification.is_read.is_(is_read))
        if notification_type is not None:
            stmt = stmt.where(Notification.type == notification_type)
        if severity is not None:
            stmt = stmt.where(Notification.severity == severity)
        stmt = (
            stmt.offset(skip)
            .limit(limit)
            .order_by(Notification.created_at.desc(), Notification.id.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_unread_notifications(
        self,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Notification]:
        """Okunmamış bildirimleri sayfalı listeler."""
        result = await self.session.execute(
            select(Notification)
            .where(Notification.is_read.is_(False))
            .offset(skip)
            .limit(limit)
            .order_by(Notification.created_at.desc(), Notification.id.desc())
        )
        return list(result.scalars().all())

    async def mark_as_read(self, notification_id: int) -> Notification | None:
        """Tek bildirimi okundu olarak işaretler."""
        notification = await self.get_by_id(notification_id)
        if notification is None:
            return None

        now = datetime.now(tz=timezone.utc)
        notification.is_read = True
        notification.read_at = notification.read_at or now
        await self.session.flush()
        await self.session.refresh(notification)
        return notification

    async def mark_all_as_read(self) -> int:
        """Tüm okunmamış bildirimleri okundu olarak işaretler."""
        result = await self.session.execute(
            update(Notification)
            .where(Notification.is_read.is_(False))
            .values(is_read=True, read_at=datetime.now(tz=timezone.utc))
        )
        await self.session.flush()
        return int(result.rowcount or 0)

    async def has_recent_unread_for_product(
        self,
        product_id: int,
        *,
        notification_type: str = "LOW_STOCK_ALERT",
        hours: int = 1,
    ) -> bool:
        """
        Belirli bir ürün için son N saat içinde okunmamış bildirim var mı kontrol eder.

        Duplicate notification üretimini önlemek için kullanılır.
        payload JSONB alanındaki product_id değerine göre kontrol yapar.
        """
        since = datetime.now(tz=timezone.utc) - timedelta(hours=hours)
        result = await self.session.execute(
            select(Notification.id)
            .where(
                and_(
                    Notification.type == notification_type,
                    Notification.is_read.is_(False),
                    Notification.created_at >= since,
                    cast(
                        Notification.payload["product_id"].as_string(),
                        SqlInteger,
                    )
                    == product_id,
                )
            )
            .limit(1)
        )
        return result.scalar_one_or_none() is not None
    

    async def has_recent_unread_for_shipment(
        self,
        shipment_id: int,
        *,
        notification_type: str = "SHIPMENT_DELAY",
        hours: int = 1,
    ) -> bool:
        """
        Belirli bir kargo için son N saat içinde okunmamış bildirim var mı kontrol eder.
        
        payload JSONB alanındaki shipment_id değerine göre kontrol yapar.
        """
        since = datetime.now(tz=timezone.utc) - timedelta(hours=hours)
        result = await self.session.execute(
            select(Notification.id)
            .where(
                and_(
                    Notification.type == notification_type,
                    Notification.is_read.is_(False),
                    Notification.created_at >= since,
                    cast(
                        Notification.payload["shipment_id"].as_string(),
                        SqlInteger,
                    )
                    == shipment_id,
                )
            )
            .limit(1)
        )
        return result.scalar_one_or_none() is not None

