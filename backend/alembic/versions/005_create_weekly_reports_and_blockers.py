"""create weekly reports and blockers tables

Revision ID: 005_reports_blockers
Revises: 004_projects_tasks
Create Date: 2026-08-26 19:44:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '005_reports_blockers'
down_revision = '004_projects_tasks'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create weekly_reports table
    op.create_table(
        'weekly_reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('internship_id', sa.Integer(), nullable=False),
        sa.Column('week_number', sa.Integer(), nullable=False),
        sa.Column('tasks_completed_summary', sa.Text(), nullable=True),
        sa.Column('tasks_in_progress_summary', sa.Text(), nullable=True),
        sa.Column('learnings_and_skills', sa.Text(), nullable=True),
        sa.Column('goals_next_week', sa.Text(), nullable=True),
        sa.Column('self_rating_productivity', sa.Integer(), nullable=True, server_default='5'),
        sa.Column('self_rating_confidence', sa.Integer(), nullable=True, server_default='5'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='submitted'),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['internship_id'], ['internships.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_weekly_reports_id'), 'weekly_reports', ['id'], unique=False)
    op.create_index(op.f('ix_weekly_reports_internship_id'), 'weekly_reports', ['internship_id'], unique=False)

    # Create blockers table
    op.create_table(
        'blockers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('report_id', sa.Integer(), nullable=False),
        sa.Column('intern_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False, server_default='moderate'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='unresolved'),
        sa.Column('help_needed', sa.Text(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['intern_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['report_id'], ['weekly_reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_blockers_id'), 'blockers', ['id'], unique=False)
    op.create_index(op.f('ix_blockers_intern_id'), 'blockers', ['intern_id'], unique=False)
    op.create_index(op.f('ix_blockers_report_id'), 'blockers', ['report_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_blockers_report_id'), table_name='blockers')
    op.drop_index(op.f('ix_blockers_intern_id'), table_name='blockers')
    op.drop_index(op.f('ix_blockers_id'), table_name='blockers')
    op.drop_table('blockers')
    op.drop_index(op.f('ix_weekly_reports_internship_id'), table_name='weekly_reports')
    op.drop_index(op.f('ix_weekly_reports_id'), table_name='weekly_reports')
    op.drop_table('weekly_reports')
