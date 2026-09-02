import csv
import io
from datetime import datetime, timezone, date, timedelta
from typing import Dict, List, Optional, Any

import openpyxl
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.internship import Internship
from app.models.profile import Profile
from app.models.role import Role
from app.models.signup_request import SignupRequest
from app.models.task import Task
from app.models.user import User
from app.models.report import WeeklyReport
from app.auth.hashing import get_password_hash
from app.services.audit_service import log_action


def _ensure_active_internship(db: Session, intern_user: User, duration_weeks: Optional[int] = None) -> Internship:
    """Helper to auto-create an active internship for an intern if none exists."""
    weeks = duration_weeks if (duration_weeks is not None and duration_weeks > 0) else settings.INTERNSHIP_DURATION_WEEKS
    existing = db.query(Internship).filter(
        Internship.intern_id == intern_user.id,
        Internship.status == "active"
    ).first()
    if existing:
        if duration_weeks is not None and duration_weeks > 0 and existing.duration_weeks != duration_weeks:
            existing.duration_weeks = weeks
            existing.end_date = existing.start_date + timedelta(weeks=weeks)
            db.flush()
        return existing

    today = date.today()
    end_date = today + timedelta(weeks=weeks)
    dept = (
        intern_user.profile.department
        if (intern_user.profile and intern_user.profile.department)
        else "Engineering"
    )

    internship = Internship(
        intern_id=intern_user.id,
        department=dept,
        start_date=today,
        end_date=end_date,
        duration_weeks=weeks,
        current_week=1,
        status="active"
    )
    db.add(internship)
    db.flush()
    return internship


def admin_create_user(
    db: Session,
    email: str,
    password: str,
    full_name: str,
    role_name: str,
    actor: User,
    department: Optional[str] = None,
    phone: Optional[str] = None,
    university: Optional[str] = None,
    degree: Optional[str] = None,
    semester: Optional[str] = None,
    duration_weeks: Optional[int] = None,
) -> User:
    email = email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Role '{role_name}' not found")

    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        role_id=role.id,
        status="active",
        is_active=True,
    )
    db.add(user)
    db.flush()

    profile = Profile(
        user_id=user.id,
        full_name=full_name,
        phone=phone,
        university=university,
        degree=degree,
        semester=semester,
        department=department,
    )
    db.add(profile)
    db.flush()

    # Automatically create an active internship if the created user is an intern
    if role_name == "intern":
        _ensure_active_internship(db, user, duration_weeks=duration_weeks)

    log_action(db, "user_created", actor_id=actor.id, target_user_id=user.id,
               details={"email": email, "role": role_name, "duration_weeks": duration_weeks})
    db.commit()
    db.refresh(user)
    return user


def admin_deactivate_user(db: Session, user_id: int, actor: User) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == actor.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot deactivate own account")

    user.status = "deactivated"
    user.is_active = False
    log_action(db, "account_deactivated", actor_id=actor.id, target_user_id=user.id)
    db.commit()
    db.refresh(user)
    return user


def admin_activate_user(db: Session, user_id: int, actor: User) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if user.status == "archived":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Archived users cannot be activated"
        )
    if user.status == "active" and user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already active"
        )
    if user.status != "deactivated":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only deactivated users can be activated"
        )

    user.status = "active"
    user.is_active = True
    log_action(db, "account_activated", actor_id=actor.id, target_user_id=user.id)
    db.commit()
    db.refresh(user)
    return user


def admin_archive_user(db: Session, user_id: int, actor: User) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == actor.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot archive own account")

    user.status = "archived"
    user.is_active = False
    log_action(db, "account_archived", actor_id=actor.id, target_user_id=user.id)
    db.commit()
    db.refresh(user)
    return user


