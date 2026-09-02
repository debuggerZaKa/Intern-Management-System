"""add task submission fields

Revision ID: 349ce81723a5
Revises: 009_settings_and_resets
Create Date: 2026-09-02 11:28:26.996694

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '349ce81723a5'
down_revision: Union[str, None] = '009_settings_and_resets'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column("mentor_notes", sa.Text(), nullable=True)
    )
    op.add_column(
        "tasks",
        sa.Column("submission_notes", sa.Text(), nullable=True)
    )
    op.add_column(
        "tasks",
        sa.Column("submission_url", sa.String(length=500), nullable=True)
    )
    op.add_column(
        "tasks",
        sa.Column("attachment_url", sa.String(length=500), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("tasks", "attachment_url")
    op.drop_column("tasks", "submission_url")
    op.drop_column("tasks", "submission_notes")
    op.drop_column("tasks", "mentor_notes")