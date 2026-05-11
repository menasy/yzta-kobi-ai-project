# api/router.py
# Ana API router — tüm endpoint modüllerini bağlar.
# Aktif router'lar burada include edilir.

from fastapi import APIRouter

from app.api.endpoints import auth
from app.api.endpoints import orders
from app.api.endpoints import products
from app.api.endpoints import shipments
from app.api.endpoints import chat
from app.api.endpoints import inventory
from app.api.endpoints import notifications

api_router = APIRouter()

# ── Aktif Router'lar ─────────────────────────────────────

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

api_router.include_router(products.router, prefix="/products", tags=["Ürün Yönetimi"])

api_router.include_router(chat.router, prefix="/chat", tags=["Chat / Agent"])

api_router.include_router(inventory.router, prefix="/inventory", tags=["Stok Yönetimi"])

api_router.include_router(notifications.router, prefix="/notifications", tags=["Bildirimler"])
api_router.include_router(orders.router, prefix="/orders", tags=["Sipariş Yönetimi"])
api_router.include_router(shipments.router, prefix="/shipments", tags=["Sevkiyat Yönetimi"])
