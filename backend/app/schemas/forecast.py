# schemas/forecast.py
# Tahminleme ve stok analizi response DTO'ları.

from pydantic import BaseModel, ConfigDict, Field


class ForecastDayResponse(BaseModel):
    """Tek gün satış tahmini."""

    date: str
    estimated_sales: float


class ProductForecastResponse(BaseModel):
    """Ürün bazlı haftalık satış tahmini."""

    product_id: int
    forecast: list[ForecastDayResponse] = Field(default_factory=list)


class StockAnalysisResponse(BaseModel):
    """Ürün stok sağlığı analizi."""

    product_id: int
    product_name: str | None = None
    status: str
    current_stock: int = 0
    days_to_zero: float | None = None
    forecasted_demand_3d: float = 0.0
    message: str
    needs_reorder: bool = False


class CriticalStockItemResponse(BaseModel):
    """Kritik stok listesi satırı."""

    product_id: int
    product_name: str
    status: str
    current_stock: int
    forecasted_demand: float
    alert_message: str


class CriticalStocksResponse(BaseModel):
    """Kritik stok listesi response."""

    total_risky_products: int
    items: list[CriticalStockItemResponse] = Field(default_factory=list)


class InventoryDashboardSummaryResponse(BaseModel):
    """Envanter dashboard özet response."""

    total_products: int
    critical_products_count: int
    stock_health_score: int
    total_estimated_shortage: float
    status_summary: str


class MarketSimulationItemResponse(BaseModel):
    """Market simülasyonu riskli ürün satırı."""

    product_name: str
    impact: str
    new_eta: str


class MarketSimulationResponse(BaseModel):
    """Satış artışı simülasyonu response."""

    scenario: str
    risky_products: list[MarketSimulationItemResponse] = Field(default_factory=list)
    summary: str

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "scenario": "Satışlarda %50 artış senaryosu",
            "risky_products": [
                {
                    "product_name": "Kablosuz Mouse",
                    "impact": "KRITIK",
                    "new_eta": "0.8 gün (Dikkat: stok hemen tükenecek!)",
                }
            ],
            "summary": "Bu senaryoda 1 ürün risk altına giriyor.",
        }
    })
