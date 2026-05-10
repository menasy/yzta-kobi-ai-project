# api/router.py
# Ana API router — tüm endpoint modüllerini bağlar.
# Aktif router'lar burada include edilir.

from fastapi import APIRouter

from app.api.endpoints import auth

api_router = APIRouter()

# ── Aktif Router'lar ─────────────────────────────────────

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# ── İleride eklenecek router'lar ─────────────────────────
# from app.api.endpoints import products, orders, inventory, shipments, chat
#
# api_router.include_router(products.router, prefix="/products", tags=["Ürünler"])
# api_router.include_router(orders.router, prefix="/orders", tags=["Siparişler"])
# api_router.include_router(inventory.router, prefix="/inventory", tags=["Stok"])
# api_router.include_router(shipments.router, prefix="/shipments", tags=["Kargo"])
# api_router.include_router(chat.router, prefix="/chat", tags=["Chat / Agent"])
