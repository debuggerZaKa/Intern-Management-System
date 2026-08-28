from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate, FeedbackResponse
from app.services.feedback_service import get_feedback_for_report, get_feedbacks_by_mentor, create_feedback, update_feedback

router = APIRouter(prefix="/feedback", tags=["Mentor Feedback"])

@router.get("/report/{report_id}", response_model=FeedbackResponse)
def read_feedback_for_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.FEEDBACK.READ))
):
    feedback = get_feedback_for_report(db, report_id)
    if not feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No feedback found for this report")
    return feedback

@router.get("/mentor", response_model=List[FeedbackResponse])
def read_mentor_feedbacks(
    mentor_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.FEEDBACK.READ))
):
    if current_user.role.name == "mentor" and not mentor_id:
        mentor_id = current_user.id
    return get_feedbacks_by_mentor(db, mentor_id=mentor_id or current_user.id)

@router.post("/report/{report_id}", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    report_id: int,
    req: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.FEEDBACK.CREATE))
):
    return create_feedback(db, report_id, req, current_user)

@router.put("/{feedback_id}", response_model=FeedbackResponse)
def edit_feedback(
    feedback_id: int,
    req: FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.FEEDBACK.UPDATE))
):
    return update_feedback(db, feedback_id, req, current_user)
