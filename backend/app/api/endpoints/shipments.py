# api/endpoints/shipments.py
# Kargo yönetimi endpoint'leri (stub).
# Bu endpointler admin yetkisi gerektirir.

from fastapi import APIRouter

from app.core import openapi_examples, openapi_responses
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
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
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
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
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
