# urunlerin listelenmesi ve yoneetimi

from fastapi import APIRouter
from app.core.responses import success_response

router = APIRouter()

@router.get("/")
async def list_products():
    """Tüm ürünleri listeler (Senaryo 3 için temel)"""
    return success_response(data=[], message="Ürün listesi getirildi.")

@router.post("/")
async def create_product():
    """Yeni ürün ekler"""
    return success_response(message="Ürün başarıyla eklendi.")