# agent/memory.py
# Redis tabanlı konuşma hafızası.
# session_id bazlı mesaj geçmişi tutar.
# Son 10 mesajı saklar, TTL ile otomatik temizlenir.
# Hata durumunda sistemi düşürmez — boş liste döner.
# User-scoped key formatı ile güvenlik sağlar.

import json
from typing import Any

from app.core.config import get_settings
from app.core.logger import get_logger
from app.services.redis_service import redis_service

logger = get_logger(__name__)

# Sabit: Konuşma başına saklanacak maksimum mesaj sayısı
_MAX_MESSAGES = 10

# Redis key prefix
_KEY_PREFIX = "chat:"


class ConversationMemory:
    """
    Redis tabanlı konuşma hafızası.

    Her session_id için son N mesajı JSON olarak saklar.
    TTL ile eski konuşmalar otomatik temizlenir.

    Kullanım:
        memory = ConversationMemory()
        history = await memory.load("session-123")
        await memory.save("session-123", updated_history)
        await memory.clear("session-123")
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._ttl = settings.REDIS_CONVERSATION_TTL

    def _key(self, session_id: str) -> str:
        """Redis key oluşturur (backward compat)."""
        return f"{_KEY_PREFIX}{session_id}"

    def _user_key(self, session_id: str, user_id: int) -> str:
        """User-scoped Redis key oluşturur."""
        return f"{_KEY_PREFIX}user:{user_id}:session:{session_id}"

    # ── User-scoped metodlar ─────────────────────────────

    async def load_for_user(
        self, session_id: str, user_id: int
    ) -> list[dict[str, Any]]:
        """User-scoped: Konuşma geçmişini Redis'ten yükler."""
        try:
            raw = await redis_service.get_value(self._user_key(session_id, user_id))
            if raw is None:
                return []
            return json.loads(raw)
        except Exception as exc:
            logger.error(
                "Konuşma geçmişi yüklenirken hata: %s (session=%s, user=%d)",
                str(exc),
                session_id,
                user_id,
            )
            return []

    async def save_for_user(
        self,
        session_id: str,
        user_id: int,
        messages: list[dict[str, Any]],
    ) -> None:
        """User-scoped: Konuşma geçmişini Redis'e kaydeder."""
        try:
            trimmed = messages[-_MAX_MESSAGES:]
            await redis_service.set_value(
                self._user_key(session_id, user_id),
                json.dumps(trimmed, ensure_ascii=False),
                expire=self._ttl,
            )
        except Exception as exc:
            logger.error(
                "Konuşma geçmişi kaydedilirken hata: %s (session=%s, user=%d)",
                str(exc),
                session_id,
                user_id,
            )

    async def clear_for_user(self, session_id: str, user_id: int) -> None:
        """User-scoped: Konuşma geçmişini siler."""
        try:
            await redis_service.delete_value(self._user_key(session_id, user_id))
            # Eski format key de temizle (backward compat)
            await redis_service.delete_value(self._key(session_id))
            logger.info("Konuşma geçmişi silindi: %s (user=%d)", session_id, user_id)
        except Exception as exc:
            logger.error(
                "Konuşma geçmişi silinirken hata: %s (session=%s, user=%d)",
                str(exc),
                session_id,
                user_id,
            )

    # ── Backward compat metodlar ─────────────────────────

    async def load(self, session_id: str) -> list[dict[str, str]]:
        """
        Konuşma geçmişini Redis'ten yükler.

        Dönen format:
            [
                {"role": "user", "content": "128 numaralı siparişim nerede?"},
                {"role": "assistant", "content": "Siparişiniz kargoda..."},
            ]

        Hata durumunda boş liste döner — sistem düşmez.
        """
        try:
            raw = await redis_service.get_value(self._key(session_id))
            if raw is None:
                return []
            return json.loads(raw)
        except Exception as exc:
            logger.error(
                "Konuşma geçmişi yüklenirken hata: %s (session=%s)",
                str(exc),
                session_id,
            )
            return []

    async def save(
        self,
        session_id: str,
        messages: list[dict[str, str]],
    ) -> None:
        """
        Konuşma geçmişini Redis'e kaydeder.
        Son N mesajı tutar (FIFO trim).
        TTL ile otomatik temizlenir.

        Hata durumunda log yazar ama exception fırlatmaz.
        """
        try:
            # Son N mesajı tut
            trimmed = messages[-_MAX_MESSAGES:]
            await redis_service.set_value(
                self._key(session_id),
                json.dumps(trimmed, ensure_ascii=False),
                expire=self._ttl,
            )
        except Exception as exc:
            logger.error(
                "Konuşma geçmişi kaydedilirken hata: %s (session=%s)",
                str(exc),
                session_id,
            )

    async def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
    ) -> None:
        """
        Tek mesaj ekler — load → append → save kısayolu.
        """
        history = await self.load(session_id)
        history.append({"role": role, "content": content})
        await self.save(session_id, history)

    async def clear(self, session_id: str) -> None:
        """
        Konuşma geçmişini siler.
        Hata durumunda log yazar ama exception fırlatmaz.
        """
        try:
            await redis_service.delete_value(self._key(session_id))
            logger.info("Konuşma geçmişi silindi: %s", session_id)
        except Exception as exc:
            logger.error(
                "Konuşma geçmişi silinirken hata: %s (session=%s)",
                str(exc),
                session_id,
            )

    async def get_history(self, session_id: str) -> list[dict[str, Any]]:
        """
        Konuşma geçmişini döndürür — endpoint'ler için alias.
        """
        return await self.load(session_id)
