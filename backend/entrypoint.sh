#!/bin/sh
set -e

echo "Running database migrations..."
python scripts/bootstrap_alembic.py
alembic upgrade head

echo "Running idempotent demo seed..."
python scripts/seed_all.py

echo "Starting API..."
exec "$@"
