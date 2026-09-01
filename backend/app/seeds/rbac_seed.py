import sys
from datetime import datetime, date, timedelta
from app.database import SessionLocal
from app.models.role import Role
from app.models.permission import Permission
from app.models.user import User
from app.models.profile import Profile
from app.models.internship import Internship
from app.models.project import Project
from app.models.task import Task
from app.auth.hashing import get_password_hash

# 1. System Roles
ROLES_DATA = [
    {"name": "admin", "description": "System Administrator managing accounts, internships, and security"},
    {"name": "mentor", "description": "Mentor supervising interns, creating projects/tasks, and evaluating progress"},
    {"name": "intern", "description": "Intern executing project tasks, submitting weekly reports, and logging deliverables"}
]

# 2. Complete Permissions
PERMISSIONS_DATA = [
    # User permissions
    {"name": "user:read", "description": "Read user profiles"},
    {"name": "user:update", "description": "Update user profiles or status"},
    {"name": "user:delete", "description": "Delete user accounts"},
    # Role permissions
    {"name": "role:read", "description": "Read roles and assigned permissions"},
    {"name": "role:update", "description": "Modify role permissions or assign roles"},
    # Internship permissions
    {"name": "internship:read", "description": "View internship details"},
    {"name": "internship:create", "description": "Create and assign internships"},
    {"name": "internship:update", "description": "Update internship timelines and status"},
    {"name": "internship:delete", "description": "Terminate internships"},
    # Project permissions
    {"name": "project:read", "description": "View projects"},
    {"name": "project:create", "description": "Create and assign new projects"},
    {"name": "project:update", "description": "Update project details and repo links"},
    {"name": "project:delete", "description": "Delete projects"},
    # Task permissions
    {"name": "task:read", "description": "View tasks"},
    {"name": "task:create", "description": "Create tasks"},
    {"name": "task:update", "description": "Update task progress and log hours"},
    {"name": "task:delete", "description": "Delete tasks"},
    # Report permissions
    {"name": "report:read", "description": "View weekly progress reports"},
    {"name": "report:create", "description": "Submit weekly progress reports"},
    {"name": "report:update", "description": "Update weekly report drafts"},
    {"name": "report:delete", "description": "Delete weekly reports"},
    # Blocker permissions
    {"name": "blocker:read", "description": "View blockers and impediments"},
    {"name": "blocker:create", "description": "Raise a blocker ticket"},
    {"name": "blocker:update", "description": "Update blocker status or resolve"},
    {"name": "blocker:delete", "description": "Delete blocker tickets"},
    # Feedback permissions
    {"name": "feedback:read", "description": "View mentor weekly feedback"},
    {"name": "feedback:create", "description": "Submit mentor weekly feedback"},
    {"name": "feedback:update", "description": "Update mentor weekly feedback"},
    {"name": "feedback:delete", "description": "Delete mentor feedback"},
    # Evaluation permissions
    {"name": "evaluation:read", "description": "View 6-week end-of-internship evaluation"},
    {"name": "evaluation:create", "description": "Submit final 6-week evaluation"},
    {"name": "evaluation:update", "description": "Update final evaluation"},
    {"name": "evaluation:delete", "description": "Delete final evaluation"},
    # AI permissions
    {"name": "ai:summarize", "description": "Generate AI summary from weekly report"},
    {"name": "ai:chat", "description": "Query AI assistant about intern progress"},
    {"name": "ai:admin_analytics", "description": "View executive AI analytics dashboard"}
]

