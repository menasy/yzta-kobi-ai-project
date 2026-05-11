# api/endpoints/inventory.py
# Stok yönetimi endpoint'leri.
# Business logic InventoryService'de — burada sadece routing ve response.
# Stok güncellendiğinde threshold trigger otomatik tetiklenir (InventoryService içinde).

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import AdminUser, get_inventory_service
from app.core.response_builder import success_response
from app.core import openapi_examples, openapi_responses
from app.mappers.inventory_mapper import (
    to_inventory_response,
    to_inventory_with_product_responses,
)
from app.schemas.inventory import InventoryUpdate
from app.services.inventory_service import InventoryService

router = APIRouter()


@router.get(
    "/",
    response_model=None,
    summary="Tüm stok kayıtlarını listele",
    responses={
        200: {
            "description": "Stok kayıtları başarıyla listelendi.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        data=[openapi_examples.INVENTORY_EXAMPLE],
                        message="Stok kayıtları listelendi.",
                    )
                }
            },
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def list_inventory(
    admin: AdminUser,
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(100, ge=1, le=200, description="Sayfa başına kayıt"),
    service: InventoryService = Depends(get_inventory_service),
):
    """
    Tüm stok kayıtlarını ürün bilgisiyle birlikte listeler.

    - Admin cookie auth gerektirir.
    """
    items = await service.get_all_with_product(skip=skip, limit=limit)
    return success_response(
        data=to_inventory_with_product_responses(items),
        message="Stok kayıtları listelendi.",
    )


@router.get(
    "/low-stock",
    response_model=None,
    summary="Kritik stok uyarıları",
    responses={
        200: {
            "description": "Kritik stok seviyesindeki ürünler başarıyla getirildi.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        data=[openapi_examples.INVENTORY_EXAMPLE],
                        message="Kritik stok uyarıları getirildi.",
                    )
                }
            },
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def get_low_stock_alerts(
    admin: AdminUser,
    service: InventoryService = Depends(get_inventory_service),
):
    """
    Stok miktarı eşik değerinin altında olan tüm ürünleri getirir.

    - Admin cookie auth gerektirir.
    - Stok miktarına göre artan sırada döner.
    """
    items = await service.get_low_stock_items()
    return success_response(
        data=to_inventory_with_product_responses(items),
        message="Kritik stok uyarıları getirildi.",
    )


@router.put(
    "/{product_id}",
    response_model=None,
    summary="Stok güncelle",
    responses={
        200: {
            "description": "Stok başarıyla güncellendi.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        data=openapi_examples.INVENTORY_EXAMPLE,
                        message="Stok güncellendi.",
                    )
                }
            },
        },
        **openapi_responses.not_found_responses(description="Stok kaydı bulunamadı."),
        **openapi_responses.admin_mutation_responses(),
    },
)
async def update_inventory(
    product_id: int,
    data: InventoryUpdate,
    admin: AdminUser,
    service: InventoryService = Depends(get_inventory_service),
):
    """
    Ürünün stok miktarını ve/veya eşik değerini günceller.

    - Admin cookie auth gerektirir.
    - Stok kritik seviyeye düştüğünde otomatik bildirim oluşturulur.
    - Stok kaydı bulunamazsa 404 döner.
    """
    inventory = await service.update_stock(
        product_id,
        quantity=data.quantity,
        low_stock_threshold=data.low_stock_threshold,
    )
    return success_response(
        data=to_inventory_response(inventory),
        message="Stok güncellendi.",
    )
