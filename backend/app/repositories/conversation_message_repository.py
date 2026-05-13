# repositories/conversation_message_repository.py
# ConversationMessage tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation_message import ConversationMessage

from .base import BaseRepository


class ConversationMessageRepository(BaseRepository[ConversationMessage]):
    """ConversationMessage tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(ConversationMessage, session)

    async def list_for_conversation(
        self,
        conversation_id: int,
        *,
        skip: int = 0,
        limit: int = 500,
    ) -> list[ConversationMessage]:
        """Konuşmaya ait mesajları kronolojik sırayla getirir."""
        result = await self.session.execute(
            select(ConversationMessage)
            .where(ConversationMessage.conversation_id == conversation_id)
            .order_by(ConversationMessage.created_at.asc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def add(
        self,
        conversation_id: int,
        user_id: int,
        role: str,
        content: str,
    ) -> ConversationMessage:
        """Yeni mesaj ekler."""
        return await self.create({
            "conversation_id": conversation_id,
            "user_id": user_id,
            "role": role,
            "content": content,
        })

    async def count_for_conversation(self, conversation_id: int) -> int:
        """Konuşmadaki mesaj sayısını döner."""
        result = await self.session.execute(
            select(func.count())
            .select_from(ConversationMessage)
            .where(ConversationMessage.conversation_id == conversation_id)
        )
        return result.scalar_one()

    async def get_last_messages(
        self,
        conversation_id: int,
        count: int = 10,
    ) -> list[ConversationMessage]:
        """Konuşmanın son N mesajını getirir (Redis hydrate için)."""
        result = await self.session.execute(
            select(ConversationMessage)
            .where(ConversationMessage.conversation_id == conversation_id)
            .order_by(ConversationMessage.created_at.desc())
            .limit(count)
        )
        messages = list(result.scalars().all())
        messages.reverse()  # Kronolojik sıraya çevir
        return messages

    async def delete_for_conversation(self, conversation_id: int) -> int:
        """Konuşmaya ait tüm mesajları siler. Silinen kayıt sayısını döner."""
        result = await self.session.execute(
            delete(ConversationMessage)
            .where(ConversationMessage.conversation_id == conversation_id)
        )
        return result.rowcount
