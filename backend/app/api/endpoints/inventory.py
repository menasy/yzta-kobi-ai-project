# api/endpoints/inventory.py
# Stok yönetimi endpoint'leri.
# Business logic InventoryService'de — burada sadece routing ve response.
# Stok güncellendiğinde threshold trigger otomatik tetiklenir (InventoryService içinde).

from fastapi import APIRouter, Depends, Query

from app.core import openapi_examples, openapi_responses
from app.core.dependencies import AdminOrOperatorUser, AdminUser, get_inventory_service, get_stock_analysis_service
from app.core.response_builder import success_response
from app.mappers.inventory_mapper import (
    to_inventory_response,
    to_inventory_with_product_responses,
    to_low_stock_alert_responses,
)
from app.schemas.inventory import InventoryUpdate
from app.services.inventory_service import InventoryService
from app.services.stock_analysis_service import StockAnalysisService

router = APIRouter()


@router.get(
    "/critical-stocks",
    response_model=None,
    summary="Tahminleme destekli kritik stokları listele",
    responses={
        200: {
            "description": "Riskli stoklar listelendi.",
            "content": openapi_examples.example_content(
                data={"total_risky_products": 1, "items": []},
                message="Riskli stoklar listelendi.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(description="Admin veya operator yetkisi gerekli."),
        **openapi_responses.internal_error_response(),
    },
)
async def get_critical_stocks(
    _user: AdminOrOperatorUser,
    service: StockAnalysisService = Depends(get_stock_analysis_service),
):
    """Tüm aktif ürünleri analiz eder ve sadece riskli olanları döndürür."""
    result = await service.get_critical_stocks()
    return success_response(data=result, message="Riskli stoklar listelendi.")


@router.get(
    "/analysis/{product_id}",
    response_model=None,
    summary="Ürün stok sağlığını analiz et",
    responses={
        200: {
            "description": "Stok analizi tamamlandı.",
            "content": openapi_examples.example_content(
                data={
                    "product_id": 101,
                    "product_name": "Kablosuz Mouse",
                    "status": "success",
                    "current_stock": 45,
                    "days_to_zero": 9.0,
                    "forecasted_demand_3d": 12.5,
                    "message": "Stok seviyesi güvenli.",
                    "needs_reorder": False,
                },
                message="Stok analizi başarıyla tamamlandı.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(description="Admin veya operator yetkisi gerekli."),
        **openapi_responses.not_found_responses(description="Ürün bulunamadı."),
        **openapi_responses.internal_error_response(),
    },
)
async def get_stock_analysis(
    product_id: int,
    _user: AdminOrOperatorUser,
    service: StockAnalysisService = Depends(get_stock_analysis_service),
):
    result = await service.analyze_stock_health(product_id)
    return success_response(
        data=result,
        message="Stok analizi başarıyla tamamlandı.",
    )


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
        data=to_low_stock_alert_responses(items),
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


@router.get(
    "/dashboard-summary",
    response_model=None,
    summary="Envanter dashboard özetini getir",
    responses={
        200: {
            "description": "Envanter özeti hazırlandı.",
            "content": openapi_examples.example_content(
                data={
                    "total_products": 20,
                    "critical_products_count": 2,
                    "stock_health_score": 90,
                    "total_estimated_shortage": 15.5,
                    "status_summary": "Sağlıklı",
                },
                message="Envanter özeti hazırlandı.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(description="Admin veya operator yetkisi gerekli."),
        **openapi_responses.internal_error_response(),
    },
)
async def get_inventory_summary(
    _user: AdminOrOperatorUser,
    service: StockAnalysisService = Depends(get_stock_analysis_service),
):
    summary = await service.get_dashboard_summary()
    return success_response(data=summary, message="Envanter özeti hazırlandı.")


@router.get(
    "/simulate",
    response_model=None,
    summary="Market simülasyonu çalıştır",
    responses={
        200: {
            "description": "Market simülasyonu tamamlandı.",
            "content": openapi_examples.example_content(
                data={
                    "scenario": "Satışlarda %50 artış senaryosu",
                    "risky_products": [],
                    "summary": "Bu senaryoda 0 ürün risk altına giriyor.",
                },
                message="Market simülasyonu tamamlandı.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(description="Admin veya operator yetkisi gerekli."),
        **openapi_responses.validation_error_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def simulate_market(
    _user: AdminOrOperatorUser,
    growth_factor: float = Query(1.5, gt=0, le=100, description="Satış artış katsayısı"),
    service: StockAnalysisService = Depends(get_stock_analysis_service),
):
    result = await service.run_market_simulation(growth_factor)
    return success_response(
        data=result,
        message=f"Yüzde {int((growth_factor - 1) * 100)} artış senaryosu başarıyla analiz edildi.",
    )
