#!/bin/sh
set -eu

log() {
    printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"
}

check_postgres() {
    python - <<'PY'
import asyncio
import sys
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

PROJECT_ROOT = Path("/app")
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import get_settings


async def main() -> None:
    engine = create_async_engine(get_settings().DATABASE_URL, pool_pre_ping=True)
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    finally:
        await engine.dispose()


asyncio.run(main())
PY
}

wait_for_postgres() {
    max_attempts="${DB_WAIT_MAX_ATTEMPTS:-30}"
    sleep_seconds="${DB_WAIT_INTERVAL_SECONDS:-2}"
    attempt=1

    log "[startup] PostgreSQL baglantisi bekleniyor..."
    while ! check_postgres >/dev/null 2>&1; do
        if [ "$attempt" -ge "$max_attempts" ]; then
            log "[startup] PostgreSQL hazir olmadi. ${max_attempts} deneme sonrasi cikiliyor."
            return 1
        fi

        log "[startup] PostgreSQL henuz hazir degil (${attempt}/${max_attempts}). ${sleep_seconds}s sonra tekrar denenecek."
        attempt=$((attempt + 1))
        sleep "$sleep_seconds"
    done

    log "[startup] PostgreSQL baglantisi hazir."
}

run_migrations() {
    log "[startup] Alembic bootstrap kontrolu calisiyor..."
    python scripts/bootstrap_alembic.py

    log "[startup] Alembic migration calisiyor: upgrade head"
    alembic upgrade head
}

run_seed() {
    log "[startup] Seed script calisiyor: python scripts/seed_all.py"
    python scripts/seed_all.py
}

start_api() {
    log "[startup] FastAPI baslatiliyor: $*"
    exec "$@"
}

wait_for_postgres
run_migrations
run_seed
start_api "$@"
