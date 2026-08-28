"""create mentor feedbacks and evaluations tables

Revision ID: 006_feedback_evals
Revises: 005_reports_blockers
Create Date: 2026-08-26 19:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '006_feedback_evals'
down_revision = '005_reports_blockers'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create mentor_feedbacks table
    op.create_table(
        'mentor_feedbacks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('report_id', sa.Integer(), nullable=False),
        sa.Column('mentor_id', sa.Integer(), nullable=False),
        sa.Column('feedback_text', sa.Text(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('category', sa.String(length=50), nullable=False, server_default='meeting_expectations'),
        sa.Column('action_items', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['mentor_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['report_id'], ['weekly_reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('report_id')
    )
    op.create_index(op.f('ix_mentor_feedbacks_id'), 'mentor_feedbacks', ['id'], unique=False)
    op.create_index(op.f('ix_mentor_feedbacks_mentor_id'), 'mentor_feedbacks', ['mentor_id'], unique=False)

    # Create end_of_internship_evaluations table
    op.create_table(
        'end_of_internship_evaluations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('internship_id', sa.Integer(), nullable=False),
        sa.Column('mentor_id', sa.Integer(), nullable=False),
        sa.Column('overall_rating', sa.Float(), nullable=False, server_default='8.0'),
        sa.Column('technical_skills_rating', sa.Float(), nullable=True, server_default='4.0'),
        sa.Column('soft_skills_rating', sa.Float(), nullable=True, server_default='4.0'),
        sa.Column('strengths', sa.Text(), nullable=True),
        sa.Column('areas_for_improvement', sa.Text(), nullable=True),
        sa.Column('recommendation', sa.String(length=50), nullable=False, server_default='hire'),
        sa.Column('final_comments', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['internship_id'], ['internships.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['mentor_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('internship_id')
    )
    op.create_index(op.f('ix_end_of_internship_evaluations_id'), 'end_of_internship_evaluations', ['id'], unique=False)
    op.create_index(op.f('ix_end_of_internship_evaluations_mentor_id'), 'end_of_internship_evaluations', ['mentor_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_end_of_internship_evaluations_mentor_id'), table_name='end_of_internship_evaluations')
    op.drop_index(op.f('ix_end_of_internship_evaluations_id'), table_name='end_of_internship_evaluations')
    op.drop_table('end_of_internship_evaluations')
    op.drop_index(op.f('ix_mentor_feedbacks_mentor_id'), table_name='mentor_feedbacks')
    op.drop_index(op.f('ix_mentor_feedbacks_id'), table_name='mentor_feedbacks')
    op.drop_table('mentor_feedbacks')
