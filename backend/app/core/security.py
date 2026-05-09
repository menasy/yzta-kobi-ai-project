# core/security.py
# JWT token üretimi/doğrulaması ve password hashing modülü.
# Tüm güvenlik ayarları core/config.py üzerinden alınır.
# Hiçbir secret hardcoded yazılmaz.
# Password düz metin olarak saklanmaz, loglanmaz veya response'a eklenmez.

from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError

# ── Password Hashing ────────────────────────────────────


def hash_password(password: str) -> str:
    """
    Düz metin şifreyi bcrypt ile hashler.

    Kullanım:
        hashed = hash_password("Admin123!")
    """
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Düz metin şifreyi hash ile karşılaştırır.

    Kullanım:
        is_valid = verify_password("Admin123!", user.hashed_password)
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


# ── JWT Token ────────────────────────────────────────────


def create_access_token(
    user_id: int,
    role: str,
    expires_delta: timedelta | None = None,
) -> str:
    """
    JWT access token üretir.

    Payload:
        - sub: kullanıcı ID (string olarak)
        - role: kullanıcı rolü (admin, operator)
        - iat: token oluşturma zamanı
        - exp: token son kullanma zamanı

    Args:
        user_id: Kullanıcı ID'si
        role: Kullanıcı rolü
        expires_delta: Özel expire süresi (None ise config'den alınır)

    Returns:
        Encoded JWT token string
    """
    settings = get_settings()

    now = datetime.now(tz=timezone.utc)

    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: dict[str, Any] = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + expires_delta,
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    """
    JWT token'ı decode eder ve payload'ı döndürür.

    Token geçersizse veya süresi dolmuşsa UnauthorizedError fırlatır.
    HTTPException kullanılmaz.

    Returns:
        Token payload dict (sub, role, iat, exp)

    Raises:
        UnauthorizedError: Token geçersiz veya süresi dolmuş
    """
    settings = get_settings()

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        raise UnauthorizedError(message="Token geçersiz veya süresi dolmuş.")

    # sub alanı zorunlu
    if payload.get("sub") is None:
        raise UnauthorizedError(message="Token payload geçersiz.")

    return payload
