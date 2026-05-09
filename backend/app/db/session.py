# db/session.py
# Async SQLAlchemy engine ve session yönetimi.
# Repository katmanı bu session'ı kullanır.
# Service layer doğrudan session görmez — dependency injection ile sağlanır.

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings
from app.core.logger import get_logger

logger = get_logger(__name__)

# ── Engine ve session factory (lazy init) ────────────────


def _create_engine():
    """Settings'ten async engine oluşturur."""
    settings = get_settings()
    return create_async_engine(
        settings.DATABASE_URL,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        echo=settings.DATABASE_ECHO,
        pool_pre_ping=True,
    )


def _create_session_factory(engine):
    """Async session factory oluşturur."""
    return async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )


# Module-level lazy singletons
_engine = None
_session_factory = None


def _get_engine():
    global _engine  # noqa: PLW0603
    if _engine is None:
        _engine = _create_engine()
    return _engine


def _get_session_factory():
    global _session_factory  # noqa: PLW0603
    if _session_factory is None:
        _session_factory = _create_session_factory(_get_engine())
    return _session_factory


# ── FastAPI Dependency ───────────────────────────────────


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI Depends() ile kullanılan session dependency.
    Her request için yeni session açar, sonunda kapatır.
    Hata durumunda rollback yapar.

    Kullanım:
        async def get_order(db: AsyncSession = Depends(get_db_session)):
            ...
    """
    session = _get_session_factory()()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


# ── Lifecycle ────────────────────────────────────────────


async def close_db_connections() -> None:
    """
    Uygulama kapanırken engine'i dispose eder.
    main.py shutdown event'inde çağrılır.
    """
    global _engine, _session_factory  # noqa: PLW0603
    if _engine is not None:
        await _engine.dispose()
        logger.info("Veritabanı bağlantı havuzu kapatıldı.")
        _engine = None
        _session_factory = None
