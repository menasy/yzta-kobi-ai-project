from datetime import datetime, timedelta

from sqlalchemy import text

from app.core.exceptions import OptionalDependencyError

class ForecastEngine:
    def __init__(self, session):
        self.session = session

    @staticmethod
    def _load_dependencies():
        try:
            import pandas as pd
            from sklearn.ensemble import RandomForestRegressor
        except ModuleNotFoundError as exc:
            raise OptionalDependencyError(
                message=(
                    "Forecasting ozelligi icin eksik bagimlilik var. "
                    "Lutfen 'pandas' ve 'scikit-learn' kurun."
                )
            ) from exc

        return pd, RandomForestRegressor

    async def get_sales_data(self, product_id):
        pd, _ = self._load_dependencies()
        # 1. Veritabanından satış verilerini çek
        result = await self.session.execute(text("""
            SELECT 
                oi.product_id, 
                oi.quantity, 
                o.placed_at as sale_date 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.product_id = :product_id
        """), {"product_id": product_id})
        columns = ['product_id', 'quantity', 'sale_date']
        return pd.DataFrame(result.fetchall(), columns=columns)

    def prepare_data(self, df):
        pd, _ = self._load_dependencies()
        # 2. Zaman özelliklerini çıkar (Feature Engineering)
        df['sale_date'] = pd.to_datetime(df['sale_date'])
        df['day_of_week'] = df['sale_date'].dt.dayofweek  # 0=Pazartesi, 6=Pazar
        df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
        return df

    async def predict_next_week(self, product_id):
        _, RandomForestRegressor = self._load_dependencies()
        # Veriyi al ve hazırla
        raw_data = await self.get_sales_data(product_id)
        df = self.prepare_data(raw_data)
        
        # Sadece ilgili ürünün verisine odaklan
        product_df = df[df['product_id'] == product_id].copy()
        
        if len(product_df) < 7:
            return "Yetersiz veri."

        # Model Eğitimi (X: Özellikler, y: Hedef satış miktarı)
        X = product_df[['day_of_week', 'is_weekend']]
        y = product_df['quantity']
        
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)

        # Gelecek 7 gün için tahmin oluştur
        predictions = []
        today = datetime.now()
        
        for i in range(1, 8):
            next_day = today + timedelta(days=i)
            day_of_week = next_day.weekday()
            is_weekend = 1 if day_of_week >= 5 else 0
            
            # Tahmin yap
            pred_qty = model.predict([[day_of_week, is_weekend]])[0]
            predictions.append({
                "date": next_day.strftime('%Y-%m-%d'),
                "estimated_sales": round(pred_qty, 2)
            })
            
        return predictions