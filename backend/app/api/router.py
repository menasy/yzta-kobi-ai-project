from fastapi import APIRouter
from app.api.endpoints import (
    auth, orders, products, shipments, 
    chat, inventory, notifications, forecast
)
from app.api.endpoints import chat, inventory

api_router = APIRouter()

# ── Aktif Router'lar ─────────────────────────────────────

# Kimlik Doğrulama
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# Ürün ve Stok
api_router.include_router(products.router, prefix="/products", tags=["Ürün Yönetimi"])
#api_router.include_router(inventory.router, prefix="/inventory", tags=["Stok Yönetimi"])
api_router.include_router(inventory.router, prefix="/inventory")

# Yapay Zeka ve Tahminleme (Analiz kodlarını forecast.py'a yazdıysan burası çalışır)
api_router.include_router(forecast.router, prefix="/forecast", tags=["Tahminleme"])

# Diğer Modüller
api_router.include_router(chat.router, prefix="/chat", tags=["Chat / Agent"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Bildirimler"])
api_router.include_router(orders.router, prefix="/orders", tags=["Sipariş Yönetimi"])
api_router.include_router(shipments.router, prefix="/shipments", tags=["Sevkiyat Yönetimi"])

api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory Analysis"])