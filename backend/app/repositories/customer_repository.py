# repositories/customer_repository.py
# Customer tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer

from .base import BaseRepository


class CustomerRepository(BaseRepository[Customer]):
    """Customer tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Customer, session)

    async def get_by_phone(self, phone: str) -> Customer | None:
        """Telefon numarasına göre müşteri getirir."""
        result = await self.session.execute(
            select(Customer).where(Customer.phone == phone)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Customer | None:
        """E-posta adresine göre müşteri getirir."""
        result = await self.session.execute(
            select(Customer).where(Customer.email == email)
        )
        return result.scalar_one_or_none()

    async def get_active_customers(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Customer]:
        """Aktif müşterileri sayfalı listeler."""
        result = await self.session.execute(
            select(Customer)
            .where(Customer.is_active.is_(True))
            .offset(skip)
            .limit(limit)
            .order_by(Customer.id.desc())
        )
        return list(result.scalars().all())

    async def search_by_name(self, name: str, *, limit: int = 20) -> list[Customer]:
        """İsme göre müşteri arar (case-insensitive, ILIKE)."""
        result = await self.session.execute(
            select(Customer)
            .where(Customer.full_name.ilike(f"%{name}%"))
            .limit(limit)
            .order_by(Customer.full_name)
        )
        return list(result.scalars().all())
