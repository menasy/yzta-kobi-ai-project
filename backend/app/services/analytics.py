from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.inventory_movement import InventoryMovement
from app.models.product import Product

def get_dynamic_stock_forecast(product_id: int, db: Session):
    # 1. ZAMANI AYARLA
    today = datetime.now()
    seven_days_ago = today - timedelta(days=7)

    # 2. GEÇMİŞ VERİYİ ÇEK (Son 7 gündeki günlük stok seviyeleri)
    history_entries = db.query(
        func.date(InventoryMovement.created_at).label("date"),
        func.avg(InventoryMovement.new_quantity).label("daily_stock")
    ).filter(
        InventoryMovement.product_id == product_id,
        InventoryMovement.created_at >= seven_days_ago
    ).group_by(func.date(InventoryMovement.created_at)).order_by("date").all()

    # 3. GÜNCEL STOK DURUMU
    latest_movement = db.query(InventoryMovement).filter(
        InventoryMovement.product_id == product_id
    ).order_by(InventoryMovement.created_at.desc()).first()
    
    current_stock = latest_movement.new_quantity if latest_movement else 0

    # 4. SATIŞ HIZI HESABI 
    # Son 7 günde ne kadar azaldığını hesaplayalım
    if len(history_entries) > 1:
        # İlk kayıt ile son kayıt arasındaki stok farkını alıyoruz
        start_stock = history_entries[0].daily_stock
        end_stock = history_entries[-1].daily_stock
        total_decline = start_stock - end_stock
        avg_velocity = max(0, total_decline / 7) # Günde ortalama azalma hızı
    else:
        avg_velocity = 0

    final_data = []

    # 5. GEÇMİŞİ LİSTEYE EKLE (Actual Çizgisi)
    for entry in history_entries:
        final_data.append({
            "date": entry.date.strftime("%Y-%m-%d"),
            "actual": float(entry.daily_stock),
            "forecast": None
        })

    # 6. KÖPRÜ NOKTASI (Bugün)
    # Eğer bugün verisi yoksa biz ekleyelim ki grafik kopmasın
    today_str = today.strftime("%Y-%m-%d")
    if not final_data or final_data[-1]["date"] != today_str:
        final_data.append({
            "date": today_str,
            "actual": float(current_stock),
            "forecast": float(current_stock)
        })
    else:
        final_data[-1]["forecast"] = float(current_stock)

    # 7. GELECEĞİ TAHMİN ET (Forecast Çizgisi - Sonraki 5 gün)
    for i in range(1, 6):
        future_date = today + timedelta(days=i)
        predicted_stock = max(0, round(current_stock - (avg_velocity * i), 2))
        
        final_data.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "actual": None,
            "forecast": float(predicted_stock)
        })

    return final_data