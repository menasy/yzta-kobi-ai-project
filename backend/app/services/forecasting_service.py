from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError, OptionalDependencyError
from app.repositories.order_item_repository import OrderItemRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.forecast import ForecastDayResponse


class ForecastEngine:
    def __init__(self, db: AsyncSession):
        self._order_item_repo = OrderItemRepository(db)
        self._product_repo = ProductRepository(db)

    @staticmethod
    def _load_pandas():
        try:
            import pandas as pd
        except ModuleNotFoundError as exc:
            raise OptionalDependencyError(
                message=(
                    "Forecasting ozelligi icin eksik bagimlilik var. "
                    "Lutfen 'pandas' kurun."
                )
            ) from exc

        return pd

    async def get_sales_data(self, product_id):
        pd = self._load_pandas()
        rows = await self._order_item_repo.get_sales_rows_by_product_id(product_id)
        return pd.DataFrame(rows, columns=["product_id", "quantity", "sale_date"])

    def prepare_data(self, df):
        pd = self._load_pandas()
        df["sale_date"] = pd.to_datetime(df["sale_date"])
        df["day_of_week"] = df["sale_date"].dt.dayofweek
        return df

    async def predict_next_week(self, product_id: int) -> list[ForecastDayResponse]:
        """Son satış geçmişinden haftalık tahmin üretir."""
        product = await self._product_repo.get(product_id)
        if product is None or not product.is_active:
            raise NotFoundError(message=f"{product_id} numaralı ürün bulunamadı.")

        raw_data = await self.get_sales_data(product_id)
        df = self.prepare_data(raw_data)

        product_df = df[df["product_id"] == product_id].copy()
        if len(product_df) < 7:
            raise BadRequestError(message="Tahmin yapabilmek için yeterli satış geçmişi bulunamadı.")

        global_average = float(product_df["quantity"].mean())
        weekday_averages = {
            int(day): float(quantity)
            for day, quantity in product_df.groupby("day_of_week")["quantity"].mean().items()
        }

        predictions = []
        today = datetime.now()

        for i in range(1, 8):
            next_day = today + timedelta(days=i)
            day_of_week = next_day.weekday()
            predicted_quantity = weekday_averages.get(day_of_week, global_average)
            predictions.append(
                ForecastDayResponse(
                    date=next_day.strftime("%Y-%m-%d"),
                    estimated_sales=round(predicted_quantity, 2),
                )
            )

        return predictions
