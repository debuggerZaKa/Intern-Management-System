"""create mentorship requests table

Revision ID: 010_mentorship_requests
Revises: 349ce81723a5
Create Date: 2026-09-02 16:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '010_mentorship_requests'
down_revision: Union[str, None] = '349ce81723a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'mentorship_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('mentor_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('intern_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('responded_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mentorship_requests_id'), 'mentorship_requests', ['id'], unique=False)
    op.create_index(op.f('ix_mentorship_requests_mentor_id'), 'mentorship_requests', ['mentor_id'], unique=False)
    op.create_index(op.f('ix_mentorship_requests_intern_id'), 'mentorship_requests', ['intern_id'], unique=False)
    op.create_index(op.f('ix_mentorship_requests_status'), 'mentorship_requests', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_mentorship_requests_status'), table_name='mentorship_requests')
    op.drop_index(op.f('ix_mentorship_requests_intern_id'), table_name='mentorship_requests')
    op.drop_index(op.f('ix_mentorship_requests_mentor_id'), table_name='mentorship_requests')
    op.drop_index(op.f('ix_mentorship_requests_id'), table_name='mentorship_requests')
    op.drop_table('mentorship_requests')
