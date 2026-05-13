from fastapi import APIRouter

from app.api.endpoints import auth
from app.api.endpoints import chat
from app.api.endpoints import customer_support
from app.api.endpoints import forecast
from app.api.endpoints import inventory
from app.api.endpoints import notifications
from app.api.endpoints import orders
from app.api.endpoints import products
from app.api.endpoints import shipments
from app.api.endpoints import user

api_router = APIRouter()

# ── Aktif Router'lar ─────────────────────────────────────

# Kimlik Doğrulama
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(user.router, prefix="/user", tags=["Kullanıcı Ayarları"])

# Ürün ve Stok
api_router.include_router(products.router, prefix="/products", tags=["Ürün Yönetimi"])
api_router.include_router(customer_support.router, prefix="/support", tags=["Müşteri Destek"])

# Yapay Zeka ve Tahminleme
api_router.include_router(forecast.router, prefix="/forecast", tags=["Tahminleme"])

# Diğer Modüller
api_router.include_router(chat.router, prefix="/chat", tags=["Chat / Agent"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Bildirimler"])
api_router.include_router(orders.router, prefix="/orders", tags=["Sipariş Yönetimi"])
api_router.include_router(shipments.router, prefix="/shipments", tags=["Sevkiyat Yönetimi"])

api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory Analysis"])
