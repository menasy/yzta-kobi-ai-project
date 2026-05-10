# api/endpoints/auth.py
# Kimlik doğrulama endpoint'leri.
# Sadece routing ve response dönüşümü — iş mantığı AuthService'de.
# Doğrudan repository veya DB session kullanılmaz.
# Tüm response'lar success_response() ile döner.

from typing import Annotated
from fastapi import APIRouter, Cookie, Depends, Response

from app.core.cookie import clear_auth_cookies, set_auth_cookies
from app.core.dependencies import CurrentUser, get_auth_service
from app.core.exceptions import UnauthorizedError
from app.core.response_builder import success_response
from app.core import openapi_examples
from app.schemas.auth import LoginRequest, UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/register",
    status_code=201,
    response_model=None,
    responses={
        201: {
            "description": "Kullanıcı başarıyla oluşturuldu.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        data=openapi_examples.USER_EXAMPLE,
                        message="Kullanıcı başarıyla oluşturuldu.",
                        status_code=201
                    )
                }
            }
        },
        409: {
            "description": "Email zaten kayıtlı.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        status_code=409,
                        key="CONFLICT",
                        message="'user@kobi.ai' adresi zaten kayıtlı."
                    )
                }
            }
        },
        422: {"description": "Validasyon hatası.", "content": {"application/json": {"example": openapi_examples.VALIDATION_ERROR_RESPONSE}}}
    }
)
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


@router.post(
    "/login",
    responses={
        200: {
            "description": "Giriş başarılı. HttpOnly cookie'ler set edildi.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        message="Giriş başarılı."
                    )
                }
            }
        },
        401: {"description": "Hatalı şifre veya email.", "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}}}
    }
)
async def login(
    payload: LoginRequest,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Kullanıcı girişi — JWT token'larını HttpOnly cookie olarak ayarlar.

    - Email + password alır.
    - Kullanıcı bulunamazsa/şifre yanlışsa 401 döner.
    - Kullanıcı pasifse 403 döner.
    """
    access_token, refresh_token = await auth_service.login(payload)
    
    set_auth_cookies(response, access_token, refresh_token)
    
    return success_response(
        data=None,
        message="Giriş başarılı.",
    )

@router.post("/refresh")
async def refresh(
    response: Response,
    refresh_token: Annotated[str | None, Cookie()] = None,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Mevcut refresh_token cookie'sini kullanarak yeni access ve refresh token üretir.
    """
    if not refresh_token:
        raise UnauthorizedError(message="Refresh token bulunamadı.")
        
    new_access, new_refresh = await auth_service.refresh_token(refresh_token)
    
    set_auth_cookies(response, new_access, new_refresh)
    
    return success_response(
        data=None,
        message="Token başarıyla yenilendi.",
    )

@router.post("/logout")
async def logout(
    response: Response,
):
    """
    Cookie'leri temizleyerek çıkış yapar.
    """
    clear_auth_cookies(response)
    
    return success_response(
        data=None,
        message="Çıkış başarılı.",
    )


@router.get(
    "/me",
    response_model=None,
    responses={
        200: {
            "description": "Kullanıcı bilgisi başarıyla getirildi.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        data=openapi_examples.USER_EXAMPLE,
                        message="Kullanıcı bilgisi başarıyla getirildi."
                    )
                }
            }
        },
        401: {"description": "Yetkisiz erişim.", "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}}}
    }
)
async def get_me(
    current_user: CurrentUser,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Mevcut kullanıcı bilgisi — HttpOnly Cookie gerektirir.

    - Response'da password/hash dönmez.
    - Token geçersizse 401 döner.
    """
    profile = auth_service.get_profile(current_user)
    return success_response(
        data=profile,
        message="Kullanıcı bilgisi başarıyla getirildi.",
    )
