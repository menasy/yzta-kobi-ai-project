# api/endpoints/notifications.py
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
        401: {
            "description": "Yetkisiz erişim.",
            "content": {
                "application/json": {
                    "example": openapi_examples.UNAUTHORIZED_RESPONSE
                }
            },
        },
        403: {
            "description": "Admin yetkisi gerekli.",
            "content": {
                "application/json": {
                    "example": openapi_examples.FORBIDDEN_RESPONSE
                }
            },
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {
                "application/json": {
                    "example": openapi_examples.INTERNAL_ERROR_RESPONSE
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
    """
    Tüm bildirimleri sayfalı olarak listeler.

    - Admin cookie auth gerektirir.
    - Varsayılan sıralama: en yeni → en eski.
    """
    notifications = await service.list_notifications(skip=skip, limit=limit)
    return success_response(
        data=notifications,
        message="Bildirimler listelendi.",
    )


# ── GET /notifications/unread ────────────────────────────


@router.get(
    "/unread",
    response_model=None,
    summary="Okunmamış bildirimleri listele",
    responses={
        200: {
            "description": "Okunmamış bildirimler başarıyla listelendi.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        data=[openapi_examples.NOTIFICATION_LIST_ITEM_EXAMPLE],
                        message="Okunmamış bildirimler listelendi.",
                    )
                }
            },
        },
        401: {
            "description": "Yetkisiz erişim.",
            "content": {
                "application/json": {
                    "example": openapi_examples.UNAUTHORIZED_RESPONSE
                }
            },
        },
        403: {
            "description": "Admin yetkisi gerekli.",
            "content": {
                "application/json": {
                    "example": openapi_examples.FORBIDDEN_RESPONSE
                }
            },
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {
                "application/json": {
                    "example": openapi_examples.INTERNAL_ERROR_RESPONSE
                }
            },
        },
    },
)
async def list_unread_notifications(
    admin: AdminUser,
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(50, ge=1, le=100, description="Sayfa başına kayıt"),
    service: NotificationService = Depends(get_notification_service),
):
    """
    Okunmamış bildirimleri sayfalı olarak listeler.

    - Admin cookie auth gerektirir.
    """
    notifications = await service.list_unread(skip=skip, limit=limit)
    return success_response(
        data=notifications,
        message="Okunmamış bildirimler listelendi.",
    )


# ── PATCH /notifications/{notification_id}/read ──────────


@router.patch(
    "/{notification_id}/read",
    response_model=None,
    summary="Bildirimi okundu işaretle",
    responses={
        200: {
            "description": "Bildirim okundu olarak işaretlendi.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        data=openapi_examples.NOTIFICATION_MARK_READ_EXAMPLE,
                        message="Bildirim okundu olarak işaretlendi.",
                    )
                }
            },
        },
        404: {
            "description": "Bildirim bulunamadı.",
            "content": {
                "application/json": {
                    "example": openapi_examples.NOT_FOUND_RESPONSE
                }
            },
        },
        401: {
            "description": "Yetkisiz erişim.",
            "content": {
                "application/json": {
                    "example": openapi_examples.UNAUTHORIZED_RESPONSE
                }
            },
        },
        403: {
            "description": "Admin yetkisi gerekli.",
            "content": {
                "application/json": {
                    "example": openapi_examples.FORBIDDEN_RESPONSE
                }
            },
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {
                "application/json": {
                    "example": openapi_examples.INTERNAL_ERROR_RESPONSE
                }
            },
        },
    },
)
async def mark_notification_read(
    notification_id: int,
    admin: AdminUser,
    service: NotificationService = Depends(get_notification_service),
):
    """
    Tek bir bildirimi okundu olarak işaretler.

    - Admin cookie auth gerektirir.
    - Bildirim bulunamazsa 404 döner.
    """
    notification = await service.mark_read(notification_id)
    return success_response(
        data=notification,
        message="Bildirim okundu olarak işaretlendi.",
    )


