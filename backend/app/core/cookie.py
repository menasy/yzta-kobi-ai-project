# core/cookie.py
# Auth cookie işlemlerinin merkezi olarak yönetildiği modül.
# Cookie spec oluşturma, request'ten okuma, güvenli set etme ve legacy temizleme burada yapılır.

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Request, Response

from app.core.config import Settings, get_settings
from app.core.logger import get_logger

logger = get_logger(__name__)
_UNSET = object()


@dataclass(frozen=True)
class CookieSpec:
    """Tek bir cookie için canonical runtime ayarları."""

    name: str
    path: str
    domain: str | None
    secure: bool
    httponly: bool
    samesite: str
    max_age: int

    def set(self, response: Response, value: str) -> None:
        response.set_cookie(
            key=self.name,
            value=value,
            max_age=self.max_age,
            expires=self.max_age,
            path=self.path,
            domain=self.domain,
            secure=self.secure,
            httponly=self.httponly,
            samesite=self.samesite,
        )

    def clear(
        self,
        response: Response,
        *,
        path: str | None = None,
        domain: str | None | object = _UNSET,
    ) -> None:
        response.delete_cookie(
            key=self.name,
            path=path or self.path,
            domain=self.domain if domain is _UNSET else domain,
            secure=self.secure,
            httponly=self.httponly,
            samesite=self.samesite,
        )


@dataclass(frozen=True)
class AuthCookieSpecs:
    """Access ve refresh cookie spec'lerini birlikte taşır."""

    access: CookieSpec
    refresh: CookieSpec


def build_auth_cookie_specs(
    settings: Settings | None = None,
    *,
    access_max_age: int | None = None,
    refresh_max_age: int | None = None,
) -> AuthCookieSpecs:
    """Auth cookie'leri için canonical spec setini üretir."""
    settings = settings or get_settings()

    access_ttl = access_max_age or settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refresh_ttl = refresh_max_age or settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60

    base_kwargs = {
        "path": settings.AUTH_COOKIE_PATH,
        "domain": settings.AUTH_COOKIE_DOMAIN,
        "secure": settings.AUTH_COOKIE_SECURE,
        "httponly": settings.AUTH_COOKIE_HTTPONLY,
        "samesite": settings.AUTH_COOKIE_SAMESITE,
    }

    return AuthCookieSpecs(
        access=CookieSpec(
            name=settings.AUTH_ACCESS_COOKIE_NAME,
            max_age=access_ttl,
            **base_kwargs,
        ),
        refresh=CookieSpec(
            name=settings.AUTH_REFRESH_COOKIE_NAME,
            max_age=refresh_ttl,
            **base_kwargs,
        ),
    )


def _extract_cookie_values(cookie_header: str, name: str) -> list[str]:
    """Ham Cookie header'ından aynı isimli cookie'lerin tüm değerlerini sırayla çıkarır."""
    values: list[str] = []
    for chunk in cookie_header.split(";"):
        part = chunk.strip()
        if not part or "=" not in part:
            continue
        key, _, value = part.partition("=")
        if key.strip() != name:
            continue
        candidate = value.strip().strip('"')
        if candidate:
            values.append(candidate)
    return values


def read_cookie_value(
    request: Request,
    cookie_name: str,
) -> str | None:
    """
    Request'ten canonical cookie değerini okur.

    Aynı isimli birden fazla cookie gelirse son değeri seçer.
    Browser'lar daha spesifik path cookie'lerini genelde önce gönderdiği için
    canonical '/' cookie pratikte sonda kalır; bu seçim legacy duplicate riskini azaltır.
    """
    cookie_header = request.headers.get("cookie", "")
    values = _extract_cookie_values(cookie_header, cookie_name)

    if not values:
        return request.cookies.get(cookie_name)

    unique_values = list(dict.fromkeys(values))
    if len(unique_values) > 1:
        logger.warning(
            "Aynı isimli birden fazla auth cookie algılandı; canonical değer seçildi.",
            extra={"cookie_name": cookie_name, "candidate_count": len(unique_values)},
        )

    return values[-1]


def read_access_token(request: Request, settings: Settings | None = None) -> str | None:
    """Request'ten canonical access token cookie'sini okur."""
    settings = settings or get_settings()
    return read_cookie_value(request, settings.AUTH_ACCESS_COOKIE_NAME)


def read_refresh_token(request: Request, settings: Settings | None = None) -> str | None:
    """Request'ten canonical refresh token cookie'sini okur."""
    settings = settings or get_settings()
    return read_cookie_value(request, settings.AUTH_REFRESH_COOKIE_NAME)


def set_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: str,
    *,
    settings: Settings | None = None,
    access_max_age: int | None = None,
    refresh_max_age: int | None = None,
) -> None:
    """Canonical auth cookie'lerini set eder."""
    specs = build_auth_cookie_specs(
        settings,
        access_max_age=access_max_age,
        refresh_max_age=refresh_max_age,
    )
    specs.access.set(response, access_token)
    specs.refresh.set(response, refresh_token)


def clear_auth_cookies(
    response: Response,
    *,
    settings: Settings | None = None,
) -> None:
    """
    Canonical auth cookie'lerini ve bilinen legacy path/domain varyantlarını temizler.
    """
    settings = settings or get_settings()
    specs = build_auth_cookie_specs(settings)

    for spec in (specs.access, specs.refresh):
        for path in settings.auth_cookie_cleanup_paths:
            for domain in settings.auth_cookie_cleanup_domains:
                spec.clear(response, path=path, domain=domain)
