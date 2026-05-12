# api/endpoints/inventory.py
# Stok yönetimi endpoint'leri.
# Business logic InventoryService'de — burada sadece routing ve response.
# Stok güncellendiğinde threshold trigger otomatik tetiklenir (InventoryService içinde).

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import AdminUser, get_inventory_service
from app.core.response_builder import success_response
from app.core import openapi_examples
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
        401: {"description": "Yetkisiz erişim.", "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}}},
        403: {"description": "Admin yetkisi gerekli.", "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}}},
        500: {"description": "Beklenmeyen sunucu hatası.", "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}}},
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
        data=items,
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
        401: {"description": "Yetkisiz erişim.", "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}}},
        403: {"description": "Admin yetkisi gerekli.", "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}}},
        500: {"description": "Beklenmeyen sunucu hatası.", "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}}},
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
        data=items,
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
        404: {
            "description": "Stok kaydı bulunamadı.",
            "content": {
                "application/json": {
                    "example": openapi_examples.NOT_FOUND_RESPONSE
                }
            },
        },
        401: {"description": "Yetkisiz erişim.", "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}}},
        403: {"description": "Admin yetkisi gerekli.", "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}}},
        422: {
            "description": "Validasyon hatası.",
            "content": {
                "application/json": {
                    "example": openapi_examples.VALIDATION_ERROR_RESPONSE
                }
            },
        },
        500: {"description": "Beklenmeyen sunucu hatası.", "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}}},
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
        data=inventory,
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
        analysis = await service.get_stock_analysis(product_id)
        # Gemini'ın anlayacağı temiz bir metne çeviriyoruz
        return str(analysis)