# 3. Role to Permissions Mapping
# Admin is view-only (peek) for operational work items (Projects, Tasks, Reports, Evaluations), retaining administrative control over Users, Internships, Settings, and Audit.
ROLE_PERMISSIONS_MAPPING = {
    "admin": [
        "user:read", "user:update", "user:delete",
        "role:read", "role:update",
        "internship:read", "internship:create", "internship:update", "internship:delete",
        "project:read",
        "task:read",
        "report:read",
        "blocker:read",
        "feedback:read",
        "evaluation:read",
        "ai:summarize", "ai:chat", "ai:admin_analytics"
    ],
    "mentor": [
        "user:read",
        "internship:read", "internship:update",
        "project:read", "project:create", "project:update", "project:delete",
        "task:read", "task:create", "task:update", "task:delete",
        "report:read",
        "blocker:read", "blocker:update",
        "feedback:read", "feedback:create", "feedback:update",
        "evaluation:read", "evaluation:create", "evaluation:update",
        "ai:summarize", "ai:chat"
    ],
    "intern": [
        "internship:read",
        "project:read", "project:update",
        "task:read", "task:update",
        "report:read", "report:create", "report:update",
        "blocker:read", "blocker:create", "blocker:update",
        "feedback:read",
        "evaluation:read"
    ]
}

