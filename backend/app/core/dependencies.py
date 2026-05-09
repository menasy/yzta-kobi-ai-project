# core/dependencies.py
# FastAPI Depends() factory'leri.
# Auth, DB session ve service dependency'leri bu dosyada tanımlanır.
# Endpoint'ler repository veya DB session'ı doğrudan kullanmaz;
# bu dependency katmanından servis alır.

from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.logger import get_logger
from app.db.session import get_db_session
from app.models.user import User
from app.repositories.user_repository import UserRepository

logger = get_logger(__name__)

# ── Security Scheme ──────────────────────────────────────

# HTTPBearer auto_error=False olarak ayarlandı.
# Token yoksa veya geçersizse kendi hata mesajımızı döneriz.
_bearer_scheme = HTTPBearer(auto_error=False)


# ── Type Aliases ─────────────────────────────────────────

DBSession = Annotated[AsyncSession, Depends(get_db_session)]
CurrentSettings = Annotated[Settings, Depends(get_settings)]


# ── Auth Dependencies ────────────────────────────────────


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(_bearer_scheme),
    ],
    db: DBSession,
    settings: CurrentSettings,
) -> User:
    """
    JWT token'ı doğrulayarak mevcut kullanıcıyı döndürür.

    Akış:
        1. Authorization header'dan Bearer token alınır.
        2. Token decode edilir (SECRET_KEY + algoritma).
        3. Payload'dan user_id çıkarılır.
        4. Kullanıcı DB'den sorgulanır.
        5. Aktif mi kontrol edilir.

    Kullanım:
        current_user: User = Depends(get_current_user)
    """
    if credentials is None:
        raise UnauthorizedError(message="Authorization header eksik.")

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id: int | None = payload.get("sub")
        if user_id is None:
            raise UnauthorizedError(message="Token payload geçersiz.")
    except JWTError:
        raise UnauthorizedError(message="Token geçersiz veya süresi dolmuş.")

    user_repo = UserRepository(db)
    user = await user_repo.get(int(user_id))

    if user is None:
        raise UnauthorizedError(message="Kullanıcı bulunamadı.")

    if not user.is_active:
        raise ForbiddenError(message="Kullanıcı hesabı devre dışı.")

    return user


async def get_admin_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Admin yetkisi kontrolü.

    Tüm admin endpoint'lerinde kullanılır:
        current_user: User = Depends(get_admin_user)
    """
    if current_user.role != "admin":
        raise ForbiddenError(message="Bu işlem için admin yetkisi gereklidir.")
    return current_user


# ── Convenience Type Aliases ─────────────────────────────

CurrentUser = Annotated[User, Depends(get_current_user)]
AdminUser = Annotated[User, Depends(get_admin_user)]


# ── Service Factory Dependencies ─────────────────────────
# Service sınıfları henüz yazılmadı.
# Aşağıdaki dependency'ler service katmanı oluşturulduktan sonra aktif edilecek.
# Şu an import hatası oluşturmazlar.


# TODO: Service katmanı oluşturulduktan sonra aşağıdaki dependency'ler aktif edilecek.
#
# async def get_auth_service(db: DBSession) -> "AuthService":
#     from app.services.auth_service import AuthService
#     return AuthService(
#         user_repo=UserRepository(db),
#         settings=get_settings(),
#     )
#
#
# async def get_product_service(db: DBSession) -> "ProductService":
#     from app.services.product_service import ProductService
#     return ProductService(
#         product_repo=ProductRepository(db),
#         inventory_repo=InventoryRepository(db),
#     )
#
#
# async def get_order_service(db: DBSession) -> "OrderService":
#     from app.services.order_service import OrderService
#     return OrderService(
#         order_repo=OrderRepository(db),
#         order_item_repo=OrderItemRepository(db),
#         product_repo=ProductRepository(db),
#         inventory_repo=InventoryRepository(db),
#         customer_repo=CustomerRepository(db),
#     )
#
#
# async def get_inventory_service(db: DBSession) -> "InventoryService":
#     from app.services.inventory_service import InventoryService
#     return InventoryService(
#         inventory_repo=InventoryRepository(db),
#         movement_repo=InventoryMovementRepository(db),
#         product_repo=ProductRepository(db),
#     )
#
#
# async def get_shipment_service(db: DBSession) -> "ShipmentService":
#     from app.services.shipment_service import ShipmentService
#     return ShipmentService(
#         shipment_repo=ShipmentRepository(db),
#         event_repo=ShipmentEventRepository(db),
#         order_repo=OrderRepository(db),
#     )
#
#
# async def get_agent_orchestrator(db: DBSession) -> "AgentOrchestrator":
#     from app.agent.orchestrator import AgentOrchestrator
#     return AgentOrchestrator(
#         settings=get_settings(),
#         db_session=db,
#     )
