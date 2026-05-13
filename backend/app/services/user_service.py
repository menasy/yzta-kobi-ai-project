# services/user_service.py
# Kullanıcı self-service profil ve varsayılan teslimat adresi iş mantığı.

from app.core.exceptions import NotFoundError
from app.core.logger import get_logger
from app.models.user import User
from app.repositories.user_address_repository import UserAddressRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import (
    UserAddressResponse,
    UserAddressUpsert,
    UserProfileResponse,
    UserProfileUpdate,
)

logger = get_logger(__name__)


class UserService:
    """Login olmuş kullanıcının kendi profil/adres ayarlarını yönetir."""

    def __init__(
        self,
        user_repo: UserRepository,
        address_repo: UserAddressRepository,
    ) -> None:
        self._user_repo = user_repo
        self._address_repo = address_repo

    def get_profile(self, current_user: User) -> UserProfileResponse:
        """Mevcut kullanıcı profilini hassas alanlar olmadan döndürür."""
        return UserProfileResponse.model_validate(current_user)

    async def update_profile(
        self,
        current_user: User,
        payload: UserProfileUpdate,
    ) -> UserProfileResponse:
        """Kullanıcının sadece kendi profil alanlarını günceller."""
        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            return UserProfileResponse.model_validate(current_user)

        user = await self._user_repo.update_profile(current_user.id, update_data)
        if user is None:
            raise NotFoundError(message="Kullanıcı bulunamadı.")

        logger.info(
            "Kullanıcı profili güncellendi.",
            extra={"user_id": current_user.id},
        )
        return UserProfileResponse.model_validate(user)

    async def get_default_address(self, current_user: User) -> UserAddressResponse:
        """Kullanıcının kendi varsayılan teslimat adresini getirir."""
        address = await self._address_repo.get_default_by_user_id(current_user.id)
        if address is None:
            raise NotFoundError(message="Varsayılan teslimat adresi bulunamadı.")
        return UserAddressResponse.model_validate(address)

    async def upsert_default_address(
        self,
        current_user: User,
        payload: UserAddressUpsert,
    ) -> UserAddressResponse:
        """Kullanıcı için tek varsayılan teslimat adresini oluşturur veya günceller."""
        address_data = payload.model_dump()
        address = await self._address_repo.get_default_by_user_id(current_user.id)

        if address is None:
            address = await self._address_repo.create(
                {
                    **address_data,
                    "user_id": current_user.id,
                    "is_default": True,
                }
            )
            logger.info(
                "Varsayılan teslimat adresi oluşturuldu.",
                extra={"user_id": current_user.id, "address_id": address.id},
            )
            return UserAddressResponse.model_validate(address)

        updated_address = await self._address_repo.update(address.id, address_data)
        if updated_address is None:
            raise NotFoundError(message="Varsayılan teslimat adresi bulunamadı.")

        logger.info(
            "Varsayılan teslimat adresi güncellendi.",
            extra={"user_id": current_user.id, "address_id": updated_address.id},
        )
        return UserAddressResponse.model_validate(updated_address)
