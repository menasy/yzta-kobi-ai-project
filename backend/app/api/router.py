# api/router.py
# Ana API router — tüm endpoint modüllerini bağlar.
# İleride auth, products, orders, inventory, shipments ve chat router'ları
# bu dosyada include edilecek.

from fastapi import APIRouter

api_router = APIRouter()

# ── İleride eklenecek router'lar ─────────────────────────
# from app.api.endpoints import auth, products, orders, inventory, shipments, chat
#
# api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
# api_router.include_router(products.router, prefix="/products", tags=["Ürünler"])
# api_router.include_router(orders.router, prefix="/orders", tags=["Siparişler"])
# api_router.include_router(inventory.router, prefix="/inventory", tags=["Stok"])
# api_router.include_router(shipments.router, prefix="/shipments", tags=["Kargo"])
# api_router.include_router(chat.router, prefix="/chat", tags=["Chat / Agent"])
