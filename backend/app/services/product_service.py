# services/product_service.py
# Ürün CRUD iş mantığı servisi.
# Stok (Inventory) güncelleme işlemleri InventoryService'e taşınmıştır.
# Bu servis sadece Product tablosuyla ilgilenir.

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.product import Product
from app.models.inventory import Inventory
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:

    @staticmethod
    async def get_all_products(db: AsyncSession):
        """Tüm ürünleri veritabanından çeker."""
        result = await db.execute(select(Product))
        return result.scalars().all()

    @staticmethod
    async def create_product(db: AsyncSession, product_data: ProductCreate):
        """Yeni ürün oluşturur."""
        db_product = Product(**product_data.model_dump())
        db.add(db_product)
        await db.commit()
        await db.refresh(db_product)
        return db_product

    @staticmethod
    async def get_low_stock_products(db: AsyncSession):
        """Product ve Inventory tablolarını birleştirip kritik stoktaki ürünleri getirir."""
        query = (
            select(Product)
            .join(Inventory)
            .where(Inventory.quantity <= Inventory.low_stock_threshold)
        )
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_product_by_id(db: AsyncSession, product_id: int):
        """ID ile ürün getirir."""
        result = await db.execute(
            select(Product).where(Product.id == product_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update_product(db: AsyncSession, product_id: int, update_data: ProductUpdate):
        """Ürün bilgilerini günceller (stok hariç — stok için InventoryService kullanın)."""
        product = await ProductService.get_product_by_id(db, product_id)
        if product:
            update_dict = update_data.model_dump(exclude_unset=True)
            for key, value in update_dict.items():
                setattr(product, key, value)
            await db.commit()
            await db.refresh(product)
        return product

    # NOT: Stok güncelleme işlemleri InventoryService'e taşınmıştır.
    # update_stock_quantity() ve check_and_update_stock() kaldırıldı.
    # Stok güncellemesi için: InventoryService.update_stock() kullanın.