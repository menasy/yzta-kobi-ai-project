from fastapi import APIRouter, Depends, Query

from app.core import openapi_responses
from app.core.dependencies import get_customer_support_service
from app.core.response_builder import success_response
from app.schemas.customer_support import (
    CustomerCargoTrackingResponse,
    CustomerOrderLookupResponse,
    CustomerStockQueryResponse,
)
from app.services.customer_support_service import CustomerSupportService

router = APIRouter()


def _public_payload(
    data: CustomerOrderLookupResponse | CustomerStockQueryResponse | CustomerCargoTrackingResponse,
) -> dict[str, object]:
    return data.model_dump(mode="json", by_alias=True)


@router.get(
    "/orders/{order_number}",
    response_model=None,
    summary="Public sipariş sorgula",
    description="Sipariş numarasıyla sınırlı müşteri destek bilgisi döndürür. Login gerekmez.",
    responses={
        **openapi_responses.not_found_responses(description="Sipariş bulunamadı."),
        **openapi_responses.public_get_responses(),
    },
)
async def lookup_order(
    order_number: str,
    service: CustomerSupportService = Depends(get_customer_support_service),
):
    result = await service.lookup_order(order_number)
    return success_response(data=_public_payload(result), message="Sipariş başarıyla bulundu.")


@router.get(
    "/stock",
    response_model=None,
    summary="Public stok sorgula",
    description="Ürün adı veya SKU ile stok durumunu döndürür. Login gerekmez.",
    responses={
        **openapi_responses.not_found_responses(description="Ürün bulunamadı."),
        **openapi_responses.public_get_responses(),
    },
)
async def query_stock(
    query: str = Query(..., min_length=2, max_length=100, description="Ürün adı veya SKU"),
    service: CustomerSupportService = Depends(get_customer_support_service),
):
    result = await service.query_stock(query)
    return success_response(data=_public_payload(result), message="Stok durumu sorgulandı.")


@router.get(
    "/cargo/{tracking_number}",
    response_model=None,
    summary="Public kargo takip et",
    description="Takip numarasıyla kayıtlı kargo durumunu döndürür. Login gerekmez.",
    responses={
        **openapi_responses.not_found_responses(description="Kargo bulunamadı."),
        **openapi_responses.public_get_responses(),
    },
)
async def track_cargo(
    tracking_number: str,
    service: CustomerSupportService = Depends(get_customer_support_service),
):
    result = await service.track_cargo(tracking_number)
    return success_response(data=_public_payload(result), message="Kargo durumu başarıyla getirildi.")
