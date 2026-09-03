from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, get_current_mentor
from app.models.user import User
from app.models.role import Role
from app.models.internship import Internship
from app.models.report import WeeklyReport
from app.models.task import Task
from app.models.blocker import Blocker
from app.models.ai_insight import AIInsight
from app.models.mentorship_request import MentorshipRequest
from app.schemas.internship import InternshipResponse
from app.schemas.report import WeeklyReportResponse
from app.schemas.task import TaskResponse
from app.schemas.blocker import BlockerResponse
from app.schemas.mentorship_request import (
    MentorshipRequestCreate,
    MentorshipRequestResponse,
    InternBrief,
    MentorBrief,
)
from app.services.audit_service import log_action

router = APIRouter(prefix="/mentors", tags=["Mentor Portal"])



def _verify_mentor_access_to_intern(db: Session, mentor_id: int, intern_id: int) -> Internship:
    """Object-level authorization: ensure intern was/is assigned to mentor, prioritizing active tracks."""
    # First search for active/extended ongoing internship
    internship = db.query(Internship).filter(
        Internship.intern_id == intern_id,
        Internship.mentor_id == mentor_id,
        Internship.status.in_(["active", "extended"])
    ).order_by(Internship.id.desc()).first()

    # Fallback to most recent internship
    if not internship:
        internship = db.query(Internship).filter(
            Internship.intern_id == intern_id,
            Internship.mentor_id == mentor_id
        ).order_by(Internship.id.desc()).first()

    if not internship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Intern is not assigned to you."
        )
    return internship


