from datetime import datetime, timezone
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
from app.models.mentorship_request import MentorshipRequest
from app.schemas.user import ProfileResponse, ProfileUpdate
from app.schemas.internship import InternshipResponse
from app.schemas.report import WeeklyReportResponse
from app.schemas.task import TaskResponse
from app.schemas.blocker import BlockerResponse
from app.schemas.mentorship_request import (
    MentorshipRequestRespond,
    MentorshipRequestResponse,
    MentorBrief,
    InternBrief,
)
from app.services import user_service
from app.services.assignment_service import assign_mentor
from app.services.audit_service import log_action

router = APIRouter(prefix="/interns", tags=["Intern Portal"])



@router.get("/dashboard")
def get_intern_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    """View complete intern progress dashboard."""
    internship = db.query(Internship).filter(
        Internship.intern_id == current_user.id,
        Internship.status.in_(["active", "extended"])
    ).first()

    pending_requests_count = db.query(MentorshipRequest).filter(
        MentorshipRequest.intern_id == current_user.id,
        MentorshipRequest.status == "pending"
    ).count()

    if not internship:
        return {
            "has_active_internship": False,
            "message": "No active internship track found for this account.",
            "pending_mentorship_requests_count": pending_requests_count
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
            "email": internship.mentor.email if internship.mentor else None,
            "department": internship.mentor.profile.department if internship.mentor and internship.mentor.profile else None,
            "job_title": getattr(internship.mentor.profile, "job_title", None) if internship.mentor and internship.mentor.profile else None,
        } if internship.mentor else None,

        "tasks_summary": {
            "total": len(tasks),
            "completed": len(tasks_completed),
            "in_progress": len([t for t in tasks if t.status == "in_progress"]),
            "todo": len([t for t in tasks if t.status == "todo"])
        },
        "weekly_reports_submitted": len(reports),
        "unresolved_blockers": len(unresolved_blockers),
        "latest_ai_status": latest_ai.progress_status if latest_ai else "pending",
        "pending_mentorship_requests_count": pending_requests_count
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
    """View intern's most recent active internship details."""
    internship = db.query(Internship).filter(
        Internship.intern_id == current_user.id,
        Internship.status.in_(["active", "extended"])
    ).order_by(Internship.created_at.desc()).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active internship not found")
    return internship


@router.get("/me/internships", response_model=List[InternshipResponse])
def get_own_internship_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    """View the full history of all internship tracks for the logged-in intern."""
    return db.query(Internship).filter(
        Internship.intern_id == current_user.id
    ).order_by(Internship.created_at.desc()).all()



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
        Internship.status.in_(["active", "extended"])
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
        Internship.status.in_(["active", "extended"])
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


@router.get("/me/mentorship-requests", response_model=List[MentorshipRequestResponse])
def get_my_mentorship_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    """Get all mentorship requests received by current intern."""
    requests = (
        db.query(MentorshipRequest)
        .filter(MentorshipRequest.intern_id == current_user.id)
        .order_by(MentorshipRequest.created_at.desc())
        .all()
    )

    res = []
    for r in requests:
        mentor = r.mentor
        res.append(
            MentorshipRequestResponse(
                id=r.id,
                mentor_id=r.mentor_id,
                intern_id=r.intern_id,
                status=r.status,
                notes=r.notes,
                created_at=r.created_at,
                responded_at=r.responded_at,
                mentor=MentorBrief(
                    id=mentor.id,
                    email=mentor.email,
                    full_name=mentor.profile.full_name if (mentor and mentor.profile) else None,
                    department=mentor.profile.department if (mentor and mentor.profile) else None,
                    job_title=getattr(mentor.profile, "job_title", None) if (mentor and mentor.profile) else None,
                    avatar_url=mentor.profile.avatar_url if (mentor and mentor.profile) else None,
                ) if mentor else None,

                intern=InternBrief(
                    id=current_user.id,
                    email=current_user.email,
                    full_name=current_user.profile.full_name if current_user.profile else None,
                    department=current_user.profile.department if current_user.profile else None,
                    university=current_user.profile.university if current_user.profile else None,
                    avatar_url=current_user.profile.avatar_url if current_user.profile else None,
                )
            )
        )
    return res


@router.post("/me/mentorship-requests/{request_id}/respond")
def respond_to_mentorship_request(
    request_id: int,
    payload: MentorshipRequestRespond,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_intern)
):
    """Accept or reject a mentorship request sent by a mentor."""
    req = db.query(MentorshipRequest).filter(
        MentorshipRequest.id == request_id,
        MentorshipRequest.intern_id == current_user.id
    ).first()

    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentorship request not found.")

    if req.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This request has already been responded to with status '{req.status}'."
        )

    action = payload.action.lower().strip()
    if action not in ["accept", "reject"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be 'accept' or 'reject'.")

    now = datetime.now(timezone.utc)
    if action == "accept":
        req.status = "accepted"
        req.responded_at = now

        # Execute assignment logic via assignment_service
        mentor_user = req.mentor
        mentor_name = (mentor_user.profile.full_name if (mentor_user and mentor_user.profile) else mentor_user.email) if mentor_user else "Mentor"
        assignment_note = f"Accepted mentorship request from {mentor_name}"

        assignment = assign_mentor(
            db=db,
            internship_id=current_user.id,
            mentor_id=req.mentor_id,
            assigned_by=current_user,
            notes=assignment_note
        )

        # Cancel other pending requests for this intern
        db.query(MentorshipRequest).filter(
            MentorshipRequest.intern_id == current_user.id,
            MentorshipRequest.id != req.id,
            MentorshipRequest.status == "pending"
        ).update({"status": "cancelled", "responded_at": now})

        log_action(
            db,
            action="mentorship_request_accepted",
            actor_id=current_user.id,
            target_user_id=req.mentor_id,
            details={"request_id": req.id, "mentor_id": req.mentor_id, "intern_id": current_user.id}
        )
        db.commit()

        return {
            "message": f"Mentorship request accepted. You are now assigned to mentor {mentor_name}.",
            "status": "accepted",
            "mentor_id": req.mentor_id,
            "mentor_name": mentor_name
        }

    else:  # reject
        req.status = "rejected"
        req.responded_at = now
        log_action(
            db,
            action="mentorship_request_rejected",
            actor_id=current_user.id,
            target_user_id=req.mentor_id,
            details={"request_id": req.id, "mentor_id": req.mentor_id, "intern_id": current_user.id}
        )
        db.commit()

        return {
            "message": "Mentorship request declined.",
            "status": "rejected"
        }

