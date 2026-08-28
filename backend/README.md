# AI-Powered Intern Progress Management System — Backend

FastAPI + PostgreSQL + SQLAlchemy ORM + Alembic backend with Database-Driven Role-Based Access Control (RBAC) and modular layered structure.

---

## 📁 Directory Structure

```text
backend/
├── alembic/                         # Database migrations
│   ├── versions/
│   │   ├── 001_create_roles_and_permissions.py
│   │   ├── 002_create_users_and_profiles.py
│   │   ├── 003_create_internships.py
│   │   ├── 004_create_projects_and_tasks.py
│   │   ├── 005_create_weekly_reports_and_blockers.py
│   │   ├── 006_create_feedback_and_evaluations.py
│   │   └── 007_create_ai_insights_and_chat_logs.py
│   ├── env.py
│   └── script.py.mako
│
├── app/
│   ├── auth/                        # Authentication & Authorization Layer
│   │   ├── decorators.py            # @require_permission("...")
│   │   ├── dependencies.py          # get_current_user, get_db
│   │   ├── hashing.py               # Pure bcrypt password hashing & verification
│   │   └── jwt_handler.py           # JWT creation & validation
│   │
│   ├── constants/
│   │   └── permissions.py           # Fixed permission constants
│   │
│   ├── models/                      # SQLAlchemy ORM Models
│   │   ├── role.py                  # Role model
│   │   ├── permission.py            # Permission model
│   │   ├── role_permission.py       # role_permissions association table
│   │   ├── user.py                  # User model (role_id FK -> roles.id)
│   │   ├── profile.py               # Profile model
│   │   ├── internship.py            # Internship model
│   │   ├── project.py               # Project model
│   │   ├── task.py                  # Task model (Kanban status, priority, hours)
│   │   ├── report.py                # WeeklyReport model
│   │   ├── blocker.py               # Blocker model (severity, status)
│   │   ├── feedback.py              # MentorFeedback model
│   │   ├── evaluation.py            # EndOfInternshipEvaluation model
│   │   └── ai_insight.py            # AIInsight & AIChatLog models
│   │
│   ├── routers/                     # FastAPI Route Endpoints
│   │   ├── auth_router.py           # /auth/register, /auth/login, /auth/me
│   │   ├── user_router.py           # /users (list, update role, delete, approve)
│   │   ├── role_router.py           # /roles, /roles/{id}/permissions
│   │   ├── internship_router.py     # /internships, /internships/assign
│   │   ├── project_router.py        # /projects (CRUD, ownership checks)
│   │   ├── task_router.py           # /tasks (CRUD, Kanban status, priority)
│   │   ├── report_router.py         # /reports (draft, submit, review)
│   │   ├── blocker_router.py        # /blockers (raise, resolve)
│   │   ├── feedback_router.py       # /feedback (mentor reviews)
│   │   ├── evaluation_router.py     # /evaluations (6-week final review)
│   │   └── ai_router.py             # /ai/summarize-report, /ai/chat, /ai/final-summary
│   │
│   ├── schemas/                     # Pydantic Request/Response Models
│   │   ├── auth.py, user.py, role.py, internship.py, project.py,
│   │   ├── task.py, report.py, blocker.py, feedback.py, evaluation.py, ai.py
│   │
│   ├── seeds/
│   │   └── rbac_seed.py             # Idempotent seed script for roles, permissions, admin
│   │
│   ├── services/                    # Business Logic Layer
│   │   ├── user_service.py, role_service.py, internship_service.py, project_service.py,
│   │   ├── task_service.py, report_service.py, blocker_service.py, feedback_service.py,
│   │   ├── evaluation_service.py, ai_service.py
│   │
│   ├── config.py                    # Environment settings
│   ├── database.py                  # Database engine & sessionmaker
│   └── main.py                      # FastAPI App initialization & route mounting
│
├── venv/                            # Virtual environment
├── .env                             # Environment variables
├── alembic.ini                      # Alembic configuration
├── requirements.txt                 # Python dependencies
└── test_api.py                      # Automated test suite
```

---

## 🚀 Quick Start Guide

### 1. Activate Virtual Environment
```bash
# Windows
.\venv\Scripts\activate
```

### 2. Run Database Migrations Step-by-Step
```bash
alembic upgrade 001_roles_perms
alembic upgrade 002_users_profiles
alembic upgrade 003_internships
alembic upgrade 004_projects_tasks
alembic upgrade 005_reports_blockers
alembic upgrade 006_feedback_evals
alembic upgrade 007_ai_insights
# Or upgrade to head:
alembic upgrade head
```

### 3. Run the RBAC Seed Script
Populates initial roles (`admin`, `mentor`, `intern`), permissions, mappings, and creates default Admin (`admin@netsol.com` / `Admin@123`):
```bash
python -m app.seeds.rbac_seed
```

### 4. Start the Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/api/v1/docs](http://127.0.0.1:8000/api/v1/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/api/v1/redoc](http://127.0.0.1:8000/api/v1/redoc)

### 5. Run Automated Tests
```bash
pytest -v test_api.py
```
