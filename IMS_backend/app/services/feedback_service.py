from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.feedback import MentorFeedback
from app.models.report import WeeklyReport
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate

def get_feedback_for_report(db: Session, report_id: int) -> Optional[MentorFeedback]:
    return db.query(MentorFeedback).filter(MentorFeedback.report_id == report_id).first()

def get_feedbacks_by_mentor(db: Session, mentor_id: int) -> List[MentorFeedback]:
    return db.query(MentorFeedback).filter(MentorFeedback.mentor_id == mentor_id).all()

def create_feedback(db: Session, report_id: int, req: FeedbackCreate, mentor: User) -> MentorFeedback:
    report = db.query(WeeklyReport).filter(WeeklyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weekly report not found")
    
    existing = get_feedback_for_report(db, report_id)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Feedback already submitted for this report")
    
    feedback = MentorFeedback(
        report_id=report_id,
        mentor_id=mentor.id,
        feedback_text=req.feedback_text,
        rating=req.rating,
        category=req.category,
        action_items=req.action_items
    )
    db.add(feedback)
    
    # Mark report as reviewed
    report.status = "reviewed"
    db.commit()
    db.refresh(feedback)
    return feedback

def update_feedback(db: Session, feedback_id: int, req: FeedbackUpdate, mentor: User) -> MentorFeedback:
    feedback = db.query(MentorFeedback).filter(MentorFeedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    
    # Mentor ownership check
    if mentor.role.name == "mentor" and feedback.mentor_id != mentor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another mentor's feedback")
    
    update_data = req.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(feedback, field, value)
    
    db.commit()
    db.refresh(feedback)
    return feedback
