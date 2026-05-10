# services/auth_service.py
# Kimlik doğrulama iş mantığı katmanı.
# Repository'leri kullanarak kullanıcı kaydı, giriş ve profil işlemlerini yönetir.
# HTTPException fırlatmaz — custom exception sınıfları kullanılır.
# Password/hash bilgisi loglanmaz ve response'a eklenmez.

from datetime import datetime, timezone

from app.core.config import Settings
from app.core.exceptions import ConflictError, ForbiddenError, UnauthorizedError
from app.core.logger import get_logger
from app.core.security import create_access_token, create_refresh_token, decode_refresh_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, UserCreate, UserResponse

logger = get_logger(__name__)


class AuthService:
    """
    Kimlik doğrulama iş mantığı servisi.

    Sorumluluklar:
        - Yeni kullanıcı kaydı (register)
        - Kullanıcı girişi ve JWT token üretimi (login)
        - Mevcut kullanıcı profili dönüşümü (get_profile)
    """

    def __init__(
        self,
        user_repo: UserRepository,
        settings: Settings,
    ) -> None:
        self._user_repo = user_repo
        self._settings = settings

    async def register(self, data: UserCreate) -> UserResponse:
        """
        Yeni kullanıcı oluşturur.

        Kurallar:
            - Email unique olmalı → ConflictError
            - Password hashlenerek saklanır
            - Response'da password/hash dönmez

        Returns:
            UserResponse: Oluşturulan kullanıcı bilgisi (hassas alan yok)

        Raises:
            ConflictError: Email zaten kayıtlı
        """
        # Email unique kontrolü
        if await self._user_repo.email_exists(data.email):
            raise ConflictError(
                message=f"'{data.email}' adresi zaten kayıtlı."
            )

        # Password hash'le
        hashed = hash_password(data.password)

        # Kullanıcı oluştur
        user = await self._user_repo.create({
            "email": data.email,
            "hashed_password": hashed,
            "full_name": data.full_name,
            "role": data.role,
        })

        logger.info(
            "Yeni kullanıcı oluşturuldu.",
            extra={"user_id": user.id, "role": user.role},
        )

        return UserResponse.model_validate(user)

    async def login(self, data: LoginRequest) -> tuple[str, str]:
        """
        Kullanıcı girişi yapar ve JWT token'ları üretir.

        Kurallar:
            - Email ile kullanıcı bulunamazsa → UnauthorizedError
            - Şifre yanlışsa → UnauthorizedError
            - Kullanıcı aktif değilse → ForbiddenError
            - Başarılıysa (access_token, refresh_token) döner
            - last_login_at güncellenir

        Returns:
            tuple[str, str]: (access_token, refresh_token)
        """
        # Kullanıcıyı bul
        user = await self._user_repo.get_by_email(data.email)

        if user is None:
            raise UnauthorizedError(message="E-posta veya şifre hatalı.")

        # Şifre doğrulama
        if not verify_password(data.password, user.hashed_password):
            raise UnauthorizedError(message="E-posta veya şifre hatalı.")

        # Aktiflik kontrolü
        if not user.is_active:
            raise ForbiddenError(message="Kullanıcı hesabı devre dışı.")

        # JWT token'ları üret
        access_token = create_access_token(
            user_id=user.id,
            role=user.role,
        )
        refresh_token = create_refresh_token(
            user_id=user.id,
        )

        # last_login_at güncelle
        await self._user_repo.update(user.id, {
            "last_login_at": datetime.now(tz=timezone.utc),
        })

        logger.info(
            "Kullanıcı giriş yaptı.",
            extra={"user_id": user.id, "role": user.role},
        )

        return access_token, refresh_token

    async def refresh_token(self, refresh_token: str) -> tuple[str, str]:
        """
        Mevcut refresh_token'ı kullanarak yeni token'lar üretir.
        
        Returns:
            tuple[str, str]: (new_access_token, new_refresh_token)
        """
        payload = decode_refresh_token(refresh_token)
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise UnauthorizedError(message="Token geçersiz.")
            
        user_id = int(user_id_str)
        user = await self._user_repo.get(user_id)
        
        if user is None:
            raise UnauthorizedError(message="Kullanıcı bulunamadı.")
            
        if not user.is_active:
            raise ForbiddenError(message="Kullanıcı hesabı devre dışı.")
            
        new_access_token = create_access_token(
            user_id=user.id,
            role=user.role,
        )
        new_refresh_token = create_refresh_token(
            user_id=user.id,
        )
        
        logger.info(
            "Token yenilendi.",
            extra={"user_id": user.id, "role": user.role},
        )
        
        return new_access_token, new_refresh_token

    def get_profile(self, user: User) -> UserResponse:
        """
        Mevcut kullanıcı bilgisini response schema'sına dönüştürür.

        Response'da password/hashed_password alanı asla dönmez.

        Returns:
            UserResponse: Kullanıcı bilgisi (hassas alan yok)
        """
        return UserResponse.model_validate(user)
