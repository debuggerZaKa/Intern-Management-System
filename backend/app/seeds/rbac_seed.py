"""
RBAC Seed Script
Populates initial roles, permissions, and role_permission mappings.
Safe to execute multiple times (idempotent).
"""

from app.database import SessionLocal
from app.models.role import Role
from app.models.permission import Permission
from app.models.user import User
from app.models.profile import Profile
from app.auth.hashing import get_password_hash

ROLES_DATA = [
    {"name": "admin", "description": "System Administrator with full management access"},
    {"name": "mentor", "description": "Internship Mentor supervising assigned interns"},
    {"name": "intern", "description": "Intern with access to projects, tasks, and weekly reports"},
]

PERMISSIONS_DATA = [
    # User permissions
    {"name": "user:read", "description": "View user profiles and lists"},
    {"name": "user:update", "description": "Update user accounts and status"},
    {"name": "user:delete", "description": "Deactivate or delete users"},

    # Role permissions
    {"name": "role:read", "description": "View roles and assigned permissions"},
    {"name": "role:update", "description": "Change user roles and role configurations"},

    # Internship permissions
    {"name": "internship:read", "description": "View internship timelines and details"},
    {"name": "internship:create", "description": "Create and assign new internships"},
    {"name": "internship:update", "description": "Update internship timelines and mentors"},
    {"name": "internship:delete", "description": "Terminate or delete internships"},

    # Project permissions
    {"name": "project:read", "description": "View internship projects"},
    {"name": "project:create", "description": "Create new projects"},
    {"name": "project:update", "description": "Update existing projects"},
    {"name": "project:delete", "description": "Delete projects"},

    # Task permissions
    {"name": "task:read", "description": "View Kanban tasks"},
    {"name": "task:create", "description": "Create new tasks"},
    {"name": "task:update", "description": "Update task status and hours"},
    {"name": "task:delete", "description": "Delete tasks"},

    # Report permissions
    {"name": "report:read", "description": "View weekly progress reports"},
    {"name": "report:create", "description": "Submit weekly progress reports"},
    {"name": "report:update", "description": "Edit weekly progress reports"},
    {"name": "report:delete", "description": "Delete weekly reports"},

    # Blocker permissions
    {"name": "blocker:read", "description": "View reported blockers"},
    {"name": "blocker:create", "description": "Report a new blocker"},
    {"name": "blocker:update", "description": "Update or resolve blockers"},
    {"name": "blocker:delete", "description": "Delete blockers"},

    # Feedback permissions
    {"name": "feedback:read", "description": "Read mentor feedback"},
    {"name": "feedback:create", "description": "Submit weekly mentor feedback"},
    {"name": "feedback:update", "description": "Edit mentor feedback"},
    {"name": "feedback:delete", "description": "Delete feedback"},

    # Evaluation permissions
    {"name": "evaluation:read", "description": "Read 6-week final evaluations"},
    {"name": "evaluation:create", "description": "Submit 6-week final evaluation"},
    {"name": "evaluation:update", "description": "Edit final evaluation"},
    {"name": "evaluation:delete", "description": "Delete evaluation"},

    # AI permissions
    {"name": "ai:summarize", "description": "Generate AI summaries of reports"},
    {"name": "ai:chat", "description": "Use AI natural language Q&A assistant"},
    {"name": "ai:admin_analytics", "description": "Access system-wide AI analytics"},
]

ROLE_PERMISSIONS_MAPPING = {
    "intern": [
        "project:read", "project:create", "project:update", "project:delete",
        "task:read", "task:create", "task:update", "task:delete",
        "report:read", "report:create", "report:update",
        "blocker:read", "blocker:create", "blocker:update",
        "feedback:read",
        "evaluation:read",
        "internship:read",
    ],
    "mentor": [
        "internship:read", "internship:update",
        "project:read",
        "task:read",
        "report:read",
        "blocker:read", "blocker:update",
        "feedback:read", "feedback:create", "feedback:update",
        "evaluation:read", "evaluation:create", "evaluation:update",
        "ai:summarize", "ai:chat",
    ],
    "admin": [
        # Admin has all permissions
        p["name"] for p in PERMISSIONS_DATA
    ]
}

def seed_rbac():
    db = SessionLocal()
    try:
        print("Starting RBAC seeding...")

        # 1. Seed Roles
        role_objs = {}
        for r_data in ROLES_DATA:
            role = db.query(Role).filter(Role.name == r_data["name"]).first()
            if not role:
                role = Role(name=r_data["name"], description=r_data["description"])
                db.add(role)
                db.flush()
                print(f"  [+] Created Role: {role.name}")
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

        # 3. Associate Permissions with Roles
        for role_name, perm_names in ROLE_PERMISSIONS_MAPPING.items():
            role = role_objs[role_name]
            current_perms = {p.name for p in role.permissions}
            
            for p_name in perm_names:
                if p_name in perm_objs and p_name not in current_perms:
                    role.permissions.append(perm_objs[p_name])
                    print(f"  [+] Assigned '{p_name}' to Role '{role_name}'")

        # 4. Seed Default Admin Account if not present
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
                department="Management",
                phone="+92-42-111-638-765"
            )
            db.add(admin_profile)
            print("  [+] Created default Admin user (admin@netsol.com / Admin@123)")

        db.commit()
        print("RBAC seeding successfully completed!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding RBAC: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_rbac()
