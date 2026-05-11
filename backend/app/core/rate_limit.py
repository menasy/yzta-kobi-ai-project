# core/rate_limit.py
# Basit ve güvenli MVP rate limiting yardımcıları.
# Öncelik Redis sayaçlarıdır; Redis erişilemezse geçici in-memory fallback kullanılır.

import asyncio
import time
from collections import defaultdict

from fastapi import Request

from app.core.config import get_settings
from app.core.exceptions import RateLimitError
from app.core.logger import get_logger
from app.services.redis_service import redis_service

logger = get_logger(__name__)

_fallback_lock = asyncio.Lock()
_fallback_counters: dict[str, list[float]] = defaultdict(list)


def _resolve_subject(request: Request, user_id: int | None) -> str:
    """Rate limit için kullanıcı veya IP tabanlı anahtar üretir."""
    if user_id is not None:
        return f"user:{user_id}"

    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "unknown"
    return f"ip:{client_ip}"


async def _increment_fallback_counter(
    key: str,
    window_seconds: int,
) -> int:
    """Redis unavailable durumda process-local sayaç artırır."""
    now = time.monotonic()
    window_start = now - window_seconds

    async with _fallback_lock:
        current = _fallback_counters[key]
        current = [timestamp for timestamp in current if timestamp > window_start]
        current.append(now)
        _fallback_counters[key] = current
        return len(current)


async def enforce_chat_message_rate_limit(
    request: Request,
    *,
    user_id: int | None = None,
) -> None:
    """
    /api/chat/message endpoint'i için rate limit uygular.

    Kimliklendirme:
        - Auth varsa user_id
        - Yoksa IP fallback

    Not:
        In-memory fallback yalnızca tek process içinde tutarlıdır.
        Çok instance'lı production dağıtımında Redis zorunludur.
    """
    settings = get_settings()
    limit = settings.RATE_LIMIT_CHAT_MAX_REQUESTS
    window_seconds = settings.RATE_LIMIT_CHAT_WINDOW_SECONDS

    subject = _resolve_subject(request, user_id=user_id)
    key = f"rate-limit:chat-message:{subject}"

    try:
        count = await redis_service.incr_with_expire(key=key, expire=window_seconds)
    except Exception:
        logger.warning(
            "Redis rate limit kullanılamadı, in-memory fallback aktif.",
            extra={"subject_type": "user" if user_id is not None else "ip"},
            exc_info=True,
        )
        count = await _increment_fallback_counter(
            key=key,
            window_seconds=window_seconds,
        )

    if count > limit:
        raise RateLimitError(
            message=(
                f"İstek sınırı aşıldı. {window_seconds} saniyede en fazla "
                f"{limit} mesaj gönderebilirsiniz."
            )
        )