def approve_signup(db: Session, request_id: int, actor: User, admin_notes: Optional[str] = None) -> SignupRequest:
    req = db.query(SignupRequest).filter(SignupRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signup request not found")
    if req.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Request is already {req.status}")

    req.status = "approved"
    req.reviewed_by_id = actor.id
    req.reviewed_at = datetime.now(timezone.utc)
    req.admin_notes = admin_notes

    req.user.status = "active"
    req.user.is_active = True

    # Automatically initialize active internship for the approved intern
    if req.user.role and req.user.role.name == "intern":
        _ensure_active_internship(db, req.user)

    log_action(db, "signup_approved", actor_id=actor.id, target_user_id=req.user_id,
               details={"request_id": request_id})
    db.commit()
    db.refresh(req)
    return req


def reject_signup(db: Session, request_id: int, actor: User, admin_notes: Optional[str] = None) -> SignupRequest:
    req = db.query(SignupRequest).filter(SignupRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signup request not found")
    if req.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Request is already {req.status}")

    req.status = "rejected"
    req.reviewed_by_id = actor.id
    req.reviewed_at = datetime.now(timezone.utc)
    req.admin_notes = admin_notes

    req.user.status = "rejected"
    req.user.is_active = False

    log_action(db, "signup_rejected", actor_id=actor.id, target_user_id=req.user_id,
               details={"request_id": request_id})
    db.commit()
    db.refresh(req)
    return req


def get_system_analytics(db: Session) -> Dict[str, Any]:
    from app.models.task import Task
    from app.models.blocker import Blocker

    intern_role = db.query(Role).filter(Role.name == "intern").first()
    mentor_role = db.query(Role).filter(Role.name == "mentor").first()
    admin_role = db.query(Role).filter(Role.name == "admin").first()

    interns_count = db.query(User).filter(User.role_id == intern_role.id).count() if intern_role else 0
    mentors_count = db.query(User).filter(User.role_id == mentor_role.id).count() if mentor_role else 0
    admins_count = db.query(User).filter(User.role_id == admin_role.id).count() if admin_role else 0

    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()

    active_internships = db.query(Internship).filter(Internship.status == "active").count()
    completed_internships = db.query(Internship).filter(Internship.status == "completed").count()

    total_tasks = db.query(Task).count()
    total_reports = db.query(WeeklyReport).count()
    pending_signups = db.query(SignupRequest).filter(SignupRequest.status == "pending").count()
    unresolved_blockers = db.query(Blocker).filter(Blocker.status != "resolved").count()

    return {
        # Top-level KPI cards (used by AnalyticsOverview.jsx)
        "total_users": total_users,
        "active_users": active_users,
        "active_internships": active_internships,
        "completed_internships": completed_internships,
        "pending_signup_requests": pending_signups,
        "unresolved_blockers": unresolved_blockers,
        # User distribution breakdown
        "interns_count": interns_count,
        "mentors_count": mentors_count,
        "admins_count": admins_count,
        # Activity metrics
        "total_tasks": total_tasks,
        "total_reports_submitted": total_reports,
        # Legacy aliases kept for backward compatibility
        "total_interns": interns_count,
        "total_mentors": mentors_count,
        "total_weekly_reports": total_reports,
    }


def _parse_import_file(file: UploadFile) -> List[Dict[str, Any]]:
    content = file.file.read()
    filename = file.filename or ""
    rows: List[Dict[str, Any]] = []

    if filename.endswith(".csv"):
        text_stream = io.StringIO(content.decode("utf-8-sig", errors="replace"))
        reader = csv.DictReader(text_stream)
        if not reader.fieldnames:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CSV file is empty or missing headers")
        field_map = {fn: fn.strip().lower().replace(" ", "_") for fn in reader.fieldnames}
        for r in reader:
            row_dict = {field_map[k]: (v.strip() if v else "") for k, v in r.items() if k in field_map}
            rows.append(row_dict)

    elif filename.endswith((".xlsx", ".xls")):
        wb = openpyxl.load_workbook(filename=io.BytesIO(content), data_only=True)
        sheet = wb.active
        if not sheet:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Excel sheet empty")
        sheet_rows = list(sheet.iter_rows(values_only=True))
        if not sheet_rows:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Excel file is empty")
        headers = [str(c).strip().lower().replace(" ", "_") if c else "" for c in sheet_rows[0]]
        for row_vals in sheet_rows[1:]:
            if not any(row_vals):
                continue
            row_dict = {}
            for h, v in zip(headers, row_vals):
                if h:
                    row_dict[h] = str(v).strip() if v is not None else ""
            rows.append(row_dict)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a .csv or .xlsx file.",
        )

    return rows


def bulk_import_interns(db: Session, file: UploadFile, actor: User) -> Dict[str, Any]:
    rows = _parse_import_file(file)
    if not rows:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Import file contains no data rows")

    intern_role = db.query(Role).filter(Role.name == "intern").first()
    if not intern_role:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Intern role not found")

    existing_db_emails = {u.email for u in db.query(User.email).all()}
    successful: List[str] = []
    failed: List[Dict[str, Any]] = []
    seen_in_file: set = set()

    for idx, row in enumerate(rows, start=2):
        email = str(row.get("email", "")).strip().lower()
        full_name = str(row.get("full_name", "")).strip()
        password = str(row.get("password", "") or "Password@123").strip()

        if not email:
            failed.append({"row": idx, "email": email, "error": f"Row {idx}: 'email' field is required"})
            continue
        if "@" not in email or "." not in email.split("@")[-1]:
            failed.append({"row": idx, "email": email, "error": f"Row {idx}: Invalid email format '{email}'"})
            continue
        if not full_name:
            failed.append({"row": idx, "email": email, "error": f"Row {idx}: 'full_name' field is required"})
            continue
        if email in seen_in_file:
            failed.append({"row": idx, "email": email, "error": f"Row {idx}: Duplicate email '{email}' in file"})
            continue
        if email in existing_db_emails:
            failed.append({"row": idx, "email": email, "error": f"Row {idx}: User '{email}' already exists"})
            continue

        seen_in_file.add(email)

        try:
            user = User(
                email=email,
                hashed_password=get_password_hash(password),
                role_id=intern_role.id,
                status="active",
                is_active=True,
            )
            db.add(user)
            db.flush()

            profile = Profile(
                user_id=user.id,
                full_name=full_name,
                phone=row.get("phone") or None,
                university=row.get("university") or None,
                degree=row.get("degree") or None,
                semester=row.get("semester") or None,
                department=row.get("department") or None,
            )
            db.add(profile)
            db.flush()

            _ensure_active_internship(db, user)

            successful.append(email)
            existing_db_emails.add(email)
        except Exception as e:
            db.rollback()
            failed.append({"row": idx, "email": email, "error": f"Row {idx}: Error creating user - {str(e)}"})

    if successful:
        log_action(db, "bulk_import_interns", actor_id=actor.id, details={"count": len(successful)})
        db.commit()

    return {
        "total_rows": len(rows),
        "successful": len(successful),
        "failed": len(failed),
        "errors": failed,
        "imported_emails": successful,
    }
