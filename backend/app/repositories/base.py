# repositories/base.py
# Generic BaseRepository — tüm repository'lerin miras aldığı temel sınıf.
# CRUD işlemleri burada tanımlanır; entity'ye özgü sorgular alt sınıflarda eklenir.
# Commit/rollback yönetimi bu katmanda yapılmaz; üst katmanlar (session dependency) yönetir.

from typing import Any, Generic, TypeVar

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Generic CRUD repository.

    Tüm entity repository'leri bu sınıftan miras alır.
    CRUD işlemleri otomatik gelir; özel sorgular alt sınıfta eklenir.

    Kullanım:
        class ProductRepository(BaseRepository[Product]):
            def __init__(self, session: AsyncSession):
                super().__init__(Product, session)

            async def get_by_sku(self, sku: str) -> Product | None:
                ...
    """

    def __init__(self, model: type[ModelType], session: AsyncSession) -> None:
        self.model = model
        self.session = session

    # ── Read ─────────────────────────────────────────────

    async def get(self, id: int) -> ModelType | None:
        """ID ile tek kayıt getirir."""
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[ModelType]:
        """Sayfalı liste getirir."""
        result = await self.session.execute(
            select(self.model)
            .offset(skip)
            .limit(limit)
            .order_by(self.model.id.desc())
        )
        return list(result.scalars().all())

    async def get_all(self) -> list[ModelType]:
        """Tüm kayıtları getirir (küçük tablolar için)."""
        result = await self.session.execute(
            select(self.model).order_by(self.model.id.desc())
        )
        return list(result.scalars().all())

    async def count(self) -> int:
        """Toplam kayıt sayısını döndürür."""
        result = await self.session.execute(
            select(func.count()).select_from(self.model)
        )
        return result.scalar_one()

    async def exists(self, id: int) -> bool:
        """Belirtilen ID'ye sahip kayıt var mı kontrol eder."""
        result = await self.session.execute(
            select(func.count()).select_from(self.model).where(self.model.id == id)
        )
        return result.scalar_one() > 0

    # ── Create ───────────────────────────────────────────

    async def create(self, data: dict[str, Any]) -> ModelType:
        """
        Yeni kayıt oluşturur ve session'a ekler.
        Commit üst katman tarafından yapılır (get_db_session dependency).
        """
        instance = self.model(**data)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    # ── Update ───────────────────────────────────────────

    async def update(self, id: int, data: dict[str, Any]) -> ModelType | None:
        """
        Mevcut kaydı günceller.
        Boş değerler (None) filtrelenmez — sadece gönderilen dict kullanılır.
        Çağıran katman hangi alanları güncelleyeceğine karar verir.
        """
        instance = await self.get(id)
        if instance is None:
            return None

        for key, value in data.items():
            if hasattr(instance, key):
                setattr(instance, key, value)

        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    # ── Delete ───────────────────────────────────────────

    async def delete(self, id: int) -> bool:
        """Kaydı siler. Başarılıysa True döner."""
        result = await self.session.execute(
            delete(self.model).where(self.model.id == id)
        )
        return result.rowcount > 0

    # ── Helpers ──────────────────────────────────────────

    async def get_by_ids(self, ids: list[int]) -> list[ModelType]:
        """Birden fazla ID ile kayıtları getirir."""
        if not ids:
            return []
        result = await self.session.execute(
            select(self.model).where(self.model.id.in_(ids))
        )
        return list(result.scalars().all())
