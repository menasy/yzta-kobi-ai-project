"""normalize_legacy_user_roles

Revision ID: a9c4d2e7f1b8
Revises: e7a1c2d3b4f5
Create Date: 2026-05-13 18:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a9c4d2e7f1b8"
down_revision: str | Sequence[str] | None = "e7a1c2d3b4f5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


users_table = sa.table(
    "users",
    sa.column("role", sa.String),
)


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    bind.execute(sa.update(users_table).where(users_table.c.role == "operator").values(role="admin"))


def downgrade() -> None:
    """Downgrade schema."""
    pass
