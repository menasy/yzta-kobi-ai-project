"""seed_runs_metadata

Revision ID: e7a1c2d3b4f5
Revises: d2f4a9b7c6e1
Create Date: 2026-05-13 14:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "e7a1c2d3b4f5"
down_revision: str | Sequence[str] | None = "d2f4a9b7c6e1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "seed_runs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("seed_name", sa.String(length=100), nullable=False),
        sa.Column("version", sa.String(length=50), nullable=False),
        sa.Column("checksum", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("summary", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("seed_name", name="uq_seed_runs_seed_name"),
    )
    op.create_index("ix_seed_runs_status", "seed_runs", ["status"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_seed_runs_status", table_name="seed_runs")
    op.drop_table("seed_runs")