@router.get("/interns", response_model=List[InternshipResponse])
def get_assigned_interns(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """View interns assigned to current mentor (active or past/alumni)."""
    query = db.query(Internship).filter(Internship.mentor_id == mentor.id)
    if status_filter == "active":
        query = query.filter(Internship.status.in_(["active", "extended"]))
    elif status_filter == "alumni":
        query = query.filter(Internship.status.in_(["waiting_certificate_approval", "pending_certificate_generation", "completed"]))
    elif status_filter and status_filter != "all":
        query = query.filter(Internship.status == status_filter)
    return query.order_by(Internship.id.desc()).all()



@router.get("/interns/{intern_id}", response_model=InternshipResponse)
def get_assigned_intern_details(
    intern_id: int,
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """View details and profile of an assigned intern."""
    if mentor.role.name == "admin":
        internship = db.query(Internship).filter(
            Internship.intern_id == intern_id,
            Internship.status.in_(["active", "extended"])
        ).order_by(Internship.id.desc()).first()
        if not internship:
            internship = db.query(Internship).filter(Internship.intern_id == intern_id).order_by(Internship.id.desc()).first()
        if not internship:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship record not found")
        return internship
    return _verify_mentor_access_to_intern(db, mentor.id, intern_id)


@router.get("/interns/{intern_id}/reports", response_model=List[WeeklyReportResponse])
def get_assigned_intern_reports(
    intern_id: int,
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """View weekly reports submitted by an assigned intern."""
    internship = None
    if mentor.role.name != "admin":
        internship = _verify_mentor_access_to_intern(db, mentor.id, intern_id)
    else:
        internship = db.query(Internship).filter(
            Internship.intern_id == intern_id,
            Internship.status.in_(["active", "extended"])
        ).order_by(Internship.id.desc()).first()
        if not internship:
            internship = db.query(Internship).filter(Internship.intern_id == intern_id).order_by(Internship.id.desc()).first()

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
        Internship.status.in_(["active", "extended"])
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


@router.get("/available-interns", response_model=List[InternBrief])
def get_available_interns(
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """List all interns in the system with their assignment & request status relative to current mentor."""
    intern_role = db.query(Role).filter(Role.name == "intern").first()
    if not intern_role:
        return []

    intern_users = db.query(User).filter(User.role_id == intern_role.id, User.status == "active").all()

    # Get all requests sent by this mentor
    requests = db.query(MentorshipRequest).filter(MentorshipRequest.mentor_id == mentor.id).all()
    requests_by_intern = {r.intern_id: r for r in requests}

    # Get active internships
    internships = db.query(Internship).filter(Internship.status.in_(["active", "extended"])).all()
    internships_by_intern = {i.intern_id: i for i in internships}

    result = []
    for u in intern_users:
        internship = internships_by_intern.get(u.id)
        req = requests_by_intern.get(u.id)

        current_mentor_id = internship.mentor_id if internship else None
        current_mentor_name = None
        if internship and internship.mentor and internship.mentor.profile:
            current_mentor_name = internship.mentor.profile.full_name
        elif internship and internship.mentor:
            current_mentor_name = internship.mentor.email

        result.append(
            InternBrief(
                id=u.id,
                email=u.email,
                full_name=u.profile.full_name if (u.profile and u.profile.full_name) else u.email.split("@")[0],
                department=u.profile.department if (u.profile and u.profile.department) else (internship.department if internship else "Engineering"),
                university=u.profile.university if u.profile else None,
                avatar_url=u.profile.avatar_url if u.profile else None,
                current_mentor_id=current_mentor_id,
                current_mentor_name=current_mentor_name,
                is_assigned_to_me=bool(current_mentor_id == mentor.id),
                request_status=req.status if req else None,
                request_id=req.id if req else None,
            )
        )

    return result


@router.post("/requests", response_model=MentorshipRequestResponse, status_code=status.HTTP_201_CREATED)
def send_mentorship_request(
    payload: MentorshipRequestCreate,
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """Send a request to an intern to assign them to the logged-in mentor."""
    intern = db.query(User).filter(User.id == payload.intern_id).first()
    if not intern or not intern.role or intern.role.name != "intern":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Intern with ID {payload.intern_id} not found."
        )

    # Check if intern is already assigned to this mentor
    active_internship = db.query(Internship).filter(
        Internship.intern_id == intern.id,
        Internship.mentor_id == mentor.id,
        Internship.status.in_(["active", "extended"])
    ).first()
    if active_internship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This intern is already assigned to you."
        )

    # Check for existing pending request
    existing_pending = db.query(MentorshipRequest).filter(
        MentorshipRequest.mentor_id == mentor.id,
        MentorshipRequest.intern_id == intern.id,
        MentorshipRequest.status == "pending"
    ).first()
    if existing_pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending mentorship request sent to this intern."
        )

    new_request = MentorshipRequest(
        mentor_id=mentor.id,
        intern_id=intern.id,
        status="pending",
        notes=payload.notes
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    log_action(
        db,
        action="mentorship_request_sent",
        actor_id=mentor.id,
        target_user_id=intern.id,
        details={"mentor_id": mentor.id, "intern_id": intern.id, "request_id": new_request.id}
    )

    return MentorshipRequestResponse(
        id=new_request.id,
        mentor_id=new_request.mentor_id,
        intern_id=new_request.intern_id,
        status=new_request.status,
        notes=new_request.notes,
        created_at=new_request.created_at,
        responded_at=new_request.responded_at,
        mentor=MentorBrief(
            id=mentor.id,
            email=mentor.email,
            full_name=mentor.profile.full_name if mentor.profile else None,
            department=mentor.profile.department if mentor.profile else None,
            job_title=getattr(mentor.profile, "job_title", None) if mentor.profile else None,
            avatar_url=mentor.profile.avatar_url if mentor.profile else None,
        ),

        intern=InternBrief(
            id=intern.id,
            email=intern.email,
            full_name=intern.profile.full_name if intern.profile else None,
            department=intern.profile.department if intern.profile else None,
            university=intern.profile.university if intern.profile else None,
            avatar_url=intern.profile.avatar_url if intern.profile else None,
            request_status="pending",
            request_id=new_request.id
        )
    )


@router.get("/requests", response_model=List[MentorshipRequestResponse])
def get_sent_mentorship_requests(
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """Get all mentorship requests sent by current mentor."""
    requests = (
        db.query(MentorshipRequest)
        .filter(MentorshipRequest.mentor_id == mentor.id)
        .order_by(MentorshipRequest.created_at.desc())
        .all()
    )

    res = []
    for r in requests:
        intern = r.intern
        res.append(
            MentorshipRequestResponse(
                id=r.id,
                mentor_id=r.mentor_id,
                intern_id=r.intern_id,
                status=r.status,
                notes=r.notes,
                created_at=r.created_at,
                responded_at=r.responded_at,
                intern=InternBrief(
                    id=intern.id,
                    email=intern.email,
                    full_name=intern.profile.full_name if (intern and intern.profile) else None,
                    department=intern.profile.department if (intern and intern.profile) else None,
                    university=intern.profile.university if (intern and intern.profile) else None,
                    avatar_url=intern.profile.avatar_url if (intern and intern.profile) else None,
                    request_status=r.status,
                    request_id=r.id
                ) if intern else None
            )
        )
    return res


@router.delete("/requests/{request_id}")
def cancel_mentorship_request(
    request_id: int,
    db: Session = Depends(get_db),
    mentor: User = Depends(get_current_mentor)
):
    """Cancel a pending request sent by mentor."""
    req = db.query(MentorshipRequest).filter(
        MentorshipRequest.id == request_id,
        MentorshipRequest.mentor_id == mentor.id
    ).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")

    if req.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot cancel a request with status '{req.status}'.")

    db.delete(req)
    db.commit()
    return {"message": "Mentorship request cancelled successfully."}

