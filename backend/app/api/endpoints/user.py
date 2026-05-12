# api/endpoints/user.py
# Login olmuş kullanıcının kendi profil ve varsayılan adres ayarları.

from fastapi import APIRouter, Depends

from app.core import openapi_examples, openapi_responses
from app.core.dependencies import CurrentUser, get_user_service
from app.core.response_builder import success_response
from app.schemas.user import UserAddressUpsert, UserProfileUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.get(
    "/profile",
    response_model=None,
    summary="Kendi profilimi getir",
    description="HttpOnly access_token cookie ile doğrulanmış kullanıcının kendi profil bilgisini döndürür.",
    responses={
        200: {
            "description": "Profil bilgisi getirildi.",
            "content": openapi_examples.example_content(
                data=openapi_examples.USER_PROFILE_EXAMPLE,
                message="Profil bilgisi getirildi.",
            ),
        },
        **openapi_responses.unauthorized_response(description="Login gerekli."),
        **openapi_responses.forbidden_response(description="Kullanıcı pasif."),
        **openapi_responses.internal_error_response(),
    },
)
async def get_profile(
    current_user: CurrentUser,
    service: UserService = Depends(get_user_service),
):
    profile = service.get_profile(current_user)
    return success_response(data=profile, message="Profil bilgisi getirildi.")


@router.patch(
    "/profile",
    response_model=None,
    summary="Kendi profilimi güncelle",
    description="Login olmuş kullanıcının kendi profil alanlarını günceller. Hassas auth alanları güncellenmez.",
    responses={
        200: {
            "description": "Profil bilgisi güncellendi.",
            "content": openapi_examples.example_content(
                data=openapi_examples.USER_PROFILE_EXAMPLE,
                message="Profil bilgisi güncellendi.",
            ),
        },
        **openapi_responses.unauthorized_response(description="Login gerekli."),
        **openapi_responses.forbidden_response(description="Kullanıcı pasif."),
        **openapi_responses.validation_error_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def update_profile(
    payload: UserProfileUpdate,
    current_user: CurrentUser,
    service: UserService = Depends(get_user_service),
):
    profile = await service.update_profile(current_user, payload)
    return success_response(data=profile, message="Profil bilgisi güncellendi.")


@router.get(
    "/address",
    response_model=None,
    summary="Varsayılan teslimat adresimi getir",
    description=(
        "Login olmuş kullanıcının kendi varsayılan teslimat adresini döndürür. "
        "Adres alanları order create request'indeki shipping formatıyla aynıdır."
    ),
    responses={
        200: {
            "description": "Varsayılan teslimat adresi getirildi.",
            "content": openapi_examples.example_content(
                data=openapi_examples.USER_ADDRESS_EXAMPLE,
                message="Varsayılan teslimat adresi getirildi.",
            ),
        },
        **openapi_responses.unauthorized_response(description="Login gerekli."),
        **openapi_responses.forbidden_response(description="Kullanıcı pasif."),
        **openapi_responses.not_found_responses(description="Varsayılan teslimat adresi bulunamadı."),
        **openapi_responses.internal_error_response(),
    },
)
async def get_address(
    current_user: CurrentUser,
    service: UserService = Depends(get_user_service),
):
    address = await service.get_default_address(current_user)
    return success_response(data=address, message="Varsayılan teslimat adresi getirildi.")


@router.put(
    "/address",
    response_model=None,
    summary="Varsayılan teslimat adresimi oluştur veya güncelle",
    description=(
        "Login olmuş kullanıcı için tek varsayılan teslimat adresini oluşturur veya günceller. "
        "Request body order create shipping formatıyla aynı alanları kullanır."
    ),
    responses={
        200: {
            "description": "Varsayılan teslimat adresi kaydedildi.",
            "content": openapi_examples.example_content(
                data=openapi_examples.USER_ADDRESS_EXAMPLE,
                message="Varsayılan teslimat adresi kaydedildi.",
            ),
        },
        **openapi_responses.unauthorized_response(description="Login gerekli."),
        **openapi_responses.forbidden_response(description="Kullanıcı pasif."),
        **openapi_responses.validation_error_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def upsert_address(
    payload: UserAddressUpsert,
    current_user: CurrentUser,
    service: UserService = Depends(get_user_service),
):
    address = await service.upsert_default_address(current_user, payload)
    return success_response(data=address, message="Varsayılan teslimat adresi kaydedildi.")
