"""add_chat_history_tables

Revision ID: f3b8c2d1e4a7
Revises: e7a1c2d3b4f5
Create Date: 2026-05-13 15:50:00.000000

Kalıcı sohbet geçmişi için:
- conversations tablosuna user_id, title, last_message_preview, message_count, deleted_at eklenir
- conversation_messages tablosu oluşturulur
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3b8c2d1e4a7'
down_revision: Union[str, Sequence[str], None] = 'a9c4d2e7f1b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ── conversations tablosuna yeni sütunlar ──────────────
    op.add_column('conversations', sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    op.add_column('conversations', sa.Column('title', sa.String(length=255), nullable=True))
    op.add_column('conversations', sa.Column('last_message_preview', sa.String(length=500), nullable=True))
    op.add_column('conversations', sa.Column('message_count', sa.Integer(), server_default='0', nullable=False))
    op.add_column('conversations', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))

    op.create_index('ix_conversations_user_id', 'conversations', ['user_id'])
    op.create_index('ix_conversations_deleted_at', 'conversations', ['deleted_at'])

    # ── conversation_messages tablosu ──────────────────────
    op.create_table(
        'conversation_messages',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_conversation_messages_conversation_id', 'conversation_messages', ['conversation_id'])
    op.create_index('ix_conversation_messages_created_at', 'conversation_messages', ['created_at'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_conversation_messages_created_at', table_name='conversation_messages')
    op.drop_index('ix_conversation_messages_conversation_id', table_name='conversation_messages')
    op.drop_table('conversation_messages')

    op.drop_index('ix_conversations_deleted_at', table_name='conversations')
    op.drop_index('ix_conversations_user_id', table_name='conversations')
    op.drop_column('conversations', 'deleted_at')
    op.drop_column('conversations', 'message_count')
    op.drop_column('conversations', 'last_message_preview')
    op.drop_column('conversations', 'title')
    op.drop_column('conversations', 'user_id')
