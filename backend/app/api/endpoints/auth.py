# api/endpoints/auth.py
# Kimlik doğrulama endpoint'leri.
# Cookie-based JWT auth kullanır; token body'de dönmez.

from typing import Annotated

from fastapi import APIRouter, Cookie, Depends

from app.core import openapi_examples
from app.core.cookie import clear_auth_cookies, set_auth_cookies
from app.core.dependencies import CurrentUser, get_auth_service
from app.core.exceptions import UnauthorizedError
from app.core.response_builder import success_response
from app.schemas.auth import LoginRequest, UserCreate
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/register",
    status_code=201,
    response_model=None,
    summary="Kullanıcı kaydı oluştur",
    description=(
        "Yeni kullanıcı kaydı oluşturur. "
        "Parola hashlenerek saklanır, response'ta hassas veri dönmez."
    ),
    responses={
        201: {
            "description": "Kullanıcı başarıyla oluşturuldu.",
            "content": openapi_examples.example_content(
                data=openapi_examples.USER_EXAMPLE,
                message="Kullanıcı başarıyla oluşturuldu.",
                status_code=201,
            ),
        },
        409: {
            "description": "Email zaten kayıtlı.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        status_code=409,
                        key="CONFLICT",
                        message="'user@kobi.ai' adresi zaten kayıtlı.",
                    )
                }
            },
        },
        422: {
            "description": "Validasyon hatası.",
            "content": {"application/json": {"example": openapi_examples.VALIDATION_ERROR_RESPONSE}},
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}},
        },
    },
)
async def register(
    payload: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
):
    user = await auth_service.register(payload)
    return success_response(
        data=user,
        message="Kullanıcı başarıyla oluşturuldu.",
        status_code=201,
    )


@router.post(
    "/login",
    response_model=None,
    summary="Kullanıcı girişi",
    description=openapi_examples.COOKIE_AUTH_DESCRIPTION,
    responses={
        200: {
            "description": "Giriş başarılı. HttpOnly cookie'ler set edildi.",
            "content": openapi_examples.example_content(message="Giriş başarılı."),
        },
        401: {
            "description": "Hatalı şifre veya email.",
            "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}},
        },
        403: {
            "description": "Kullanıcı pasif.",
            "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}},
        },
        422: {
            "description": "Validasyon hatası.",
            "content": {"application/json": {"example": openapi_examples.VALIDATION_ERROR_RESPONSE}},
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}},
        },
    },
)
async def login(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    access_token, refresh_token = await auth_service.login(payload)

    response = success_response(
        data=None,
        message="Giriş başarılı.",
    )
    set_auth_cookies(response, access_token, refresh_token)
    return response


@router.post(
    "/refresh",
    response_model=None,
    summary="Token yenile",
    description=(
        "refresh_token cookie'sini doğrular ve yeni auth cookie'leri set eder. "
        "Token değerleri body içinde dönmez."
    ),
    responses={
        200: {
            "description": "Token başarıyla yenilendi.",
            "content": openapi_examples.example_content(message="Token başarıyla yenilendi."),
        },
        401: {
            "description": "Refresh token bulunamadı veya geçersiz.",
            "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}},
        },
        403: {
            "description": "Kullanıcı pasif.",
            "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}},
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}},
        },
    },
)
async def refresh(
    refresh_token: Annotated[str | None, Cookie()] = None,
    auth_service: AuthService = Depends(get_auth_service),
):
    if not refresh_token:
        raise UnauthorizedError(message="Refresh token bulunamadı.")

    new_access, new_refresh = await auth_service.refresh_token(refresh_token)

    response = success_response(
        data=None,
        message="Token başarıyla yenilendi.",
    )
    set_auth_cookies(response, new_access, new_refresh)
    return response


@router.post(
    "/logout",
    response_model=None,
    summary="Çıkış yap",
    description="Auth cookie'lerini temizleyerek oturumu kapatır.",
    responses={
        200: {
            "description": "Çıkış başarılı.",
            "content": openapi_examples.example_content(message="Çıkış başarılı."),
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}},
        },
    },
)
async def logout():
    response = success_response(
        data=None,
        message="Çıkış başarılı.",
    )
    clear_auth_cookies(response)
    return response


@router.get(
    "/me",
    response_model=None,
    summary="Mevcut kullanıcı bilgisi",
    description="HttpOnly access_token cookie ile doğrulanmış kullanıcı profilini döndürür.",
    responses={
        200: {
            "description": "Kullanıcı bilgisi başarıyla getirildi.",
            "content": openapi_examples.example_content(
                data=openapi_examples.USER_EXAMPLE,
                message="Kullanıcı bilgisi başarıyla getirildi.",
            ),
        },
        401: {
            "description": "Yetkisiz erişim.",
            "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}},
        },
        403: {
            "description": "Kullanıcı pasif.",
            "content": {"application/json": {"example": openapi_examples.FORBIDDEN_RESPONSE}},
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}},
        },
    },
)
async def get_me(
    current_user: CurrentUser,
    auth_service: AuthService = Depends(get_auth_service),
):
    profile = auth_service.get_profile(current_user)
    return success_response(
        data=profile,
        message="Kullanıcı bilgisi başarıyla getirildi.",
    )
