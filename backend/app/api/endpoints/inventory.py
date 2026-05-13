# api/endpoints/inventory.py
# Stok yönetimi endpoint'leri.
# Business logic InventoryService'de — burada sadece routing ve response.
# Stok güncellendiğinde threshold trigger otomatik tetiklenir (InventoryService içinde).

from fastapi import APIRouter, Depends, Query

from app.core import openapi_examples, openapi_responses
from app.core.dependencies import AdminUser, get_inventory_service, get_stock_analysis_service
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
        **openapi_responses.forbidden_response(description="Admin yetkisi gerekli."),
        **openapi_responses.internal_error_response(),
    },
)
async def get_critical_stocks(
    admin: AdminUser,
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
        **openapi_responses.forbidden_response(description="Admin yetkisi gerekli."),
        **openapi_responses.not_found_responses(description="Ürün bulunamadı."),
        **openapi_responses.internal_error_response(),
    },
)
async def get_stock_analysis(
    product_id: int,
    admin: AdminUser,
    service: StockAnalysisService = Depends(get_stock_analysis_service),
):
    result = await service.analyze_stock_health(product_id)
    return success_response(
        data=result,
        message="Stok analizi başarıyla tamamlandı.",
    )


@router.get(
    "/",
    # ... (Diğer parametreler aynı kalıyor)
    summary="Tüm stok kayıtlarını listele",
)
async def list_inventory(
    admin: AdminUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    service: InventoryService = Depends(get_inventory_service),
):
    items = await service.get_all_with_product(skip=skip, limit=limit)
    return success_response(
        data=to_inventory_with_product_responses(items),
        message="Stok kayıtları listelendi.",
    )


@router.get(
    "/low-stock",
    summary="Kritik stok uyarıları",
)
async def get_low_stock_alerts(
    admin: AdminUser,
    service: InventoryService = Depends(get_inventory_service),
):
    items = await service.get_low_stock_items()
    return success_response(
        data=to_low_stock_alert_responses(items),
        message="Kritik stok uyarıları getirildi.",
    )


@router.put(
    "/{product_id}",
    summary="Stok güncelle",
)
async def update_inventory(
    product_id: int,
    data: InventoryUpdate,
    admin: AdminUser,
    service: InventoryService = Depends(get_inventory_service),
):
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
    summary="Envanter dashboard özetini getir",
)
async def get_inventory_summary(
    admin: AdminUser,
    service: StockAnalysisService = Depends(get_stock_analysis_service),
):
    summary = await service.get_dashboard_summary()
    return success_response(data=summary, message="Envanter özeti hazırlandı.")


@router.get(
    "/simulate",
    summary="Market simülasyonu çalıştır",
)
async def simulate_market(
    admin: AdminUser,
    growth_factor: float = Query(1.5),
    service: StockAnalysisService = Depends(get_stock_analysis_service),
):
    result = await service.run_market_simulation(growth_factor)
    return success_response(
        data=result,
        message=f"Artış senaryosu başarıyla analiz edildi.",
    )


@router.get(
    "/forecast-graph/{product_id}",
    response_model=None,
    summary="Ürün stok tahmin grafiği verilerini getir",
    responses={
        200: {
            "description": "Grafik verileri başarıyla oluşturuldu.",
            "content": openapi_examples.example_content(
                data=[
                    {"date": "2026-05-13", "actual": 40, "forecast": 40},
                    {"date": "2026-05-14", "actual": None, "forecast": 35.5}
                ],
                message="Stok grafik verileri başarıyla hazırlandı.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def get_stock_forecast_graph(
    product_id: int,
    admin: AdminUser,  
    service: StockAnalysisService = Depends(get_stock_analysis_service),
):
    """
    Bu endpoint geçici olarak herkese açık (public) yapılmıştır.
    """
    result = await service.get_stock_forecast_graph(product_id)
    return success_response(
        data=result,
        message="Stok grafik verileri başarıyla hazırlandı.",
    )