# kargo takibi ve siparis ozetleri ana merkezi

from fastapi import APIRouter
from app.core.responses import success_response

router = APIRouter()

@router.get("/")
async def list_orders():
    
    return success_response(data=[], message="Siparişler listelendi.")

@router.get("/summary/today")
async def get_today_summary():
    
    return success_response(
        data={"total_orders": 0, "revenue": 0.0}, 
        message="Günlük özet hazır."
    )

@router.get("/{order_id}")
async def get_order_detail(order_id: int):
    
    return success_response(
        data={"order_id": order_id, "status": "hazırlanıyor"}, 
        message="Sipariş detayı alındı."
    )