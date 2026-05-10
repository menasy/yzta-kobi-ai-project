"""create_inventory_table

Revision ID: 5942407a636b
Revises: 259ee00e11f8
Create Date: 2026-05-11 00:15:53.376212

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5942407a636b'
down_revision: Union[str, Sequence[str], None] = '259ee00e11f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
