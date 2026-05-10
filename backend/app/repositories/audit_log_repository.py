# repositories/audit_log_repository.py
# AuditLog tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog

from .base import BaseRepository


class AuditLogRepository(BaseRepository[AuditLog]):
    """AuditLog tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(AuditLog, session)

    async def get_by_entity(
        self,
        entity_type: str,
        entity_id: str,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[AuditLog]:
        """Entity türü ve ID'sine göre logları getirir."""
        result = await self.session.execute(
            select(AuditLog)
            .where(
                AuditLog.entity_type == entity_type,
                AuditLog.entity_id == entity_id,
            )
            .offset(skip)
            .limit(limit)
            .order_by(AuditLog.id.desc())
        )
        return list(result.scalars().all())

    async def get_by_user(
        self,
        user_id: int,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[AuditLog]:
        """Kullanıcıya ait audit loglarını getirir."""
        result = await self.session.execute(
            select(AuditLog)
            .where(AuditLog.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(AuditLog.id.desc())
        )
        return list(result.scalars().all())

    async def get_by_action(
        self,
        action: str,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[AuditLog]:
        """İşlem tipine göre logları getirir."""
        result = await self.session.execute(
            select(AuditLog)
            .where(AuditLog.action == action)
            .offset(skip)
            .limit(limit)
            .order_by(AuditLog.id.desc())
        )
        return list(result.scalars().all())
