# api/endpoints/auth.py
# Kimlik doğrulama endpoint'leri.
# Sadece routing ve response dönüşümü — iş mantığı AuthService'de.
# Doğrudan repository veya DB session kullanılmaz.
# Tüm response'lar success_response() ile döner.

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentUser, get_auth_service
from app.core.response_builder import success_response
from app.schemas.auth import LoginRequest, UserCreate
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register")
async def register(
    payload: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Yeni kullanıcı kaydı.

    - Email unique olmalıdır.
    - Password hashlenerek saklanır.
    - Response'da password/hash dönmez.
    """
    user = await auth_service.register(payload)
    return success_response(
        data=user,
        message="Kullanıcı başarıyla oluşturuldu.",
        status_code=201,
    )


@router.post("/login")
async def login(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Kullanıcı girişi — JWT access token döndürür.

    - Email + password alır.
    - Kullanıcı bulunamazsa/şifre yanlışsa 401 döner.
    - Kullanıcı pasifse 403 döner.
    """
    token = await auth_service.login(payload)
    return success_response(
        data=token,
        message="Giriş başarılı.",
    )


@router.get("/me")
async def get_me(
    current_user: CurrentUser,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Mevcut kullanıcı bilgisi — Bearer token gerektirir.

    - Response'da password/hash dönmez.
    - Token geçersizse 401 döner.
    """
    profile = auth_service.get_profile(current_user)
    return success_response(
        data=profile,
        message="Kullanıcı bilgisi başarıyla getirildi.",
    )
