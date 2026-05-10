from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.product import Product
from app.schemas.product import ProductCreate,ProductUpdate
from app.models.inventory import Inventory

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
        
    @staticmethod
    async def create_product(db: AsyncSession, product_data: ProductCreate):
        db_product = Product(**product_data.model_dump())
        db.add(db_product)
        await db.commit()
        await db.refresh(db_product)
        return db_product

    @staticmethod
    async def get_low_stock_products(db: AsyncSession):
    # Product ve Inventory tablolarını birleştirip stok kontrolü yapıyoruz
        query = (
            select(Product)
            .join(Inventory) # Envanter tablosuna bağlan
            .where(Inventory.quantity <= Inventory.low_stock_threshold) 
        )
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def update_product(db: AsyncSession, product_id: int, update_data: ProductUpdate):
        product = await ProductService.get_product_by_id(db, product_id)
        if product:
            update_dict = update_data.model_dump(exclude_unset=True)
            for key, value in update_dict.items():
                setattr(product, key, value)
            await db.commit()
            await db.refresh(product)
        return product
    
    @staticmethod
    async def check_and_update_stock(db: AsyncSession, product_id: int, quantity: int):
        """
        Sipariş sırasında stok kontrolü yapar ve uygunsa düşer.
        quantity: Düşülecek miktar (pozitif tam sayı).
        """
        product = await ProductService.get_product_by_id(db, product_id)
        if not product or product.stock_quantity < quantity:
            return None # Stok yetersiz veya ürün yok
        
        product.stock_quantity -= quantity
        await db.commit()
        await db.refresh(product)
        return product