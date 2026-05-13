"""Redis tabanlı PendingAction store."""

from datetime import UTC, datetime
import json

from app.core.config import get_settings
from app.core.exceptions import ExternalServiceError, ForbiddenError, NotFoundError
from app.core.logger import get_logger
from app.services.redis_service import redis_service

from .action_types import PendingActionStatus
from .schemas import PendingAction

logger = get_logger(__name__)

KEY_PREFIX = "agent:pending_action"


class PendingActionStore:
    """User/session scoped pending action Redis erişimi."""

    def __init__(self, ttl_seconds: int | None = None) -> None:
        settings = get_settings()
        self._ttl_seconds = ttl_seconds or settings.AI_PENDING_ACTION_TTL_SECONDS

    def _key(self, user_id: int, session_id: str, action_id: str) -> str:
        return f"{KEY_PREFIX}:{user_id}:{session_id}:{action_id}"

    def _pattern(self, user_id: int, session_id: str) -> str:
        return f"{KEY_PREFIX}:{user_id}:{session_id}:*"

    async def create(self, action: PendingAction) -> PendingAction:
        """Pending action kaydını Redis'e yazar."""
        try:
            await redis_service.set_value(
                self._key(action.user_id, action.session_id, action.action_id),
                json.dumps(action.model_dump(mode="json"), ensure_ascii=False),
                expire=self._ttl_seconds,
            )
            logger.info(
                "Pending action oluşturuldu.",
                extra={
                    "action_id": action.action_id,
                    "action_type": action.action_type,
                    "user_id": action.user_id,
                    "session_id": action.session_id,
                },
            )
            return action
        except Exception as exc:
            logger.error("Pending action Redis yazma hatası: %s", str(exc), exc_info=True)
            raise ExternalServiceError(message="Onay bekleyen aksiyon kaydedilemedi.") from exc

    async def get(self, user_id: int, session_id: str, action_id: str) -> PendingAction:
        """Action kaydını user/session ownership ile getirir."""
        try:
            raw = await redis_service.get_value(self._key(user_id, session_id, action_id))
        except Exception as exc:
            logger.error("Pending action Redis okuma hatası: %s", str(exc), exc_info=True)
            raise ExternalServiceError(message="Onay bekleyen aksiyon okunamadı.") from exc

        if raw is None:
            raise NotFoundError(message="Onay bekleyen aksiyon bulunamadı veya süresi doldu.")

        action = PendingAction.model_validate(json.loads(raw))
        self._ensure_owner(action, user_id=user_id, session_id=session_id)
        if action.status == PendingActionStatus.PENDING and action.is_expired():
            action.status = PendingActionStatus.EXPIRED
            await self.save(action, expire=300)
            logger.info(
                "Pending action süresi doldu.",
                extra={"action_id": action.action_id, "user_id": user_id},
            )
        return action

    async def save(self, action: PendingAction, *, expire: int | None = None) -> None:
        """Action kaydını günceller."""
        try:
            await redis_service.set_value(
                self._key(action.user_id, action.session_id, action.action_id),
                json.dumps(action.model_dump(mode="json"), ensure_ascii=False),
                expire=expire or self._ttl_seconds,
            )
        except Exception as exc:
            logger.error("Pending action Redis güncelleme hatası: %s", str(exc), exc_info=True)
            raise ExternalServiceError(message="Onay bekleyen aksiyon güncellenemedi.") from exc

    async def list_for_session(
        self,
        user_id: int,
        session_id: str,
        *,
        pending_only: bool = True,
    ) -> list[PendingAction]:
        """Sadece current user/session kapsamındaki action'ları listeler."""
        try:
            keys = await redis_service.list_keys(self._pattern(user_id, session_id))
            actions: list[PendingAction] = []
            for key in keys:
                raw = await redis_service.get_value(key)
                if raw is None:
                    continue
                action = PendingAction.model_validate(json.loads(raw))
                self._ensure_owner(action, user_id=user_id, session_id=session_id)
                if action.status == PendingActionStatus.PENDING and action.is_expired():
                    action.status = PendingActionStatus.EXPIRED
                    await self.save(action, expire=300)
                if pending_only and action.status != PendingActionStatus.PENDING:
                    continue
                actions.append(action)
        except (ExternalServiceError, ForbiddenError):
            raise
        except Exception as exc:
            logger.error("Pending action Redis listeleme hatası: %s", str(exc), exc_info=True)
            raise ExternalServiceError(message="Onay bekleyen aksiyonlar listelenemedi.") from exc

        return sorted(actions, key=lambda item: item.created_at, reverse=True)

    async def get_latest_pending(self, user_id: int, session_id: str) -> PendingAction:
        """Current user/session için en yeni pending action'ı döndürür."""
        actions = await self.list_for_session(user_id, session_id, pending_only=True)
        if not actions:
            raise NotFoundError(message="Onay bekleyen aksiyon bulunamadı.")
        return actions[0]

    async def mark_executed(self, action: PendingAction) -> PendingAction:
        """Action status değerini executed yapar."""
        action.status = PendingActionStatus.EXECUTED
        await self.save(action, expire=300)
        logger.info(
            "Pending action executed olarak işaretlendi.",
            extra={"action_id": action.action_id, "action_type": action.action_type},
        )
        return action

    async def cancel(self, user_id: int, session_id: str, action_id: str) -> PendingAction:
        """Pending action'ı iptal eder."""
        action = await self.get(user_id, session_id, action_id)
        if action.status != PendingActionStatus.PENDING:
            return action
        action.status = PendingActionStatus.CANCELLED
        await self.save(action, expire=300)
        logger.info(
            "Pending action iptal edildi.",
            extra={"action_id": action.action_id, "user_id": user_id},
        )
        return action

    @staticmethod
    def _ensure_owner(action: PendingAction, *, user_id: int, session_id: str) -> None:
        if action.user_id != user_id or action.session_id != session_id:
            logger.warning(
                "Pending action ownership ihlali.",
                extra={"action_id": action.action_id, "requested_user_id": user_id},
            )
            raise ForbiddenError(message="Bu aksiyona erişim yetkiniz yok.")
