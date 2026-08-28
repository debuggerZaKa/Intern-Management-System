from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, get_current_mentor
from app.models.user import User
from app.models.internship import Internship
from app.models.report import WeeklyReport
from app.models.task import Task
from app.models.blocker import Blocker
from app.models.ai_insight import AIInsight
from app.schemas.internship import InternshipResponse
from app.schemas.report import WeeklyReportResponse
from app.schemas.task import TaskResponse
from app.schemas.blocker import BlockerResponse

router = APIRouter(prefix="/mentors", tags=["Mentor Portal"])


def _verify_mentor_access_to_intern(db: Session, mentor_id: int, intern_id: int) -> Internship:
    """Object-level authorization: ensure intern is assigned to mentor."""
    internship = db.query(Internship).filter(
        Internship.intern_id == intern_id,
        Internship.mentor_id == mentor_id,
        Internship.status == "active"
    ).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Intern is not assigned to you."
        )
    return internship


@router.get("/interns", response_model=List[InternshipResponse])
def get_assigned_interns(
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """View all active interns assigned to current mentor."""
    return db.query(Internship).filter(
        Internship.mentor_id == mentor.id,
        Internship.status == "active"
    ).all()


@router.get("/interns/{intern_id}", response_model=InternshipResponse)
def get_assigned_intern_details(
    intern_id: int,
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """View details and profile of an assigned intern."""
    if mentor.role.name == "admin":
        internship = db.query(Internship).filter(Internship.intern_id == intern_id, Internship.status == "active").first()
        if not internship:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active internship not found")
        return internship
    return _verify_mentor_access_to_intern(db, mentor.id, intern_id)


@router.get("/interns/{intern_id}/reports", response_model=List[WeeklyReportResponse])
def get_assigned_intern_reports(
    intern_id: int,
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """View weekly reports submitted by an assigned intern."""
    if mentor.role.name != "admin":
        _verify_mentor_access_to_intern(db, mentor.id, intern_id)

    internship = db.query(Internship).filter(Internship.intern_id == intern_id).first()
    if not internship:
        return []
    return db.query(WeeklyReport).filter(WeeklyReport.internship_id == internship.id).order_by(WeeklyReport.week_number.asc()).all()


@router.get("/interns/{intern_id}/tasks", response_model=List[TaskResponse])
def get_assigned_intern_tasks(
    intern_id: int,
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """View tasks for an assigned intern."""
    if mentor.role.name != "admin":
        _verify_mentor_access_to_intern(db, mentor.id, intern_id)

    return db.query(Task).filter(Task.intern_id == intern_id).all()


@router.get("/interns/{intern_id}/blockers", response_model=List[BlockerResponse])
def get_assigned_intern_blockers(
    intern_id: int,
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """View blockers reported by an assigned intern."""
    if mentor.role.name != "admin":
        _verify_mentor_access_to_intern(db, mentor.id, intern_id)

    return db.query(Blocker).filter(Blocker.intern_id == intern_id).all()


@router.get("/attention")
def get_interns_needing_attention(
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """Get list of assigned interns requiring urgent attention (critical blockers, low ratings, risk flags)."""
    assigned_internships = db.query(Internship).filter(
        Internship.mentor_id == mentor.id,
        Internship.status == "active"
    ).all()

    attention_list = []
    for internship in assigned_internships:
        reasons = []
        # Check active critical/moderate blockers
        blockers = db.query(Blocker).filter(
            Blocker.intern_id == internship.intern_id,
            Blocker.status != "resolved"
        ).all()
        critical_blockers = [b for b in blockers if b.severity == "critical"]
        if critical_blockers:
            reasons.append(f"{len(critical_blockers)} active critical blocker(s)")

        # Check AI risk flags
        latest_ai = db.query(AIInsight).filter(
            AIInsight.internship_id == internship.id
        ).order_by(AIInsight.generated_at.desc()).first()
        if latest_ai and latest_ai.progress_status in ("needs_attention", "at_risk"):
            reasons.append(f"AI Risk Status: {latest_ai.progress_status}")

        if reasons:
            intern_name = (
                internship.intern.profile.full_name
                if (internship.intern and internship.intern.profile)
                else internship.intern.email
            )
            attention_list.append({
                "internship_id": internship.id,
                "intern_id": internship.intern_id,
                "intern_name": intern_name,
                "department": internship.department,
                "current_week": internship.current_week,
                "reasons": reasons
            })

    return attention_list
