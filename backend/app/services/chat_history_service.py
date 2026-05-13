# services/chat_history_service.py
# Kalıcı sohbet geçmişi service katmanı.
# Conversation CRUD, mesaj persistence ve ownership kontrolü.
# Redis kısa süreli LLM memory + PostgreSQL kalıcı geçmiş uyumlu çalışır.

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.memory import ConversationMemory
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.logger import get_logger
from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage
from app.repositories.conversation_message_repository import ConversationMessageRepository
from app.repositories.conversation_repository import ConversationRepository

logger = get_logger(__name__)


class ConversationService:
    """
    Kalıcı sohbet geçmişi servisi.

    Sorumluluklar:
        - Yeni conversation başlatma
        - Kullanıcının kendi conversation listesini döndürme
        - Conversation + mesajlarını döndürme
        - Conversation silme (soft delete + Redis temizliği)
        - Mesaj kaydetme (user + assistant)
        - Conversation başlığı otomatik üretme
        - Redis memory hydrate (TTL dolduğunda)
        - Ownership kontrolleri tüm metodlarda zorunlu
    """

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._conv_repo = ConversationRepository(db)
        self._msg_repo = ConversationMessageRepository(db)
        self._memory = ConversationMemory()

    # ── Conversation CRUD ────────────────────────────────

    async def create_conversation(
        self,
        user_id: int,
        title: str | None = None,
    ) -> Conversation:
        """Yeni sohbet oluşturur."""
        import uuid
        session_id = str(uuid.uuid4())

        conv = await self._conv_repo.create({
            "session_id": session_id,
            "user_id": user_id,
            "title": title or "Yeni Sohbet",
            "status": "active",
            "message_count": 0,
        })
        logger.info("Yeni conversation oluşturuldu: %s (user=%d)", session_id, user_id)
        return conv

    async def list_conversations(
        self,
        user_id: int,
        *,
        skip: int = 0,
        limit: int = 30,
    ) -> list[Conversation]:
        """Kullanıcının sohbet listesini döndürür."""
        return await self._conv_repo.list_for_user(user_id, skip=skip, limit=limit)

    async def get_conversation_with_messages(
        self,
        session_id: str,
        user_id: int,
    ) -> dict:
        """
        Konuşma detayını ve mesajlarını döndürür.
        Ownership kontrolü yapılır.

        Returns:
            {"conversation": Conversation, "messages": list[ConversationMessage]}

        Raises:
            NotFoundError: Konuşma bulunamadı veya kullanıcıya ait değil.
        """
        conv = await self._conv_repo.get_by_session_id_for_user(session_id, user_id)
        if conv is None:
            raise NotFoundError(message="Sohbet bulunamadı.")

        messages = await self._msg_repo.list_for_conversation(conv.id)

        return {
            "conversation": conv,
            "messages": messages,
        }

    async def delete_conversation(
        self,
        session_id: str,
        user_id: int,
    ) -> None:
        """
        Sohbeti soft delete eder ve Redis memory'yi temizler.

        Raises:
            NotFoundError: Konuşma bulunamadı veya kullanıcıya ait değil.
        """
        deleted = await self._conv_repo.soft_delete_for_user(session_id, user_id)
        if not deleted:
            raise NotFoundError(message="Sohbet bulunamadı.")

        # Redis memory temizle
        try:
            await self._memory.clear_for_user(session_id, user_id)
        except Exception:
            logger.warning("Redis memory temizlenirken hata (session=%s)", session_id)

        logger.info("Conversation silindi: %s (user=%d)", session_id, user_id)

    # ── Mesaj Persistence ────────────────────────────────

    async def ensure_conversation(
        self,
        session_id: str,
        user_id: int,
        first_message: str | None = None,
    ) -> Conversation:
        """
        Session ID'ye ait conversation varsa döndürür, yoksa oluşturur.
        İlk mesajdan otomatik başlık üretir.
        Ownership kontrolü yapılır.

        Raises:
            ForbiddenError: Conversation başka kullanıcıya ait.
        """
        # Önce session_id ile herhangi bir conversation var mı kontrol et
        existing = await self._conv_repo.get_by_session_id(session_id)

        if existing is not None:
            if existing.deleted_at is not None:
                raise NotFoundError(message="Sohbet bulunamadı.")

            # Ownership kontrolü
            if existing.user_id is not None and existing.user_id != user_id:
                raise ForbiddenError(message="Bu sohbete erişim yetkiniz yok.")

            # Eğer user_id henüz atanmamışsa (eski kayıt), sahipliği ata
            if existing.user_id is None:
                existing.user_id = user_id
                await self._db.flush()

            return existing

        # Yeni conversation oluştur
        title = self._generate_title(first_message) if first_message else "Yeni Sohbet"
        conv = await self._conv_repo.create({
            "session_id": session_id,
            "user_id": user_id,
            "title": title,
            "status": "active",
            "message_count": 0,
        })
        logger.info("Yeni conversation (ensure): %s (user=%d)", session_id, user_id)
        return conv

    async def persist_message(
        self,
        conversation_id: int,
        user_id: int,
        role: str,
        content: str,
        metadata_: dict | None = None,
    ) -> ConversationMessage:
        """Mesajı PostgreSQL'e kaydeder ve conversation özetini günceller."""
        # Note: _msg_repo.add must be updated or we can just create the object here. Wait! Let me check ConversationMessageRepository
        msg = await self._msg_repo.add(conversation_id, user_id, role, content, metadata_=metadata_)

        # Conversation özet bilgilerini güncelle
        count = await self._msg_repo.count_for_conversation(conversation_id)
        preview = content[:200] + "..." if len(content) > 200 else content
        now = datetime.now(timezone.utc)

        await self._conv_repo.update_summary(
            conversation_id,
            last_message_preview=preview,
            message_count=count,
            last_message_at=now,
        )

        return msg

    async def update_conversation_title(
        self,
        conversation_id: int,
        title: str,
    ) -> None:
        """Conversation başlığını günceller (ilk mesajdan sonra)."""
        await self._conv_repo.update_summary(conversation_id, title=title)

    # ── Redis Memory Hydrate ─────────────────────────────

    async def hydrate_redis_memory(
        self,
        session_id: str,
        user_id: int,
    ) -> None:
        """
        Redis memory boşsa PostgreSQL'den son N mesajı yükler.
        Eski sohbete dönüldüğünde Redis TTL dolmuş olabilir.
        """
        # Redis'te zaten veri var mı kontrol et
        existing = await self._memory.load_for_user(session_id, user_id)
        if existing:
            return

        # PostgreSQL'den conversation ve mesajları al
        conv = await self._conv_repo.get_by_session_id_for_user(session_id, user_id)
        if conv is None:
            return

        messages = await self._msg_repo.get_last_messages(conv.id, count=10)
        if not messages:
            return

        # Redis'e yükle
        history = [
            {"role": m.role, "content": m.content, "metadata": getattr(m, "metadata_", None)}
            for m in messages
            if m.role in ("user", "assistant")
        ]
        await self._memory.save_for_user(session_id, user_id, history)
        logger.debug("Redis memory hydrate edildi: %s (%d mesaj)", session_id, len(history))

    # ── Helpers ──────────────────────────────────────────

    @staticmethod
    def _generate_title(content: str) -> str:
        """İlk kullanıcı mesajından deterministik başlık üretir."""
        if not content:
            return "Yeni Sohbet"

        # İlk satırı al, 50 karakterle sınırla
        first_line = content.strip().split("\n")[0]
        if len(first_line) > 50:
            return first_line[:47] + "..."
        return first_line