# dosya takibi ve stok uyarisi 

from fastapi import APIRouter
from app.core.responses import success_response

router = APIRouter()

@router.get("/low-stock")
async def get_low_stock_alerts():
    
    return success_response(
        data=[], 
        message="Kritik stok uyarısı bulunmamaktadır."
    )

@router.put("/update-stock")
async def bulk_update_inventory():
    
    return success_response(message="Envanter başarıyla güncellendi.")