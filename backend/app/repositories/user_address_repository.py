# repositories/user_address_repository.py
# UserAddress tablosuna özel DB sorguları.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_address import UserAddress

from .base import BaseRepository


class UserAddressRepository(BaseRepository[UserAddress]):
    """Kullanıcının teslimat adresleri repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(UserAddress, session)

    async def get_default_by_user_id(self, user_id: int) -> UserAddress | None:
        """Kullanıcının varsayılan teslimat adresini getirir."""
        result = await self.session.execute(
            select(UserAddress)
            .where(UserAddress.user_id == user_id, UserAddress.is_default.is_(True))
            .order_by(UserAddress.id.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
