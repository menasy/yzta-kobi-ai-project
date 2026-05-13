from __future__ import annotations

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import inspect as sa_inspect

from app.core.config import get_settings
from app.core.logger import get_logger
from app.db.base import Base
from app.db.session import get_engine

logger = get_logger(__name__)

SEED_TABLE_CANDIDATES = [
    "users",
    "products",
    "inventory",
    "orders",
    "shipments",
    "notifications",
    "customers",
    "conversations",
]


async def _table_has_rows(conn, table_name: str) -> bool:
    table = Base.metadata.tables.get(table_name)
    if table is None:
        return False

    result = await conn.execute(select(func.count()).select_from(table))
    count = result.scalar_one() or 0
    return count > 0


async def get_system_status() -> dict[str, Any]:
    settings = get_settings()
    status_payload: dict[str, Any] = {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "ready": False,
        "databaseReady": False,
        "migrationsReady": False,
        "seedReady": False,
        "missingTables": [],
        "message": "Sistem durumu kontrol ediliyor.",
    }

    engine = get_engine()

    try:
        async with engine.connect() as conn:
            await conn.execute(select(1))

            table_names = await conn.run_sync(
                lambda sync_conn: sa_inspect(sync_conn).get_table_names()
            )

            from app import models  # noqa: F401

            required_tables = set(Base.metadata.tables.keys())
            missing_tables = sorted(required_tables.difference(table_names))

            migrations_ready = "alembic_version" in table_names

            seed_ready = False
            if migrations_ready and not missing_tables:
                for table_name in SEED_TABLE_CANDIDATES:
                    if table_name not in table_names:
                        continue
                    if await _table_has_rows(conn, table_name):
                        seed_ready = True
                        break

            status_payload.update(
                {
                    "databaseReady": True,
                    "migrationsReady": migrations_ready,
                    "seedReady": seed_ready,
                    "missingTables": missing_tables,
                }
            )

    except SQLAlchemyError as exc:
        logger.warning("Database readiness check failed: %s", exc)
        status_payload.update(
            {
                "status": "error",
                "message": "Veritabani baglantisi kurulamadi.",
            }
        )
        return status_payload

    ready = (
        status_payload["databaseReady"]
        and status_payload["migrationsReady"]
        and status_payload["seedReady"]
        and not status_payload["missingTables"]
    )

    status_payload["ready"] = ready

    if not status_payload["databaseReady"]:
        status_payload["message"] = "Veritabani baglantisi hazir degil."
    elif status_payload["missingTables"]:
        status_payload["message"] = "Eksik tablolar var. Migration gerekli."
    elif not status_payload["migrationsReady"]:
        status_payload["message"] = "Migration gerekli."
    elif not status_payload["seedReady"]:
        status_payload["message"] = "Seed data eksik."
    else:
        status_payload["message"] = "Sistem hazir."

    return status_payload
