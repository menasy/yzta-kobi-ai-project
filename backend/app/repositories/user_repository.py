# repositories/user_repository.py
# User tablosuna özel DB sorguları.
# Sadece veri erişimi — iş mantığı yok.

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

from .base import BaseRepository


class UserRepository(BaseRepository[User]):
    """User tablosu repository'si."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> User | None:
        """E-posta adresine göre kullanıcı getirir."""
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_active_users(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[User]:
        """Aktif kullanıcıları sayfalı listeler."""
        result = await self.session.execute(
            select(User)
            .where(User.is_active.is_(True))
            .offset(skip)
            .limit(limit)
            .order_by(User.id.desc())
        )
        return list(result.scalars().all())

    async def email_exists(self, email: str) -> bool:
        """E-posta adresi zaten kullanılıyor mu kontrol eder."""
        user = await self.get_by_email(email)
        return user is not None

    async def update_profile(self, user_id: int, data: dict[str, Any]) -> User | None:
        """Kullanıcının kendi profil alanlarını günceller."""
        return await self.update(user_id, data)
