# api/endpoints/shipments.py
# Kargo yönetimi endpoint'leri (stub).
# Bu endpointler admin yetkisi gerektirir.

from fastapi import APIRouter

from app.core import openapi_examples
from app.core.dependencies import AdminUser
from app.core.response_builder import success_response

router = APIRouter()


@router.post(
    "/",
    response_model=None,
    summary="Sevkiyat oluştur",
    responses={
        200: {
            "description": "Sevkiyat kaydı oluşturuldu.",
            "content": openapi_examples.example_content(message="Sevkiyat kaydı oluşturuldu."),
        },
        401: {"description": "Yetkisiz erişim.", "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}}},
        403: {"description": "Admin yetkisi gerekli.", "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}}},
        500: {"description": "Beklenmeyen sunucu hatası.", "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}}},
    },
)
async def create_shipment(
    admin: AdminUser,
):
    return success_response(message="Sevkiyat kaydı oluşturuldu.")


@router.get(
    "/{tracking_number}",
    response_model=None,
    summary="Kargo takip bilgisi",
    responses={
        200: {
            "description": "Kargo bilgisi alındı.",
            "content": openapi_examples.example_content(
                data=openapi_examples.SHIPMENT_TRACK_EXAMPLE,
                message="Kargo bilgisi alındı.",
            ),
        },
        401: {"description": "Yetkisiz erişim.", "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}}},
        403: {"description": "Admin yetkisi gerekli.", "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}}},
        500: {"description": "Beklenmeyen sunucu hatası.", "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}}},
    },
)
async def track_shipment(
    tracking_number: str,
    admin: AdminUser,
):
    return success_response(
        data={"tracking_number": tracking_number, "location": "Dağıtım Merkezinde"},
        message="Kargo bilgisi alındı.",
    )
