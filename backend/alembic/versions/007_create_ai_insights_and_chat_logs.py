"""create ai insights and chat logs tables

Revision ID: 007_ai_insights
Revises: 006_feedback_evals
Create Date: 2026-08-26 19:46:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '007_ai_insights'
down_revision = '006_feedback_evals'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create ai_insights table
    op.create_table(
        'ai_insights',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('internship_id', sa.Integer(), nullable=False),
        sa.Column('report_id', sa.Integer(), nullable=True),
        sa.Column('type', sa.String(length=50), nullable=False, server_default='weekly_summary'),
        sa.Column('summary_text', sa.Text(), nullable=False),
        sa.Column('risk_level', sa.String(length=50), nullable=False, server_default='on_track'),
        sa.Column('generated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['internship_id'], ['internships.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['report_id'], ['weekly_reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_insights_id'), 'ai_insights', ['id'], unique=False)
    op.create_index(op.f('ix_ai_insights_internship_id'), 'ai_insights', ['internship_id'], unique=False)
    op.create_index(op.f('ix_ai_insights_report_id'), 'ai_insights', ['report_id'], unique=False)

    # Create ai_chat_logs table
    op.create_table(
        'ai_chat_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('query', sa.Text(), nullable=False),
        sa.Column('response', sa.Text(), nullable=False),
        sa.Column('context_type', sa.String(length=50), nullable=False, server_default='general'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_chat_logs_id'), 'ai_chat_logs', ['id'], unique=False)
    op.create_index(op.f('ix_ai_chat_logs_user_id'), 'ai_chat_logs', ['user_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_ai_chat_logs_user_id'), table_name='ai_chat_logs')
    op.drop_index(op.f('ix_ai_chat_logs_id'), table_name='ai_chat_logs')
    op.drop_table('ai_chat_logs')
    op.drop_index(op.f('ix_ai_insights_report_id'), table_name='ai_insights')
    op.drop_index(op.f('ix_ai_insights_internship_id'), table_name='ai_insights')
    op.drop_index(op.f('ix_ai_insights_id'), table_name='ai_insights')
    op.drop_table('ai_insights')
