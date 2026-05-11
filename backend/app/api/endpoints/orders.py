# api/endpoints/orders.py
# Sipariş ve dashboard özet endpoint'leri (stub).
# Bu endpointler admin yetkisi gerektirir.

from fastapi import APIRouter

from app.core import openapi_examples
from app.core.dependencies import AdminUser
from app.core.response_builder import success_response

router = APIRouter()


@router.get(
    "/",
    response_model=None,
    summary="Siparişleri listele",
    responses={
        200: {
            "description": "Siparişler listelendi.",
            "content": openapi_examples.example_content(
                data=[],
                message="Siparişler listelendi.",
            ),
        },
        401: {"description": "Yetkisiz erişim.", "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}}},
        403: {"description": "Admin yetkisi gerekli.", "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}}},
        500: {"description": "Beklenmeyen sunucu hatası.", "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}}},
    },
)
async def list_orders(
    admin: AdminUser,
):
    return success_response(data=[], message="Siparişler listelendi.")


@router.get(
    "/summary/today",
    response_model=None,
    summary="Günlük dashboard özeti",
    responses={
        200: {
            "description": "Günlük özet hazır.",
            "content": openapi_examples.example_content(
                data=openapi_examples.ORDER_SUMMARY_EXAMPLE,
                message="Günlük özet hazır.",
            ),
        },
        401: {"description": "Yetkisiz erişim.", "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}}},
        403: {"description": "Admin yetkisi gerekli.", "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}}},
        500: {"description": "Beklenmeyen sunucu hatası.", "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}}},
    },
)
async def get_today_summary(
    admin: AdminUser,
):
    return success_response(
        data=openapi_examples.ORDER_SUMMARY_EXAMPLE,
        message="Günlük özet hazır.",
    )


@router.get(
    "/{order_id}",
    response_model=None,
    summary="Sipariş detayını getir",
    responses={
        200: {
            "description": "Sipariş detayı alındı.",
            "content": openapi_examples.example_content(
                data=openapi_examples.ORDER_DETAIL_EXAMPLE,
                message="Sipariş detayı alındı.",
            ),
        },
        401: {"description": "Yetkisiz erişim.", "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}}},
        403: {"description": "Admin yetkisi gerekli.", "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}}},
        500: {"description": "Beklenmeyen sunucu hatası.", "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}}},
    },
)
async def get_order_detail(
    order_id: int,
    admin: AdminUser,
):
    return success_response(
        data={"order_id": order_id, "status": "hazırlanıyor"},
        message="Sipariş detayı alındı.",
    )
