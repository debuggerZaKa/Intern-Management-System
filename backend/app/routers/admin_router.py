from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, get_current_admin
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.user import UserResponse
from app.schemas.internship import InternshipResponse
from app.services import admin_service, assignment_service, user_service, internship_service

router = APIRouter(prefix="/admin", tags=["Admin Management"])


@router.get("/users", response_model=List[UserResponse])
def list_users(
    role_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """View all registered users with optional role or status filters."""
    users = user_service.get_users(db, role_id=role_id, status_filter=status_filter)
    result = []
    for u in users:
        perms = [p.name for p in u.role.permissions] if u.role else []
        result.append(UserResponse(
            id=u.id,
            email=u.email,
            role_id=u.role_id,
            status=u.status,
            is_active=u.is_active,
            created_at=u.created_at,
            role=u.role,
            profile=u.profile,
            permissions=perms
        ))
    return result


@router.post("/users/create", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_account(
    email: str,
    password: str,
    full_name: str,
    role_name: str,
    department: Optional[str] = None,
    phone: Optional[str] = None,
    university: Optional[str] = None,
    degree: Optional[str] = None,
    semester: Optional[str] = None,
    duration_weeks: Optional[int] = 6,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin endpoint to directly create intern or mentor accounts."""
    if role_name not in ("intern", "mentor"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'intern' or 'mentor'"
        )

    user = admin_service.admin_create_user(
        db, email=email, password=password, full_name=full_name,
        role_name=role_name, actor=admin, department=department,
        phone=phone, university=university, degree=degree, semester=semester,
        duration_weeks=duration_weeks
    )
    perms = [p.name for p in user.role.permissions] if user.role else []
    return UserResponse(
        id=user.id, email=user.email, role_id=user.role_id,
        status=user.status, is_active=user.is_active, created_at=user.created_at,
        role=user.role, profile=user.profile, permissions=perms
    )


@router.put("/users/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Deactivate a user account while preserving historical data."""
    user = admin_service.admin_deactivate_user(db, user_id, actor=admin)
    perms = [p.name for p in user.role.permissions] if user.role else []
    return UserResponse(
        id=user.id, email=user.email, role_id=user.role_id,
        status=user.status, is_active=user.is_active, created_at=user.created_at,
        role=user.role, profile=user.profile, permissions=perms
    )


@router.put("/users/{user_id}/activate", response_model=UserResponse)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Activate a previously deactivated user account."""
    user = admin_service.admin_activate_user(
        db,
        user_id,
        actor=admin
    )
    perms = [p.name for p in user.role.permissions] if user.role else []
    return UserResponse(
        id=user.id,
        email=user.email,
        role_id=user.role_id,
        status=user.status,
        is_active=user.is_active,
        created_at=user.created_at,
        role=user.role,
        profile=user.profile,
        permissions=perms
    )


@router.put("/users/{user_id}/archive", response_model=UserResponse)
def archive_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Archive a user account while preserving historical records."""
    user = admin_service.admin_archive_user(db, user_id, actor=admin)
    perms = [p.name for p in user.role.permissions] if user.role else []
    return UserResponse(
        id=user.id, email=user.email, role_id=user.role_id,
        status=user.status, is_active=user.is_active, created_at=user.created_at,
        role=user.role, profile=user.profile, permissions=perms
    )


@router.post("/assignments", status_code=status.HTTP_201_CREATED)
def assign_or_reassign_mentor(
    internship_id: int,
    mentor_id: int,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Assign or reassign a mentor to an intern's internship, preserving full history."""
    assignment = assignment_service.assign_mentor(
        db, internship_id=internship_id, mentor_id=mentor_id,
        assigned_by=admin, notes=notes
    )
    return {
        "message": "Mentor assigned successfully",
        "assignment_id": assignment.id,
        "internship_id": assignment.internship_id,
        "intern_id": assignment.intern_id,
        "mentor_id": assignment.mentor_id,
        "is_active": assignment.is_active,
        "assigned_at": assignment.assigned_at
    }


@router.get("/assignments/history/{internship_id}")
def get_assignment_history(
    internship_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """View complete assignment and reassignment history for an internship."""
    history = assignment_service.get_assignment_history(db, internship_id)
    return [
        {
            "id": a.id,
            "internship_id": a.internship_id,
            "intern_id": a.intern_id,
            "mentor_id": a.mentor_id,
            "assigned_by_id": a.assigned_by_id,
            "assigned_at": a.assigned_at,
            "end_date": a.end_date,
            "is_active": a.is_active,
            "notes": a.notes
        }
        for a in history
    ]


@router.post("/bulk-import")
def bulk_import_interns_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Bulk import intern accounts from CSV or Excel (.xlsx) file."""
    return admin_service.bulk_import_interns(db, file, actor=admin)


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get system-wide analytics and progress statistics."""
    return admin_service.get_system_analytics(db)


@router.get("/signup-requests")
def get_signup_requests(
    status_filter: Optional[str] = "pending",
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """View user signup requests requiring approval."""
    from app.models.signup_request import SignupRequest
    query = db.query(SignupRequest)
    if status_filter:
        query = query.filter(SignupRequest.status == status_filter)
    reqs = query.all()
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "email": r.user.email if r.user else None,
            "full_name": r.user.profile.full_name if r.user and r.user.profile else None,
            "status": r.status,
            "created_at": r.created_at,
            "reviewed_by_id": r.reviewed_by_id,
            "reviewed_at": r.reviewed_at,
            "admin_notes": r.admin_notes
        }
        for r in reqs
    ]


@router.put("/signup-requests/{request_id}/approve")
def approve_signup_request(
    request_id: int,
    admin_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Approve a pending signup request."""
    req = admin_service.approve_signup(db, request_id, actor=admin, admin_notes=admin_notes)
    return {"message": "Signup request approved successfully", "request_id": req.id, "user_id": req.user_id}


@router.put("/signup-requests/{request_id}/reject")
def reject_signup_request(
    request_id: int,
    admin_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Reject a pending signup request."""
    req = admin_service.reject_signup(db, request_id, actor=admin, admin_notes=admin_notes)
    return {"message": "Signup request rejected", "request_id": req.id, "user_id": req.user_id}


@router.get("/audit-logs")
def view_audit_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """View system audit logs of security and administrative actions."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "actor_id": l.actor_id,
            "target_user_id": l.target_user_id,
            "action": l.action,
            "details": l.details,
            "ip_address": l.ip_address,
            "created_at": l.created_at
        }
        for l in logs
    ]
