from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.product import Product
from app.schemas.product import ProductUpdate

class ProductService:
    @staticmethod
    async def get_all_products(db: AsyncSession):
        # tum urunleri vt den ceker
        result = await db.execute(select(Product))
        return result.scalars().all()

    @staticmethod
    async def update_stock_quantity(db: AsyncSession, product_id: int, stock_data: ProductUpdate):
        # stok miktarını gunceller ve kritik esigi kontrol eder
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()
        
        if product:
            product.stock_quantity = stock_data.stock_quantity
            await db.commit()
            await db.refresh(product)
        return product