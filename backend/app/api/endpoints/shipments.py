# siparislerin kargolanmasi ve takip no yonetimi

from fastapi import APIRouter
from app.core.responses import success_response

router = APIRouter()

@router.post("/")
async def create_shipment():
    
    return success_response(message="Sevkiyat kaydı oluşturuldu.")

@router.get("/{tracking_number}")
async def track_shipment(tracking_number: str):
    
    return success_response(
        data={"tracking_number": tracking_number, "location": "Dağıtım Merkezinde"},
        message="Kargo bilgisi alındı."
    )

