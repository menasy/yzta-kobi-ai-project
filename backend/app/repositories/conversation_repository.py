# repositories/conversation_repository.py
# Conversation tablosuna özel DB sorguları.
# User-scoped sorgular ile ownership kontrolü sağlar.
# Sadece veri erişimi — iş mantığı yok.

from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation

from .base import BaseRepository


class ConversationRepository(BaseRepository[Conversation]):
    """Conversation tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Conversation, session)

    async def get_by_session_id(self, session_id: str) -> Conversation | None:
        """Session ID'ye göre konuşma getirir (backward compat)."""
        result = await self.session.execute(
            select(Conversation).where(Conversation.session_id == session_id)
        )
        return result.scalar_one_or_none()

    async def get_by_session_id_for_user(
        self, session_id: str, user_id: int
    ) -> Conversation | None:
        """User-scoped: Session ID'ye göre konuşma getirir.
        Sadece sahibi erişebilir, soft delete edilmişler hariç.
        """
        result = await self.session.execute(
            select(Conversation).where(
                Conversation.session_id == session_id,
                Conversation.user_id == user_id,
                Conversation.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def list_for_user(
        self,
        user_id: int,
        *,
        skip: int = 0,
        limit: int = 30,
    ) -> list[Conversation]:
        """Kullanıcıya ait aktif konuşmaları listeler (en yeni üstte)."""
        result = await self.session.execute(
            select(Conversation)
            .where(
                Conversation.user_id == user_id,
                Conversation.deleted_at.is_(None),
            )
            .order_by(Conversation.last_message_at.desc().nulls_last(), Conversation.id.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def update_summary(
        self,
        conversation_id: int,
        *,
        title: str | None = None,
        last_message_preview: str | None = None,
        message_count: int | None = None,
        last_message_at: datetime | None = None,
    ) -> Conversation | None:
        """Konuşma özet bilgilerini günceller."""
        data: dict = {}
        if title is not None:
            data["title"] = title
        if last_message_preview is not None:
            data["last_message_preview"] = last_message_preview
        if message_count is not None:
            data["message_count"] = message_count
        if last_message_at is not None:
            data["last_message_at"] = last_message_at

        if not data:
            return await self.get(conversation_id)

        return await self.update(conversation_id, data)

    async def soft_delete_for_user(
        self, session_id: str, user_id: int
    ) -> bool:
        """User-scoped soft delete. Başarılıysa True döner."""
        conv = await self.get_by_session_id_for_user(session_id, user_id)
        if conv is None:
            return False

        conv.deleted_at = datetime.now(tz=datetime.now().astimezone().tzinfo)
        conv.status = "deleted"
        await self.session.flush()
        return True

    # ── Backward compat metodlar ──────────────────────────

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
