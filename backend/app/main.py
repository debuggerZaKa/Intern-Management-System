import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import (
    auth_router,
    admin_router,
    mentor_router,
    intern_router,
    signup_router,
    user_router,
    role_router,
    internship_router,
    project_router,
    task_router,
    report_router,
    blocker_router,
    feedback_router,
    evaluation_router,
    ai_router,
    settings_router
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Configurable CORS origins — includes frontend origins
origins = settings.cors_origins if settings.cors_origins else ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Mount Routers under API V1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(signup_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(mentor_router, prefix=settings.API_V1_STR)
app.include_router(intern_router, prefix=settings.API_V1_STR)
app.include_router(user_router, prefix=settings.API_V1_STR)
app.include_router(role_router, prefix=settings.API_V1_STR)
app.include_router(internship_router, prefix=settings.API_V1_STR)
app.include_router(project_router, prefix=settings.API_V1_STR)
app.include_router(task_router, prefix=settings.API_V1_STR)
app.include_router(report_router, prefix=settings.API_V1_STR)
app.include_router(blocker_router, prefix=settings.API_V1_STR)
app.include_router(feedback_router, prefix=settings.API_V1_STR)
app.include_router(evaluation_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": "Welcome to AI-Powered Intern Progress Management System API",
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "online",
        "cors_origins": origins
    }
