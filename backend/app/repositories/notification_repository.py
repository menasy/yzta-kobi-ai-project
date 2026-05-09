# repositories/notification_repository.py
# Notification tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification

from .base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    """Notification tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Notification, session)

    async def get_unread(
        self,
        *,
        user_id: int | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Notification]:
        """Okunmamış bildirimleri getirir. user_id verilirse filtreler."""
        stmt = (
            select(Notification)
            .where(Notification.status == "unread")
        )
        if user_id is not None:
            stmt = stmt.where(Notification.user_id == user_id)
        stmt = stmt.offset(skip).limit(limit).order_by(Notification.id.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_user(
        self,
        user_id: int,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Notification]:
        """Kullanıcıya ait bildirimleri getirir."""
        result = await self.session.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(Notification.id.desc())
        )
        return list(result.scalars().all())

    async def count_unread(self, user_id: int | None = None) -> int:
        """Okunmamış bildirim sayısını döndürür."""
        stmt = (
            select(func.count())
            .select_from(Notification)
            .where(Notification.status == "unread")
        )
        if user_id is not None:
            stmt = stmt.where(Notification.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def get_by_type(
        self,
        notification_type: str,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Notification]:
        """Tipe göre bildirimleri getirir."""
        result = await self.session.execute(
            select(Notification)
            .where(Notification.type == notification_type)
            .offset(skip)
            .limit(limit)
            .order_by(Notification.id.desc())
        )
        return list(result.scalars().all())
