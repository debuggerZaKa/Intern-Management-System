"""create internships table

Revision ID: 003_internships
Revises: 002_users_profiles
Create Date: 2026-08-26 19:42:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '003_internships'
down_revision = '002_users_profiles'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'internships',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('intern_id', sa.Integer(), nullable=False),
        sa.Column('mentor_id', sa.Integer(), nullable=True),
        sa.Column('department', sa.String(length=100), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('current_week', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['intern_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['mentor_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_internships_id'), 'internships', ['id'], unique=False)
    op.create_index(op.f('ix_internships_intern_id'), 'internships', ['intern_id'], unique=False)
    op.create_index(op.f('ix_internships_mentor_id'), 'internships', ['mentor_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_internships_mentor_id'), table_name='internships')
    op.drop_index(op.f('ix_internships_intern_id'), table_name='internships')
    op.drop_index(op.f('ix_internships_id'), table_name='internships')
    op.drop_table('internships')
