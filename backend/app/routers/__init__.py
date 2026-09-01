from app.routers.auth_router import router as auth_router
from app.routers.admin_router import router as admin_router
from app.routers.mentor_router import router as mentor_router
from app.routers.intern_router import router as intern_router
from app.routers.signup_router import router as signup_router
from app.routers.user_router import router as user_router
from app.routers.role_router import router as role_router
from app.routers.internship_router import router as internship_router
from app.routers.project_router import router as project_router
from app.routers.task_router import router as task_router
from app.routers.report_router import router as report_router
from app.routers.blocker_router import router as blocker_router
from app.routers.feedback_router import router as feedback_router
from app.routers.evaluation_router import router as evaluation_router
from app.routers.ai_router import router as ai_router
from app.routers.settings_router import router as settings_router

__all__ = [
    "auth_router",
    "admin_router",
    "mentor_router",
    "intern_router",
    "signup_router",
    "user_router",
    "role_router",
    "internship_router",
    "project_router",
    "task_router",
    "report_router",
    "blocker_router",
    "feedback_router",
    "evaluation_router",
    "ai_router",
    "settings_router"
]
