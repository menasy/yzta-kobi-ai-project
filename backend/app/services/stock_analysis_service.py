from sqlalchemy import text
from app.services.forecasting_service import ForecastEngine

class StockAnalysisService:
    def __init__(self, session):
        self.session = session
        self.forecast_engine = ForecastEngine(session)

    async def get_current_stock(self, product_id: int):
        # Mevcut stok miktarını inventory tablosundan al
        query = text("SELECT quantity FROM inventory WHERE product_id = :p_id")
        result = await self.session.execute(query, {"p_id": product_id})
        return result.scalar() or 0

    async def analyze_stock_health(self, product_id: int):
        # 1. Mevcut stoğu al
        current_qty = await self.get_current_stock(product_id)
        
        # 2. Gelecek 3 günlük tahmini al
        forecasts = await self.forecast_engine.predict_next_week(product_id)
        
        if forecasts == "Yetersiz veri.":
            return {"status": "neutral", "message": "Yetersiz veri nedeniyle analiz yapılamadı."}

        # Önümüzdeki 3 günün toplam tahmini satışı
        next_3_days_demand = sum(day['estimated_sales'] for day in forecasts[:3])
        
        # 3. Mantıksal Karar (Threshold: Emniyet Payı %10 ekleyelim)
        safety_stock = next_3_days_demand * 1.1 

        if current_qty < safety_stock:
            gap = round(safety_stock - current_qty, 2)
            return {
                "status": "danger",
                "current_stock": current_qty,
                "forecasted_demand_3d": round(next_3_days_demand, 2),
                "message": f"Kritik seviye! Mevcut stoğunuz ({current_qty}), önümüzdeki 3 günlük talebi karşılamıyor. En az {gap} birim daha stok lazım.",
                "needs_reorder": True
            }
        
        return {
            "status": "success",
            "current_stock": current_qty,
            "forecasted_demand_3d": round(next_3_days_demand, 2),
            "message": "Stok seviyeniz önümüzdeki 3 gün için güvenli görünüyor.",
            "needs_reorder": False
        }