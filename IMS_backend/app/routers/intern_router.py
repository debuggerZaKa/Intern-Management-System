from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, get_current_intern, get_current_user
from app.models.user import User
from app.models.internship import Internship
from app.models.report import WeeklyReport
from app.models.task import Task
from app.models.blocker import Blocker
from app.models.ai_insight import AIInsight
from app.schemas.user import ProfileResponse, ProfileUpdate
from app.schemas.internship import InternshipResponse
from app.schemas.report import WeeklyReportResponse
from app.schemas.task import TaskResponse
from app.schemas.blocker import BlockerResponse
from app.services import user_service

router = APIRouter(prefix="/interns", tags=["Intern Portal"])


@router.get("/dashboard")
def get_intern_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    """View complete intern progress dashboard."""
    internship = db.query(Internship).filter(
        Internship.intern_id == current_user.id,
        Internship.status == "active"
    ).first()

    if not internship:
        return {
            "has_active_internship": False,
            "message": "No active internship found for this account."
        }

    tasks = db.query(Task).filter(Task.intern_id == current_user.id).all()
    tasks_completed = [t for t in tasks if t.status == "done"]
    reports = db.query(WeeklyReport).filter(WeeklyReport.internship_id == internship.id).all()
    blockers = db.query(Blocker).filter(Blocker.intern_id == current_user.id).all()
    unresolved_blockers = [b for b in blockers if b.status != "resolved"]

    latest_ai = db.query(AIInsight).filter(
        AIInsight.internship_id == internship.id
    ).order_by(AIInsight.generated_at.desc()).first()

    return {
        "has_active_internship": True,
        "internship_id": internship.id,
        "department": internship.department,
        "duration_weeks": internship.duration_weeks,
        "current_week": internship.current_week,
        "start_date": internship.start_date,
        "end_date": internship.end_date,
        "mentor": {
            "id": internship.mentor.id,
            "full_name": internship.mentor.profile.full_name if internship.mentor and internship.mentor.profile else None,
            "email": internship.mentor.email if internship.mentor else None
        } if internship.mentor else None,
        "tasks_summary": {
            "total": len(tasks),
            "completed": len(tasks_completed),
            "in_progress": len([t for t in tasks if t.status == "in_progress"]),
            "todo": len([t for t in tasks if t.status == "todo"])
        },
        "weekly_reports_submitted": len(reports),
        "unresolved_blockers": len(unresolved_blockers),
        "latest_ai_status": latest_ai.progress_status if latest_ai else "pending"
    }


@router.get("/me/profile", response_model=ProfileResponse)
def get_own_profile(current_user: User = Depends(get_current_user)):
    """View logged in user's profile."""
    if not current_user.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return current_user.profile


@router.put("/me/profile", response_model=ProfileResponse)
def update_own_profile(
    req: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update logged in user's profile information."""
    return user_service.update_profile(db, current_user.id, req)


@router.get("/me/internship", response_model=InternshipResponse)
def get_own_internship(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    """View intern's active internship details."""
    internship = db.query(Internship).filter(
        Internship.intern_id == current_user.id,
        Internship.status == "active"
    ).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active internship not found")
    return internship


@router.get("/me/tasks", response_model=List[TaskResponse])
def get_own_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    """View assigned tasks for current intern."""
    return db.query(Task).filter(Task.intern_id == current_user.id).all()


@router.get("/me/reports", response_model=List[WeeklyReportResponse])
def get_own_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    """View weekly reports submitted by current intern."""
    internship = db.query(Internship).filter(
        Internship.intern_id == current_user.id,
        Internship.status == "active"
    ).first()
    if not internship:
        return []
    return db.query(WeeklyReport).filter(WeeklyReport.internship_id == internship.id).order_by(WeeklyReport.week_number.asc()).all()


@router.get("/me/blockers", response_model=List[BlockerResponse])
def get_own_blockers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    """View blockers submitted by current intern."""
    return db.query(Blocker).filter(Blocker.intern_id == current_user.id).all()


@router.get("/me/ai-insights")
def get_own_ai_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    """View AI progress insights generated for current intern."""
    internship = db.query(Internship).filter(
        Internship.intern_id == current_user.id,
        Internship.status == "active"
    ).first()
    if not internship:
        return []
    insights = db.query(AIInsight).filter(AIInsight.internship_id == internship.id).order_by(AIInsight.generated_at.desc()).all()
    return [
        {
            "id": i.id,
            "report_id": i.report_id,
            "summary_text": i.summary_text,
            "progress_status": i.progress_status,
            "generated_at": i.generated_at
        }
        for i in insights
    ]