# ── PATCH /notifications/read-all ────────────────────────


@router.patch(
    "/read-all",
    response_model=None,
    summary="Tüm bildirimleri okundu işaretle",
    responses={
        200: {
            "description": "Tüm okunmamış bildirimler okundu olarak işaretlendi.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        data={"updated_count": 5},
                        message="5 bildirim okundu olarak işaretlendi.",
                    )
                }
            },
        },
        401: {
            "description": "Yetkisiz erişim.",
            "content": {
                "application/json": {
                    "example": openapi_examples.UNAUTHORIZED_RESPONSE
                }
            },
        },
        403: {
            "description": "Admin yetkisi gerekli.",
            "content": {
                "application/json": {
                    "example": openapi_examples.FORBIDDEN_RESPONSE
                }
            },
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {
                "application/json": {
                    "example": openapi_examples.INTERNAL_ERROR_RESPONSE
                }
            },
        },
    },
)
async def mark_all_notifications_read(
    admin: AdminUser,
    service: NotificationService = Depends(get_notification_service),
):
    """
    Tüm okunmamış bildirimleri okundu olarak işaretler.

    - Admin cookie auth gerektirir.
    - Güncellenen bildirim sayısını döndürür.
    """
    count = await service.mark_all_read()
    return success_response(
        data={"updated_count": count},
        message=f"{count} bildirim okundu olarak işaretlendi.",
    )


# ── GET /notifications/stream (SSE) ─────────────────────


@router.get(
    "/stream",
    response_model=None,
    summary="Canlı bildirim akışı (SSE)",
    responses={
        200: {
            "description": "Server-Sent Events stream başlatıldı.",
            "content": {"text/event-stream": {}},
        },
        401: {
            "description": "Yetkisiz erişim.",
            "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}},
        },
        403: {
            "description": "Admin yetkisi gerekli.",
            "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}},
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}},
        },
    },
)
async def notification_stream(
    admin: AdminUser,
):
    """
    Redis Pub/Sub üzerinden canlı bildirim event'lerini SSE formatında stream eder.

    - Admin cookie auth gerektirir.
    - Client disconnect olduğunda Redis subscription temiz kapatılır.
    - 30 saniyede bir keep-alive ping gönderilir.
    - Event loop'u bloklamamak için asyncio.wait_for kullanılır.
    """

    async def event_generator():
        settings = get_settings()
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        pubsub = client.pubsub()

        try:
            await pubsub.subscribe(NOTIFICATION_CHANNEL)
            logger.info("SSE stream başlatıldı — Pub/Sub dinleniyor.")

            while True:
                try:
                    # Non-blocking: 1 saniye timeout ile mesaj bekle
                    message = await asyncio.wait_for(
                        pubsub.get_message(
                            ignore_subscribe_messages=True, timeout=1.0
                        ),
                        timeout=2.0,
                    )
                except asyncio.TimeoutError:
                    # Timeout → keep-alive ping gönder
                    yield ": ping\n\n"
                    continue

                if message is not None and message["type"] == "message":
                    data = message["data"]
                    yield f"event: notification\ndata: {data}\n\n"
                else:
                    # Mesaj yok veya subscribe/unsubscribe mesajı — keep-alive
                    yield ": ping\n\n"

                # Keep-alive aralığını yönetmek için kısa uyku
                await asyncio.sleep(0.1)

        except asyncio.CancelledError:
            logger.info("SSE stream client tarafından kapatıldı.")
        except Exception:
            logger.error("SSE stream hatası.", exc_info=True)
        finally:
            # Temiz cleanup: subscription kapat, bağlantıyı kapat
            await pubsub.unsubscribe(NOTIFICATION_CHANNEL)
            await pubsub.aclose()
            await client.aclose()
            logger.info("SSE stream kaynakları temiz kapatıldı.")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
