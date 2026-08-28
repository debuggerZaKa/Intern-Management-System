from app.services.role_service import get_all_roles, get_role_by_id, get_role_by_name, get_role_permissions
from app.services.user_service import get_users, get_user_by_id, get_user_by_email, register_user, authenticate_user, update_user_role, update_user_status, update_profile, delete_user
from app.services.internship_service import get_internships, get_internship_by_id, get_intern_active_internship, create_internship, update_internship
from app.services.project_service import get_projects, get_project_by_id, create_project, update_project, delete_project
from app.services.task_service import get_tasks, get_task_by_id, create_task, update_task, delete_task
from app.services.report_service import get_reports, get_report_by_id, submit_weekly_report, update_weekly_report
from app.services.blocker_service import get_blockers, get_blocker_by_id, create_blocker, update_blocker
from app.services.feedback_service import get_feedback_for_report, get_feedbacks_by_mentor, create_feedback, update_feedback
from app.services.evaluation_service import get_evaluation, create_evaluation, update_evaluation
from app.services.ai_service import summarize_weekly_report, handle_ai_chat, generate_final_summary
from app.services.admin_service import admin_create_user, admin_deactivate_user, admin_archive_user, approve_signup, reject_signup, bulk_import_interns, get_system_analytics
from app.services.assignment_service import assign_mentor, get_assignment_history, get_active_assignment
from app.services.audit_service import log_action

__all__ = [
    "get_all_roles",
    "get_role_by_id",
    "get_role_by_name",
    "get_role_permissions",
    "get_users",
    "get_user_by_id",
    "get_user_by_email",
    "register_user",
    "authenticate_user",
    "update_user_role",
    "update_user_status",
    "update_profile",
    "delete_user",
    "get_internships",
    "get_internship_by_id",
    "get_intern_active_internship",
    "create_internship",
    "update_internship",
    "get_projects",
    "get_project_by_id",
    "create_project",
    "update_project",
    "delete_project",
    "get_tasks",
    "get_task_by_id",
    "create_task",
    "update_task",
    "delete_task",
    "get_reports",
    "get_report_by_id",
    "submit_weekly_report",
    "update_weekly_report",
    "get_blockers",
    "get_blocker_by_id",
    "create_blocker",
    "update_blocker",
    "get_feedback_for_report",
    "get_feedbacks_by_mentor",
    "create_feedback",
    "update_feedback",
    "get_evaluation",
    "create_evaluation",
    "update_evaluation",
    "summarize_weekly_report",
    "handle_ai_chat",
    "generate_final_summary",
    "admin_create_user",
    "admin_deactivate_user",
    "admin_archive_user",
    "approve_signup",
    "reject_signup",
    "bulk_import_interns",
    "get_system_analytics",
    "assign_mentor",
    "get_assignment_history",
    "get_active_assignment",
    "log_action",
]