def seed_rbac():
    db = SessionLocal()
    try:
        print("Starting RBAC and Demo Accounts seeding...")
        
        # 1. Seed Roles
        role_objs = {}
        for r_data in ROLES_DATA:
            role = db.query(Role).filter(Role.name == r_data["name"]).first()
            if not role:
                role = Role(name=r_data["name"], description=r_data["description"])
                db.add(role)
                db.flush()
                print(f"  [+] Created Role: {role.name}")
            else:
                role.description = r_data["description"]
            role_objs[role.name] = role

        # 2. Seed Permissions
        perm_objs = {}
        for p_data in PERMISSIONS_DATA:
            perm = db.query(Permission).filter(Permission.name == p_data["name"]).first()
            if not perm:
                perm = Permission(name=p_data["name"], description=p_data["description"])
                db.add(perm)
                db.flush()
                print(f"  [+] Created Permission: {perm.name}")
            perm_objs[perm.name] = perm

        # 3. Synchronize Role Permissions
        for role_name, allowed_p_names in ROLE_PERMISSIONS_MAPPING.items():
            role = role_objs[role_name]
            target_perms = [perm_objs[p] for p in allowed_p_names if p in perm_objs]
            role.permissions = target_perms
            print(f"  [+] Synchronized {len(target_perms)} permissions for Role '{role_name}'")

        # 4. Seed Default Admin Account
        admin_role = role_objs["admin"]
        admin_user = db.query(User).filter(User.email == "admin@netsol.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@netsol.com",
                hashed_password=get_password_hash("Admin@123"),
                role_id=admin_role.id,
                status="active",
                is_active=True
            )
            db.add(admin_user)
            db.flush()
            admin_profile = Profile(
                user_id=admin_user.id,
                full_name="NETSOL Administrator",
                department="Management & HR",
                phone="+92-42-111-638-765"
            )
            db.add(admin_profile)
            print("  [+] Created Admin: admin@netsol.com / Admin@123")

        # 5. Seed Default Mentor Account
        mentor_role = role_objs["mentor"]
        mentor_user = db.query(User).filter(User.email == "mentor@netsol.com").first()
        if not mentor_user:
            mentor_user = User(
                email="mentor@netsol.com",
                hashed_password=get_password_hash("Password@123"),
                role_id=mentor_role.id,
                status="active",
                is_active=True
            )
            db.add(mentor_user)
            db.flush()
            mentor_profile = Profile(
                user_id=mentor_user.id,
                full_name="Dr. Sarah Tariq",
                department="Cloud & Distributed Systems",
                phone="+92-300-1234567",
                bio="Lead Systems Architect with 12+ years experience in distributed systems."
            )
            db.add(mentor_profile)
            print("  [+] Created Mentor: mentor@netsol.com / Password@123")

        # 6. Seed Default Intern Account
        intern_role = role_objs["intern"]
        intern_user = db.query(User).filter(User.email == "ahmed.khan@netsol.com").first()
        if not intern_user:
            intern_user = User(
                email="ahmed.khan@netsol.com",
                hashed_password=get_password_hash("Password@123"),
                role_id=intern_role.id,
                status="active",
                is_active=True
            )
            db.add(intern_user)
            db.flush()
            intern_profile = Profile(
                user_id=intern_user.id,
                full_name="Ahmed Khan",
                department="Enterprise Software Solutions",
                university="FAST NUCES Lahore",
                degree="BS Computer Science",
                semester="7th Semester",
                phone="+92-321-9876543"
            )
            db.add(intern_profile)
            print("  [+] Created Intern: ahmed.khan@netsol.com / Password@123")

        # 7. Seed Active Internship Link
        if intern_user and mentor_user:
            active_internship = db.query(Internship).filter(Internship.intern_id == intern_user.id).first()
            if not active_internship:
                active_internship = Internship(
                    intern_id=intern_user.id,
                    mentor_id=mentor_user.id,
                    department="Enterprise Software Solutions",
                    start_date=date.today() - timedelta(days=14),
                    end_date=date.today() + timedelta(days=28),
                    current_week=3,
                    status="active"
                )
                db.add(active_internship)
                db.flush()
                print(f"  [+] Created Active Internship: Ahmed Khan supervised by Dr. Sarah Tariq (Week 3)")

            # 8. Seed Default Sample Projects
            p1 = db.query(Project).filter(Project.internship_id == active_internship.id, Project.title == "NETSOL Financial Cloud Engine").first()
            if not p1:
                p1 = Project(
                    internship_id=active_internship.id,
                    title="NETSOL Financial Cloud Engine",
                    description="Core leasing calculation engine, REST API microservices, and PostgreSQL database architecture.",
                    technologies="FastAPI, PostgreSQL, Docker, Redis",
                    repo_url="https://github.com/NETSOL/financial-cloud-engine",
                    status="in_progress"
                )
                db.add(p1)
                db.flush()
                print("  [+] Created Sample Project: NETSOL Financial Cloud Engine")

            p2 = db.query(Project).filter(Project.internship_id == active_internship.id, Project.title == "Enterprise AI Assistant Portal").first()
            if not p2:
                p2 = Project(
                    internship_id=active_internship.id,
                    title="Enterprise AI Assistant Portal",
                    description="Llama 3.3 integration for automated report summarization, risk assessment, and cohort analytics.",
                    technologies="React, Vite, Tailwind CSS, Python",
                    repo_url="https://github.com/NETSOL/enterprise-ai-portal",
                    status="not_started"
                )
                db.add(p2)
                db.flush()
                print("  [+] Created Sample Project: Enterprise AI Assistant Portal")

            # Seed initial sample tasks attached to projects
            t1 = db.query(Task).filter(Task.project_id == p1.id, Task.title == "Setup PostgreSQL database schemas and Alembic migrations").first()
            if not t1:
                t1 = Task(
                    project_id=p1.id,
                    intern_id=intern_user.id,
                    title="Setup PostgreSQL database schemas and Alembic migrations",
                    description="Define SQLAlchemy ORM models and run migration scripts.",
                    priority="high",
                    status="done",
                    week_number=1,
                    estimated_hours=6.0,
                    actual_hours=5.5
                )
                db.add(t1)

            t2 = db.query(Task).filter(Task.project_id == p1.id, Task.title == "Implement JWT authentication and RBAC middleware").first()
            if not t2:
                t2 = Task(
                    project_id=p1.id,
                    intern_id=intern_user.id,
                    title="Implement JWT authentication and RBAC middleware",
                    description="Configure password hashing, JWT bearer verification, and role dependencies.",
                    priority="critical",
                    status="in_progress",
                    week_number=2,
                    estimated_hours=8.0,
                    actual_hours=4.0
                )
                db.add(t2)

        db.commit()
        print("RBAC, Projects, and Demo Accounts seeding successfully completed!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding RBAC: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_rbac()
