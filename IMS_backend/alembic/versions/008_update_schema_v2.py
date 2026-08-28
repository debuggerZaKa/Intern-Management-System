"""update_schema_v2

Revision ID: 008_update_schema_v2
Revises: 007_create_ai_insights_and_chat_logs
Create Date: 2026-08-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '008_update_schema_v2'
down_revision = '007_create_ai_insights_and_chat_logs'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create signup_requests table
    op.create_table(
        'signup_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('reviewed_by_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_signup_requests_id'), 'signup_requests', ['id'], unique=False)
    op.create_index(op.f('ix_signup_requests_status'), 'signup_requests', ['status'], unique=False)
    op.create_index(op.f('ix_signup_requests_user_id'), 'signup_requests', ['user_id'], unique=True)

    # 2. Create mentor_intern_assignments table
    op.create_table(
        'mentor_intern_assignments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('internship_id', sa.Integer(), sa.ForeignKey('internships.id', ondelete='CASCADE'), nullable=False),
        sa.Column('intern_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('mentor_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('assigned_by_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mentor_intern_assignments_id'), 'mentor_intern_assignments', ['id'], unique=False)
    op.create_index(op.f('ix_mentor_intern_assignments_internship_id'), 'mentor_intern_assignments', ['internship_id'], unique=False)
    op.create_index(op.f('ix_mentor_intern_assignments_intern_id'), 'mentor_intern_assignments', ['intern_id'], unique=False)
    op.create_index(op.f('ix_mentor_intern_assignments_mentor_id'), 'mentor_intern_assignments', ['mentor_id'], unique=False)
    op.create_index(op.f('ix_mentor_intern_assignments_is_active'), 'mentor_intern_assignments', ['is_active'], unique=False)

    # 3. Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('actor_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('target_user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'], unique=False)
    op.create_index(op.f('ix_audit_logs_actor_id'), 'audit_logs', ['actor_id'], unique=False)

    # 4. Alter internships table
    op.add_column('internships', sa.Column('duration_weeks', sa.Integer(), server_default='6', nullable=False))
    op.add_column('internships', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))

    # 5. Alter tasks table
    op.add_column('tasks', sa.Column('created_by_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True))
    op.add_column('tasks', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    op.create_index(op.f('ix_tasks_created_by_id'), 'tasks', ['created_by_id'], unique=False)

    # 6. Alter weekly_reports table
    op.add_column('weekly_reports', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    op.create_unique_constraint('uq_report_internship_week', 'weekly_reports', ['internship_id', 'week_number'])

    # 7. Alter ai_insights table
    op.add_column('ai_insights', sa.Column('progress_status', sa.String(length=50), server_default='on_track', nullable=False))
    op.add_column('ai_insights', sa.Column('risk_score', sa.Float(), nullable=True))
    op.add_column('ai_insights', sa.Column('detected_skills', sa.Text(), nullable=True))
    op.add_column('ai_insights', sa.Column('blockers_summary', sa.Text(), nullable=True))
    op.add_column('ai_insights', sa.Column('recommendations', sa.Text(), nullable=True))
    op.add_column('ai_insights', sa.Column('needs_mentor_attention', sa.Integer(), server_default='0', nullable=False))

    # 8. Alter profiles, projects, blockers, evaluation
    op.add_column('profiles', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    op.add_column('projects', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    op.add_column('blockers', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    op.add_column('end_of_internship_evaluations', sa.Column('ai_summary', sa.Text(), nullable=True))
    op.add_column('end_of_internship_evaluations', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('mentor_intern_assignments')
    op.drop_table('signup_requests')
