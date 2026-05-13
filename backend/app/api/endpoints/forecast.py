from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.forecasting_service import ForecastEngine
# get_db yerine get_db_session import ediyoruz:
from app.core.database import get_db_session 

router = APIRouter()

@router.get("/{product_id}")
async def get_product_forecast(product_id: int, db: AsyncSession = Depends(get_db_session)):
    """
    Belirli bir ürün için gelecek 7 günlük satış tahminini döner.
    """
    try:
        engine = ForecastEngine(db)
        predictions = await engine.predict_next_week(product_id)
        
        if predictions == "Yetersiz veri.":
            raise HTTPException(status_code=400, detail="Tahmin yapabilmek için yeterli satış geçmişi bulunamadı.")
            
        return {
            "product_id": product_id,
            "forecast": predictions
        }
    except Exception as e:
        print(f"Tahminleme Hatasi: {e}")
        raise HTTPException(status_code=500, detail=str(e))