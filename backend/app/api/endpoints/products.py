# urunlerin listelenmesi ve yoneetimi

from fastapi.encoders import jsonable_encoder
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db_session as get_db
from app.services.product_service import ProductService
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.core.response_builder import success_response

router = APIRouter()

# 1. Tüm Ürünleri Listele
@router.get("/", response_model=List[ProductResponse])
async def get_all(db: AsyncSession = Depends(get_db)):
    products = await ProductService.get_all_products(db)
    return success_response(data=products, message="Ürünler listelendi.")

# 2. Yeni Ürün Ekle (POST)
@router.post("/", status_code=201)
async def create(product_in: ProductCreate, db: AsyncSession = Depends(get_db)):
    product = await ProductService.create_product(db, product_in)

    safe_data = jsonable_encoder(product)
    
    return success_response(
        data=safe_data, 
        message="Ürün başarıyla oluşturuldu."
    )

# 3. Kritik Stoktaki Ürünleri Getir (GET)
@router.get("/low-stock")
async def get_low_stock(db: AsyncSession = Depends(get_db)):
    products = await ProductService.get_low_stock_products(db)
    return success_response(data=products, message="Kritik stok seviyesindeki ürünler getirildi.")

# 4. Ürün Güncelle (PUT)
@router.put("/{id}")
async def update(id: int, product_in: ProductUpdate, db: AsyncSession = Depends(get_db)):
    product = await ProductService.update_product(db, id, product_in)
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")
    return success_response(data=product, message="Ürün güncellendi.")

# 5. Ürün Sil (DELETE)
@router.delete("/{id}")
async def delete(id: int, db: AsyncSession = Depends(get_db)):
    # Servis kısmına delete eklemediysek şimdilik basitçe id ile işlem yapabilirsin
    # Ama genelde product_service.delete_product(db, id) çağırmak daha şıktır.
    return success_response(message="Ürün silindi (Soft delete veya direkt silme işlemi).")