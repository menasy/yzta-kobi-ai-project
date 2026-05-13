from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError, OptionalDependencyError
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.forecast import (
    CriticalStockItemResponse,
    CriticalStocksResponse,
    InventoryDashboardSummaryResponse,
    MarketSimulationItemResponse,
    MarketSimulationResponse,
    StockAnalysisResponse,
)


class StockAnalysisService:
    """Tahminleme destekli stok sağlık analizi servisi."""

    def __init__(self, db: AsyncSession) -> None:
        self._inventory_repo = InventoryRepository(db)
        self._product_repo = ProductRepository(db)
        self._forecast_engine = None

    def _get_forecast_engine(self):
        if self._forecast_engine is None:
            from app.services.forecasting_service import ForecastEngine

            self._forecast_engine = ForecastEngine(self._inventory_repo.session)

        return self._forecast_engine

    async def get_current_stock(self, product_id: int) -> int:
        """Ürün stok miktarını repository üzerinden döndürür."""
        return await self._inventory_repo.get_quantity_by_product_id(product_id)

    async def analyze_stock_health(self, product_id: int) -> StockAnalysisResponse:
        """Ürünün mevcut stoğunu gelecek 3 günlük tahmini taleple karşılaştırır."""
        product = await self._product_repo.get(product_id)
        if product is None or not product.is_active:
            raise NotFoundError(message=f"{product_id} numaralı ürün bulunamadı.")

        current_qty = await self.get_current_stock(product_id)

        try:
            forecasts = await self._get_forecast_engine().predict_next_week(product_id)
        except BadRequestError:
            return StockAnalysisResponse(
                product_id=product_id,
                product_name=product.name,
                status="neutral",
                current_stock=current_qty,
                days_to_zero=None,
                forecasted_demand_3d=0.0,
                message="Yetersiz veri nedeniyle analiz yapılamadı.",
                needs_reorder=False,
            )
        except OptionalDependencyError:
            raise

        avg_daily_demand = sum(day.estimated_sales for day in forecasts) / len(forecasts)
        days_to_zero = round(current_qty / avg_daily_demand, 1) if avg_daily_demand > 0 else 999.0
        next_3_days_demand = sum(day.estimated_sales for day in forecasts[:3])
        safety_stock = next_3_days_demand * 1.1

        if current_qty < safety_stock:
            gap = round(safety_stock - current_qty, 2)
            return StockAnalysisResponse(
                product_id=product_id,
                product_name=product.name,
                status="danger",
                current_stock=current_qty,
                days_to_zero=days_to_zero,
                forecasted_demand_3d=round(next_3_days_demand, 2),
                message=f"Kritik! Stoklar {days_to_zero} gün içinde sıfırlanacak. {gap} birim takviye lazım.",
                needs_reorder=True,
            )

        return StockAnalysisResponse(
            product_id=product_id,
            product_name=product.name,
            status="success",
            current_stock=current_qty,
            days_to_zero=days_to_zero,
            forecasted_demand_3d=round(next_3_days_demand, 2),
            message=f"Stok seviyesi güvenli. Yaklaşık {days_to_zero} gün yetecek stok var.",
            needs_reorder=False,
        )

    async def get_critical_stocks(self) -> CriticalStocksResponse:
        """Tüm aktif ürünleri analiz eder ve riskli olanları döndürür."""
        products = await self._product_repo.get_all_active_products()
        critical_items: list[CriticalStockItemResponse] = []

        for product in products:
            analysis = await self.analyze_stock_health(product.id)
            if analysis.status in {"danger", "warning"}:
                critical_items.append(
                    CriticalStockItemResponse(
                        product_id=product.id,
                        product_name=product.name,
                        status=analysis.status,
                        current_stock=analysis.current_stock,
                        forecasted_demand=analysis.forecasted_demand_3d,
                        alert_message=analysis.message,
                    )
                )

        return CriticalStocksResponse(
            total_risky_products=len(critical_items),
            items=critical_items,
        )

    async def get_dashboard_summary(self) -> InventoryDashboardSummaryResponse:
        """Tüm deponun genel sağlık durumunu özetler."""
        products = await self._product_repo.get_all_active_products()
        total_products = len(products)
        critical_count = 0
        total_shortage = 0.0

        for product in products:
            analysis = await self.analyze_stock_health(product.id)
            if analysis.status == "danger":
                critical_count += 1
                gap = analysis.forecasted_demand_3d - analysis.current_stock
                if gap > 0:
                    total_shortage += gap

        health_score = round(((total_products - critical_count) / total_products) * 100) if total_products else 0

        return InventoryDashboardSummaryResponse(
            total_products=total_products,
            critical_products_count=critical_count,
            stock_health_score=health_score,
            total_estimated_shortage=round(total_shortage, 2),
            status_summary="Kritik" if health_score < 50 else "Dikkat" if health_score < 80 else "Sağlıklı",
        )

    async def run_market_simulation(self, growth_factor: float) -> MarketSimulationResponse:
        """Satış artış oranına göre stok dayanıklılığını analiz eder."""
        if growth_factor <= 0:
            raise BadRequestError(message="growth_factor sıfırdan büyük olmalıdır.")

        products = await self._product_repo.get_all_active_products()
        simulation_results: list[MarketSimulationItemResponse] = []

        for product in products:
            analysis = await self.analyze_stock_health(product.id)
            if analysis.status == "neutral" or analysis.days_to_zero is None:
                continue

            simulated_days = round(analysis.days_to_zero / growth_factor, 1)
            if simulated_days < 1:
                simulation_results.append(
                    MarketSimulationItemResponse(
                        product_name=product.name,
                        impact="KRITIK",
                        new_eta=f"{simulated_days} gün (Dikkat: stok hemen tükenecek!)",
                    )
                )

        return MarketSimulationResponse(
            scenario=f"Satışlarda %{int((growth_factor - 1) * 100)} artış senaryosu",
            risky_products=simulation_results,
            summary=f"Bu senaryoda {len(simulation_results)} ürün risk altına giriyor.",
        )
