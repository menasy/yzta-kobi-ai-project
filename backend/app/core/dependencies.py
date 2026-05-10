# core/dependencies.py
# FastAPI Depends() factory'leri.
# Auth, DB session ve service dependency'leri bu dosyada tanımlanır.
# Endpoint'ler repository veya DB session'ı doğrudan kullanmaz;
# bu dependency katmanından servis alır.

from typing import Annotated

from fastapi import Depends
from fastapi.security import APIKeyCookie
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.logger import get_logger
from app.core.security import decode_access_token
from app.db.session import get_db_session
from app.models.user import User
from app.repositories.user_repository import UserRepository

logger = get_logger(__name__)

# ── Security Scheme ──────────────────────────────────────

# APIKeyCookie auto_error=False olarak ayarlandı.
# Token yoksa veya geçersizse kendi hata mesajımızı döneriz.
_cookie_scheme = APIKeyCookie(name="access_token", auto_error=False)


# ── Type Aliases ─────────────────────────────────────────

DBSession = Annotated[AsyncSession, Depends(get_db_session)]
CurrentSettings = Annotated[Settings, Depends(get_settings)]


# ── Auth Dependencies ────────────────────────────────────


async def get_current_user(
    token: Annotated[
        str | None,
        Depends(_cookie_scheme),
    ],
    db: DBSession,
    settings: CurrentSettings,
) -> User:
    """
    JWT token'ı doğrulayarak mevcut kullanıcıyı döndürür.

    Akış:
        1. Request'ten 'access_token' cookie'si alınır.
        2. Token decode edilir (SECRET_KEY + algoritma).
        3. Payload'dan user_id çıkarılır.
        4. Kullanıcı DB'den sorgulanır.
        5. Aktif mi kontrol edilir.

    Kullanım:
        current_user: User = Depends(get_current_user)
    """
    if not token:
        raise UnauthorizedError(message="Yetki belgesi bulunamadı (Cookie eksik).")

    # decode_access_token invalid/expired durumda UnauthorizedError fırlatır
    payload = decode_access_token(token)
    user_id: int | None = payload.get("sub")

    if user_id is None:
        raise UnauthorizedError(message="Token payload geçersiz.")

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


async def get_auth_service(db: DBSession) -> "AuthService":
    """AuthService dependency — UserRepository ve Settings ile oluşturulur."""
    from app.services.auth_service import AuthService

    return AuthService(
        user_repo=UserRepository(db),
        settings=get_settings(),
    )


# ── İleride aktif edilecek service dependency'leri ────────
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


# ── Agent Orchestrator Dependency ────────────────────────


async def get_agent_orchestrator(db: DBSession) -> "AgentOrchestrator":
    """
    AgentOrchestrator dependency.
    Her request için DB session ile yeni orchestrator oluşturur.
    Tool'lar bu session üzerinden service katmanına erişir.
    """
    from app.agent.orchestrator import AgentOrchestrator

    return AgentOrchestrator(db=db, settings=get_settings())
