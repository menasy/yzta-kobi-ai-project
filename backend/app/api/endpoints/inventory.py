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
    to_low_stock_alert_responses,
)
from app.schemas.inventory import InventoryUpdate
from app.services.inventory_service import InventoryService
from app.services.stock_analysis_service import StockAnalysisService
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db_session 

from app.agent.tools.base import BaseTool 
from app.services.stock_analysis_service import StockAnalysisService

from sqlalchemy import select
from app.models.product import Product


router = APIRouter()

def get_stock_analysis_service(db: AsyncSession = Depends(get_db_session)):
    return StockAnalysisService(db)

@router.get("/critical-stocks")
async def get_critical_stocks(db: AsyncSession = Depends(get_db_session)):
    """Tüm ürünleri analiz eder ve sadece riskli olanları döner."""
    analysis_service = StockAnalysisService(db)

    # 1. Tüm ürünleri çek
    query = select(Product)
    result = await db.execute(query)
    products = result.scalars().all()
    
    critical_items = []
    
    # 2. Her ürün için analiz motorunu çalıştır
    for product in products:
        analysis_result = await analysis_service.analyze_stock_health(product.id)
        
        # Sadece riskli olanları listeye ekle
        if analysis_result["status"] in ["danger", "warning"]:
            critical_items.append({
                "product_id": product.id,
                "product_name": str(product.name),
                "status": str(analysis_result["status"]),
                "current_stock": int(analysis_result["current_stock"]),
                "forecasted_demand": float(analysis_result["forecasted_demand_3d"]),
                "alert_message": str(analysis_result["message"])
            })
            
    return {
        "total_risky_products": len(critical_items),
        "items": critical_items
    }

@router.get("/analysis/{product_id}", tags=["Tahminleme"]) 
async def get_stock_analysis(product_id: int, db: AsyncSession = Depends(get_db_session)):
    """
    Ürünün mevcut stoğunu, gelecek 3 günlük satış tahminiyle kıyaslar 
    ve kritik bir durum olup olmadığını analiz eder. Sadece Admin yetkisi 
    olanlar görebilir.
    """
    analysis_service = StockAnalysisService(db)
    result = await analysis_service.analyze_stock_health(product_id)
    
    return success_response(
        data=result,
        message="Stok analizi başarıyla tamamlandı."
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

class GetStockPredictionTool(BaseTool):
    """Gelecek hafta için stok tahmini ve risk analizi yapan araç."""
    
    name = "get_stock_prediction"
    description = "Bir ürünün ID'sini alarak gelecek hafta için stok tahmini ve risk analizini (danger, success vb.) yapar."

    def __init__(self, db):
        self.db = db

    async def execute(self, product_id: int) -> str:
        service = StockAnalysisService(self.db)
        analysis = await service.analyze_stock_health(product_id)
        # Gemini'ın anlayacağı temiz bir metne çeviriyoruz
        return str(analysis)
    


@router.get("/dashboard-summary")
async def get_inventory_summary(
    db: AsyncSession = Depends(get_db_session)
):
    """
    Tüm deponun genel sağlık durumunu ve özet rakamları döner.
    Frontend'deki dashboard kartları için idealdir.
    """
    analysis_service = StockAnalysisService(db)
    summary = await analysis_service.get_dashboard_summary()
    return summary


@router.get("/simulate", summary="Market Simülasyonu Çalıştır")
async def simulate_market(
    growth_factor: float = 1.5, 
    service: StockAnalysisService = Depends(get_stock_analysis_service)
):
    """
    Satışların artış oranına göre (growth_factor) stokların dayanıklılığını test eder.
    Örn: 2.0 değeri, satışların 2 katına çıktığı bir senaryoyu simüle eder.
    """
    result = await service.run_market_simulation(growth_factor)
    return {
        "statusCode": 200,
        "message": f"Yuzde {int((growth_factor-1)*100)} artis senaryosu basariyla analiz edildi.",
        "data": result
    }