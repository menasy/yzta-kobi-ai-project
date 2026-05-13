from sqlalchemy import select, text

from app.core.exceptions import OptionalDependencyError
from app.models.notification import Notification
from app.models.product import Product

class StockAnalysisService:
    def __init__(self, session):
        self.session = session
        self._forecast_engine = None

    def _get_forecast_engine(self):
        if self._forecast_engine is None:
            from app.services.forecasting_service import ForecastEngine

            self._forecast_engine = ForecastEngine(self.session)

        return self._forecast_engine

    async def get_current_stock(self, product_id: int):
        query = text("SELECT quantity FROM inventory WHERE product_id = :p_id")
        result = await self.session.execute(query, {"p_id": product_id})
        return result.scalar() or 0

    async def analyze_stock_health(self, product_id: int):
        # 1. Mevcut stoğu ve ürün bilgilerini al
        product_query = select(Product).where(Product.id == product_id)
        product_result = await self.session.execute(product_query)
        product = product_result.scalar_one_or_none()
        
        current_qty = await self.get_current_stock(product_id)
        
        # 2. Tahminleri al
        try:
            forecast_engine = self._get_forecast_engine()
            forecasts = await forecast_engine.predict_next_week(product_id)
        except OptionalDependencyError:
            raise
        
        if forecasts == "Yetersiz veri.":
            return {"status": "neutral", "message": "Yetersiz veri nedeniyle analiz yapılamadı."}

        # --- YENİ: ETA HESAPLAMA MANTIĞI ---
        # Gelecek 7 günün ortalama günlük satışını hesapla
        avg_daily_demand = sum(day['estimated_sales'] for day in forecasts) / len(forecasts)
        
        # Kalan stok / Günlük satış = Kaç gün yeteceği (0'a bölme hatasını önlemek için kontrol ekledik)
        days_to_zero = round(current_qty / avg_daily_demand, 1) if avg_daily_demand > 0 else 999
        # ----------------------------------

        # Önümüzdeki 3 günün toplam tahmini satışı
        next_3_days_demand = sum(day['estimated_sales'] for day in forecasts[:3])
        safety_stock = next_3_days_demand * 1.1 

        if current_qty < safety_stock:
            gap = round(safety_stock - current_qty, 2)
            product_name = product.name if product else f"Ürün #{product_id}"
            
            # Bildirim mesajına ETA bilgisini de ekleyelim
            new_notification = Notification(
                title="KRİTİK: Stok Tükeniyor!",
                message=f"{product_name} tahminen {days_to_zero} gün içinde bitecek! Mevcut: {current_qty}",
                type="stock_alert"
            )
            self.session.add(new_notification)
            await self.session.commit()

            return {
                "status": "danger",
                "current_stock": current_qty,
                "days_to_zero": days_to_zero,
                "forecasted_demand_3d": round(next_3_days_demand, 2),
                "message": f"Kritik! Stoklar {days_to_zero} gün içinde sıfırlanacak. {gap} birim takviye lazım.",
                "needs_reorder": True
            }
        
        return {
            "status": "success",
            "current_stock": current_qty,
            "days_to_zero": days_to_zero,
            "forecasted_demand_3d": round(next_3_days_demand, 2),
            "message": f"Stok seviyeniz güvenli. Yaklaşık {days_to_zero} gün yetecek stok var.",
            "needs_reorder": False
        }

    async def get_dashboard_summary(self):
        query = select(Product)
        result = await self.session.execute(query)
        products = result.scalars().all()

        total_products = len(products)
        critical_count = 0
        total_shortage = 0

        for product in products:
            analysis = await self.analyze_stock_health(product.id)
            
            if analysis["status"] == "danger":
                critical_count += 1
                gap = analysis.get("current_stock", 0) - analysis.get("forecasted_demand_3d", 0)
                if gap < 0:
                    total_shortage += abs(gap)

        health_score = round(((total_products - critical_count) / total_products) * 100) if total_products > 0 else 0

        return {
            "total_products": total_products,
            "critical_products_count": critical_count,
            "stock_health_score": health_score,
            "total_estimated_shortage": round(total_shortage, 2),
            "status_summary": "Kritik" if health_score < 50 else "Dikkat" if health_score < 80 else "Sağlıklı"
        }
    

    async def run_market_simulation(self, growth_factor: float):
        """
        growth_factor: Örn: 1.5 (%50 artış senaryosu)
        Tüm ürünleri bu artışa göre analiz eder.
        """


        products = (await self.session.execute(select(Product))).scalars().all()
        simulation_results = []

        for product in products:
            analysis = await self.analyze_stock_health(product.id)
            if analysis["status"] == "neutral": continue

            # Normal tahmini büyüme faktörüyle çarpıyoruz
            simulated_days = round(analysis["days_to_zero"] / growth_factor, 1)
            
            if simulated_days < 1:
                simulation_results.append({
                    "product_name": product.name,
                    "impact": "KRİTİK",
                    "new_eta": f"{simulated_days} gün (DİKKAT: Stok hemen tükenecek!)"
                })

        return {
            "scenario": f"Satışlarda %{int((growth_factor-1)*100)} artış senaryosu",
            "risky_products": simulation_results,
            "summary": f"Bu senaryoda {len(simulation_results)} ürün risk altına giriyor."
        }