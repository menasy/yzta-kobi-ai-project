# repositories/conversation_repository.py
# Conversation tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation

from .base import BaseRepository


class ConversationRepository(BaseRepository[Conversation]):
    """Conversation tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Conversation, session)

    async def get_by_session_id(self, session_id: str) -> Conversation | None:
        """Session ID'ye göre konuşma getirir."""
        result = await self.session.execute(
            select(Conversation).where(Conversation.session_id == session_id)
        )
        return result.scalar_one_or_none()

    async def get_active(
        self,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Conversation]:
        """Aktif konuşmaları listeler."""
        result = await self.session.execute(
            select(Conversation)
            .where(Conversation.status == "active")
            .offset(skip)
            .limit(limit)
            .order_by(Conversation.id.desc())
        )
        return list(result.scalars().all())

    async def get_by_customer(
        self,
        customer_id: int,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Conversation]:
        """Müşteriye ait konuşmaları listeler."""
        result = await self.session.execute(
            select(Conversation)
            .where(Conversation.customer_id == customer_id)
            .offset(skip)
            .limit(limit)
            .order_by(Conversation.id.desc())
        )
        return list(result.scalars().all())
