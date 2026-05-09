from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    price: float
    stock_quantity: int
    low_stock_threshold: int = 10

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    stock_quantity: Optional[int] = None
    price: Optional[float] = None

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True