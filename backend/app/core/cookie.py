# core/cookie.py
# Cookie işlemlerinin merkezi olarak yönetildiği modül.
# Güvenli cookie (HttpOnly, Secure, SameSite) setleme ve temizleme işlemleri.

from fastapi import Response
from app.core.config import get_settings

def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """
    Login veya refresh sonrasında HttpOnly cookie'leri setler.
    Cookie ayarları core/config.py üzerinden alınır.
    """
    settings = get_settings()
    
    # max_age = dakika * 60 (saniye)
    access_max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refresh_max_age = settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=access_max_age,
        expires=access_max_age,
        domain=settings.COOKIE_DOMAIN,
        secure=settings.COOKIE_SECURE,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=refresh_max_age,
        expires=refresh_max_age,
        domain=settings.COOKIE_DOMAIN,
        secure=settings.COOKIE_SECURE,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
    )

def clear_auth_cookies(response: Response) -> None:
    """
    Logout sırasında cookie'leri temizler.
    """
    settings = get_settings()

    response.delete_cookie(
        key="access_token",
        domain=settings.COOKIE_DOMAIN,
        secure=settings.COOKIE_SECURE,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
    )

    response.delete_cookie(
        key="refresh_token",
        domain=settings.COOKIE_DOMAIN,
        secure=settings.COOKIE_SECURE,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
    )
