from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderBase(BaseModel):
    total_price: float
    status: str = "pending"
    tracking_number: Optional[str] = None

class OrderCreate(OrderBase):
    user_id: int

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    tracking_number: Optional[str] = None

class Order(OrderBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True