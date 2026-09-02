from datetime import datetime, timezone, date, timedelta
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.assignment import MentorInternAssignment
from app.models.internship import Internship
from app.models.user import User
from app.services.audit_service import log_action


def get_assignment_history(db: Session, internship_id: int) -> List[MentorInternAssignment]:
    return (
        db.query(MentorInternAssignment)
        .filter(MentorInternAssignment.internship_id == internship_id)
        .order_by(MentorInternAssignment.assigned_at.desc())
        .all()
    )


def get_active_assignment(db: Session, internship_id: int) -> Optional[MentorInternAssignment]:
    return (
        db.query(MentorInternAssignment)
        .filter(
            MentorInternAssignment.internship_id == internship_id,
            MentorInternAssignment.is_active == True,  # noqa: E712
        )
        .first()
    )


def assign_mentor(
    db: Session,
    internship_id: int,
    mentor_id: int,
    assigned_by: User,
    notes: Optional[str] = None,
) -> MentorInternAssignment:
    """
    Assigns or reassigns a mentor. Flexible input: accepts Internship.id or Intern's User.id.
    Auto-creates active internship if needed.
    """
    # 1. Try finding internship by Internship.id
    internship = db.query(Internship).filter(Internship.id == internship_id).first()

    # 2. If not found by Internship.id, try finding by intern's User.id
    if not internship:
        internship = db.query(Internship).filter(
            Internship.intern_id == internship_id,
            Internship.status == "active"
        ).first()

    # 3. If still not found, check if target ID is an intern User and initialize active internship
    if not internship:
        user = db.query(User).filter(User.id == internship_id).first()
        if user and user.role and user.role.name == "intern":
            today = date.today()
            end_date = today + timedelta(weeks=settings.INTERNSHIP_DURATION_WEEKS)
            dept = user.profile.department if user.profile and user.profile.department else "Engineering"
            internship = Internship(
                intern_id=user.id,
                department=dept,
                start_date=today,
                end_date=end_date,
                duration_weeks=settings.INTERNSHIP_DURATION_WEEKS,
                current_week=1,
                status="active"
            )
            db.add(internship)
            db.flush()
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No active internship or intern found for ID {internship_id}."
            )

    mentor = db.query(User).filter(User.id == mentor_id).first()
    if not mentor or not mentor.role or mentor.role.name != "mentor":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User ID {mentor_id} is not a valid mentor")

    # Deactivate current active assignment (reassignment)
    current = get_active_assignment(db, internship.id)
    if current:
        if current.mentor_id == mentor_id:
            internship.mentor_id = mentor_id
            if notes:
                current.notes = notes
            db.commit()
            return current
        current.is_active = False
        current.end_date = datetime.now(timezone.utc)


    new_assignment = MentorInternAssignment(
        internship_id=internship.id,
        intern_id=internship.intern_id,
        mentor_id=mentor_id,
        assigned_by_id=assigned_by.id,
        is_active=True,
        notes=notes,
    )
    db.add(new_assignment)

    # Keep internship.mentor_id in sync for quick lookups
    internship.mentor_id = mentor_id

    log_action(
        db,
        action="intern_assigned" if not current else "intern_reassigned",
        actor_id=assigned_by.id,
        target_user_id=internship.intern_id,
        details={"internship_id": internship.id, "mentor_id": mentor_id},
    )

    db.commit()
    db.refresh(new_assignment)
    return new_assignment
