"""certificate pipeline columns

Revision ID: 011_certificate_pipeline
Revises: 010_mentorship_requests
Create Date: 2026-09-02 17:04:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '011_certificate_pipeline'
down_revision: Union[str, None] = '010_mentorship_requests'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add certificate pipeline columns to internships
    op.add_column('internships', sa.Column('certificate_id', sa.String(length=100), nullable=True))
    op.add_column('internships', sa.Column('certificate_approved_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('internships', sa.Column('certificate_issued_at', sa.DateTime(timezone=True), nullable=True))

    # Add submitted_at to tasks (may already exist from migration 349ce81723a5 – use try/except pattern)
    try:
        op.add_column('tasks', sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True))
    except Exception:
        pass  # Column already exists


def downgrade() -> None:
    op.drop_column('internships', 'certificate_issued_at')
    op.drop_column('internships', 'certificate_approved_at')
    op.drop_column('internships', 'certificate_id')
    try:
        op.drop_column('tasks', 'submitted_at')
    except Exception:
        pass
