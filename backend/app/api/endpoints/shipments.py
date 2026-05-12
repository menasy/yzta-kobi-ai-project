# api/endpoints/shipments.py
# Kargo yönetimi endpoint'leri.
# Bu endpointler admin yetkisi gerektirir.

from fastapi import APIRouter, Depends, Query

from app.core import openapi_examples, openapi_responses
from app.core.dependencies import AdminUser, get_shipment_service
from app.core.response_builder import success_response
from app.schemas.shipment import ShipmentCreate
from app.services.shipment_service import ShipmentService

router = APIRouter()


@router.post(
    "",
    response_model=None,
    summary="Sevkiyat oluştur",
    responses={
        201: {
            "description": "Sevkiyat kaydı oluşturuldu.",
            "content": openapi_examples.example_content(
                message="Sevkiyat kaydı oluşturuldu.",
                status_code=201,
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.not_found_responses(),
        **openapi_responses.validation_error_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def create_shipment(
    admin: AdminUser,
    payload: ShipmentCreate,
    service: ShipmentService = Depends(get_shipment_service),
):
    shipment = await service.create_shipment(payload)
    return success_response(data=shipment, message="Sevkiyat kaydı oluşturuldu.", status_code=201)


@router.get(
    "",
    response_model=None,
    summary="Sevkiyatları listele",
    responses={
        200: {
            "description": "Sevkiyatlar listelendi.",
            "content": openapi_examples.example_content(message="Sevkiyatlar listelendi."),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.validation_error_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def list_shipments(
    admin: AdminUser,
    service: ShipmentService = Depends(get_shipment_service),
    status: str | None = Query(default=None, description="Kargo durumu filtresi"),
    carrier: str | None = Query(default=None, description="Kargo firması filtresi"),
    skip: int = Query(default=0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(default=100, ge=1, le=100, description="Dönecek kayıt sayısı"),
):
    shipments = await service.list_shipments(
        skip=skip,
        limit=limit,
        status=status,
        carrier=carrier,
    )
    return success_response(data=shipments, message="Sevkiyatlar listelendi.")


@router.get(
    "/delayed",
    response_model=None,
    summary="Geciken sevkiyatları listele",
    responses={
        200: {
            "description": "Geciken sevkiyatlar listelendi.",
            "content": openapi_examples.example_content(message="Geciken sevkiyatlar listelendi."),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.validation_error_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def list_delayed_shipments(
    admin: AdminUser,
    service: ShipmentService = Depends(get_shipment_service),
    skip: int = Query(default=0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(default=100, ge=1, le=100, description="Dönecek kayıt sayısı"),
):
    shipments = await service.list_delayed_shipments(skip=skip, limit=limit)
    return success_response(data=shipments, message="Geciken sevkiyatlar listelendi.")


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
        **openapi_responses.not_found_responses(),
        **openapi_responses.internal_error_response(),
    },
)
async def track_shipment(
    tracking_number: str,
    admin: AdminUser,
    service: ShipmentService = Depends(get_shipment_service),
):
    shipment = await service.get_shipment_by_tracking(tracking_number)
    return success_response(data=shipment, message="Kargo bilgisi alındı.")


@router.patch(
    "/{tracking_number}/refresh",
    response_model=None,
    summary="Kargo durumunu yenile",
    responses={
        200: {
            "description": "Kargo durumu yenilendi.",
            "content": openapi_examples.example_content(message="Kargo durumu yenilendi."),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.not_found_responses(),
        **openapi_responses.internal_error_response(),
    },
)
@router.put(
    "/{tracking_number}/refresh",
    response_model=None,
    include_in_schema=False,
)
async def refresh_shipment(
    tracking_number: str,
    admin: AdminUser,
    service: ShipmentService = Depends(get_shipment_service),
):
    shipment = await service.refresh_shipment_status(tracking_number)
    return success_response(data=shipment, message="Kargo durumu yenilendi.")
