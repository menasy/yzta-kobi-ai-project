# Bildirim yönetimi ve SSE stream endpoint'leri.
# Tüm endpoint'ler AdminUser ile korunur (yönetim paneli/operasyon).
# Business logic NotificationService'de — burada sadece routing ve response.

import asyncio
import json

import redis.asyncio as redis
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse

from app.core.config import get_settings
from app.core.dependencies import AdminUser, get_notification_service
from app.core.logger import get_logger
from app.core.response_builder import success_response
from app.core import openapi_examples
from app.services.notification_publisher import NOTIFICATION_CHANNEL
from app.services.notification_service import NotificationService

logger = get_logger(__name__)

router = APIRouter()


# ── GET /notifications ───────────────────────────────────

@router.get(
    "/",
    response_model=None,
    summary="Tüm bildirimleri listele",
    responses={
        200: {
            "description": "Bildirimler başarıyla listelendi.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        data=[openapi_examples.NOTIFICATION_LIST_ITEM_EXAMPLE],
                        message="Bildirimler listelendi.",
                    )
                }
            },
        },
    },
)
async def list_notifications(
    admin: AdminUser,
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(50, ge=1, le=100, description="Sayfa başına kayıt"),
    service: NotificationService = Depends(get_notification_service),
):
    notifications = await service.list_notifications(skip=skip, limit=limit)
    return success_response(data=notifications, message="Bildirimler listelendi.")


# ── GET /notifications/unread ────────────────────────────

@router.get(
    "/unread",
    response_model=None,
    summary="Okunmamış bildirimleri listele",
)
async def list_unread_notifications(
    admin: AdminUser,
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(50, ge=1, le=100, description="Sayfa başına kayıt"),
    service: NotificationService = Depends(get_notification_service),
):
    notifications = await service.list_unread(skip=skip, limit=limit)
    return success_response(data=notifications, message="Okunmamış bildirimler listelendi.")


# ── PATCH /notifications/{notification_id}/read ──────────

@router.patch("/{notification_id}/read", summary="Bildirimi okundu işaretle")
async def mark_notification_read(
    notification_id: int,
    admin: AdminUser,
    service: NotificationService = Depends(get_notification_service),
):
    notification = await service.mark_read(notification_id)
    return success_response(data=notification, message="Bildirim okundu olarak işaretlendi.")


# ── PATCH /notifications/read-all ────────────────────────

@router.patch("/read-all", summary="Tüm bildirimleri okundu işaretle")
async def mark_all_notifications_read(
    admin: AdminUser,
    service: NotificationService = Depends(get_notification_service),
):
    count = await service.mark_all_read()
    return success_response(data={"updated_count": count}, message=f"{count} bildirim okundu.")


# ── GET /notifications/summary/delays ────────────────────

@router.get(
    "/summary/delays",
    summary="Günlük gecikme özeti getir"
)
async def get_delay_summary(
    admin: AdminUser,
    service: NotificationService = Depends(get_notification_service)
):
    """Admin paneli için son 24 saatin gecikme özetini metin olarak döner."""
    summary_text = await service.get_daily_delay_summary()
    return success_response(
        data={"summary": summary_text},
        message="Özet rapor hazırlandı."
    )


# ── GET /notifications/stream (SSE) ─────────────────────

@router.get(
    "/stream",
    response_model=None,
    summary="Canlı bildirim akışı (SSE)",
)
async def notification_stream(
    admin: AdminUser,
    service: NotificationService = Depends(get_notification_service)
):
    async def event_generator():
        settings = get_settings()
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        pubsub = client.pubsub()

        try:
            await pubsub.subscribe(NOTIFICATION_CHANNEL)
            logger.info("SSE stream başlatıldı.")

            while True:
                try:
                    message = await asyncio.wait_for(
                        pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0),
                        timeout=2.0,
                    )
                except asyncio.TimeoutError:
                    yield ": ping\n\n"
                    continue

                if message is not None and message["type"] == "message":
                    data = json.loads(message["data"])
                    
                    # 1. Bildirimi gönder
                    yield f"event: notification\ndata: {json.dumps(data)}\n\n"

                    # 2. Anlık özet güncellemesi
                    summary_text = await service.get_daily_delay_summary()
                    summary_payload = {"summary": summary_text}
                    yield f"event: summary_update\ndata: {json.dumps(summary_payload)}\n\n"

                await asyncio.sleep(0.1)

        except asyncio.CancelledError:
            logger.info("SSE stream kapatıldı.")
        except Exception:
            logger.error("SSE stream hatası.", exc_info=True)
        finally:
            await pubsub.unsubscribe(NOTIFICATION_CHANNEL)
            await pubsub.aclose()
            await client.aclose()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )