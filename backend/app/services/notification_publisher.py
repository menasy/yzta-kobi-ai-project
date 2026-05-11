# services/notification_publisher.py
# Merkezi Redis Pub/Sub notification event publisher.
# Tüm notification event'leri bu modül üzerinden yayınlanır.
# Publish hatası ana iş akışını düşürmez; sadece güvenli şekilde loglanır.

import json
from typing import Any

import redis.asyncio as redis

from app.core.config import get_settings
from app.core.logger import get_logger

logger = get_logger(__name__)

# Sabit kanal adı — tüm notification event'leri buraya yayınlanır.
NOTIFICATION_CHANNEL = "notifications:events"


async def publish_notification_event(notification_data: dict[str, Any]) -> None:
    """
    Redis Pub/Sub üzerinden notification event yayınlar.

    Bu fonksiyon fail-safe tasarlanmıştır:
    - Redis bağlantı hatası veya publish hatası ana akışı bozmaz.
    - Hatalar logger ile güvenli şekilde loglanır.

    Args:
        notification_data: JSON serialize edilecek notification verisi.
    """
    client: redis.Redis | None = None
    try:
        settings = get_settings()
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        payload = json.dumps(notification_data, ensure_ascii=False, default=str)
        await client.publish(NOTIFICATION_CHANNEL, payload)
        logger.info(
            "Notification event yayınlandı.",
            extra={"channel": NOTIFICATION_CHANNEL},
        )
    except Exception:
        # Ana akışı düşürmemek için exception yutulur ve loglanır.
        logger.error(
            "Redis notification publish başarısız.",
            exc_info=True,
            extra={"channel": NOTIFICATION_CHANNEL},
        )
    finally:
        if client is not None:
            await client.aclose()
