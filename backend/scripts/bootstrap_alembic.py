"""Prepare Alembic metadata for legacy development databases.

Older local databases may have been created by SQLAlchemy create_all() before
Alembic was wired into container startup. In that case tables exist, but
alembic_version does not. For that dev-only state, stamp the latest pre-seed
revision so normal `alembic upgrade head` can apply new migrations.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import get_settings

LEGACY_SCHEMA_REVISION = "d2f4a9b7c6e1"


async def main() -> None:
    settings = get_settings()
    if settings.is_production:
        return

    engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
    try:
        async with engine.begin() as conn:
            alembic_exists = await conn.scalar(
                text(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = 'public'
                          AND table_name = 'alembic_version'
                    )
                    """
                )
            )
            if alembic_exists:
                return

            table_count = await conn.scalar(
                text(
                    """
                    SELECT COUNT(*)
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_type = 'BASE TABLE'
                    """
                )
            )
            if int(table_count or 0) == 0:
                return

            await conn.execute(
                text(
                    """
                    CREATE TABLE alembic_version (
                        version_num VARCHAR(32) NOT NULL,
                        CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
                    )
                    """
                )
            )
            await conn.execute(
                text("INSERT INTO alembic_version (version_num) VALUES (:revision)"),
                {"revision": LEGACY_SCHEMA_REVISION},
            )
            print(f"Stamped existing development schema at {LEGACY_SCHEMA_REVISION}.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
