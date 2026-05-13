# backend/app/api/endpoints/notifications.py

import asyncio
import json
import redis.asyncio as redis
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import get_settings
from app.core.dependencies import AdminUser, get_notification_service
from app.core.logger import get_logger
from app.core.response_builder import success_response
from app.core import openapi_examples, openapi_responses
from app.mappers.notification_mapper import (
    to_notification_list_items,
    to_notification_mark_read_response,
)
from app.services.notification_publisher import NOTIFICATION_CHANNEL
from app.services.notification_service import NotificationService
from app.models.notification import Notification

logger = get_logger(__name__)

router = APIRouter()

# ── 1. GÜNLÜK ÖZET ENDPOINT'İ ───────────────────────────

@router.get(
    "/daily-summary",
    summary="Günlük gecikme özeti getir",
    responses={
        200: {
            "description": "Özet rapor hazırlandı.",
            "content": openapi_examples.example_content(
                data={"summary": "Bugun 2 kargo gecikmesi tespit edildi."},
                message="Özet rapor hazırlandı.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def get_delay_summary(
    admin: AdminUser,
    service: NotificationService = Depends(get_notification_service)
):
    summary_text = await service.get_daily_delay_summary()
    return success_response(
        data={"summary": summary_text}, 
        message="Özet rapor hazırlandı."
    )

# ── 2. OKUNMAMIŞ BİLDİRİMLER ───────────────────────────

@router.get(
    "/unread",
    summary="Okunmamış bildirimleri listele",
    responses={
        200: {
            "description": "Okunmamış bildirimler listelendi.",
            "content": openapi_examples.example_content(
                data=[openapi_examples.NOTIFICATION_LIST_ITEM_EXAMPLE],
                message="Okunmamış bildirimler listelendi.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def list_unread_notifications(
    admin: AdminUser,
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(50, ge=1, le=100, description="Sayfa başına kayıt"),
    service: NotificationService = Depends(get_notification_service),
):
    notifications = await service.list_unread(skip=skip, limit=limit)
    return success_response(
        data=to_notification_list_items(notifications),
        message="Okunmamış bildirimler listelendi.",
    )

# ── 3. TÜM BİLDİRİMLERİ LİSTELE (ANA ENDPOINT) ─────────

@router.get(
    "/",
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
            }
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def list_notifications(
    admin: AdminUser,
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(50, ge=1, le=100, description="Sayfa başına kayıt"),
    service: NotificationService = Depends(get_notification_service),
):
    """
    Sistemdeki tüm bildirimleri tarih sırasına göre listeler.
    JSON Serializable hatası giderilmiştir.
    """
    notifications = await service.list_notifications(skip=skip, limit=limit)
    return success_response(
        data=to_notification_list_items(notifications),
        message="Bildirimler listelendi.",
    )

# ── 4. CANLI AKIŞ (SSE) ────────────────────────────────

@router.get(
    "/stream",
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
                    yield f"event: notification\ndata: {json.dumps(data)}\n\n"
                    
                    summary_text = await service.get_daily_delay_summary()
                    yield f"event: summary_update\ndata: {json.dumps({'summary': summary_text})}\n\n"

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

# ── 5. GÜNCELLEME İŞLEMLERİ ─────────────────────────────

@router.patch(
    "/read-all",
    summary="Tüm bildirimleri okundu işaretle",
    responses={
        200: {
            "description": "Bildirimler okundu olarak işaretlendi.",
            "content": openapi_examples.example_content(
                data={"updated_count": 12},
                message="12 bildirim okundu.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def mark_all_notifications_read(
    admin: AdminUser,
    service: NotificationService = Depends(get_notification_service),
):
    count = await service.mark_all_read()
    return success_response(data={"updated_count": count}, message=f"{count} bildirim okundu.")


@router.patch(
    "/{notification_id}/read",
    summary="Bildirimi okundu işaretle",
    responses={
        200: {
            "description": "Bildirim okundu olarak işaretlendi.",
            "content": openapi_examples.example_content(
                data=openapi_examples.NOTIFICATION_MARK_READ_EXAMPLE,
                message="Bildirim okundu olarak işaretlendi.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.not_found_responses(description="Bildirim bulunamadı."),
        **openapi_responses.internal_error_response(),
    },
)
async def mark_notification_read(
    notification_id: int,
    admin: AdminUser,
    service: NotificationService = Depends(get_notification_service),
):
    notification = await service.mark_read(notification_id)
    return success_response(
        data=to_notification_mark_read_response(notification),
        message="Bildirim okundu olarak işaretlendi.",
    )
