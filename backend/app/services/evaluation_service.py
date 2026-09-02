from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.evaluation import EndOfInternshipEvaluation
from app.models.internship import Internship
from app.models.assignment import MentorInternAssignment
from app.models.user import User
from app.schemas.evaluation import EvaluationCreate, EvaluationUpdate
from app.services.audit_service import log_action

def get_evaluation(db: Session, internship_id: int) -> Optional[EndOfInternshipEvaluation]:
    return db.query(EndOfInternshipEvaluation).filter(EndOfInternshipEvaluation.internship_id == internship_id).first()

def create_evaluation(db: Session, internship_id: int, req: EvaluationCreate, mentor: User) -> EndOfInternshipEvaluation:
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    
    if mentor.role.name == "mentor" and internship.mentor_id != mentor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot evaluate an intern not assigned to you")

    existing = get_evaluation(db, internship_id)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Evaluation already exists for this internship")
    
    eval_record = EndOfInternshipEvaluation(
        internship_id=internship_id,
        mentor_id=mentor.id,
        overall_rating=req.overall_rating,
        technical_skills_rating=req.technical_skills_rating,
        soft_skills_rating=req.soft_skills_rating,
        strengths=req.strengths,
        areas_for_improvement=req.areas_for_improvement,
        recommendation=req.recommendation,
        final_comments=req.final_comments
    )
    db.add(eval_record)
    
    # Transition internship to waiting certificate approval
    internship.status = "waiting_certificate_approval"

    # Close active assignment for mentor so they transition to past/alumni intern
    active_assign = db.query(MentorInternAssignment).filter(
        MentorInternAssignment.internship_id == internship.id,
        MentorInternAssignment.is_active == True
    ).first()
    if active_assign:
        active_assign.is_active = False
        active_assign.end_date = datetime.now(timezone.utc)

    log_action(
        db,
        action="internship_evaluated",
        actor_id=mentor.id,
        target_user_id=internship.intern_id,
        details={"internship_id": internship.id, "overall_rating": req.overall_rating}
    )

    db.commit()
    db.refresh(eval_record)
    return eval_record

def approve_certificate(db: Session, internship_id: int, admin_user: User) -> Internship:
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    
    internship.status = "pending_certificate_generation"
    internship.certificate_approved_at = datetime.now(timezone.utc)
    
    log_action(
        db,
        action="certificate_approved",
        actor_id=admin_user.id,
        target_user_id=internship.intern_id,
        details={"internship_id": internship.id}
    )
    db.commit()
    db.refresh(internship)
    return internship

def issue_certificate(db: Session, internship_id: int, admin_user: User) -> Internship:
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    
    now = datetime.now(timezone.utc)
    internship.status = "completed"
    internship.certificate_id = f"NETSOL-CERT-{now.year}-{internship.id:04d}"
    internship.certificate_issued_at = now
    
    log_action(
        db,
        action="certificate_issued",
        actor_id=admin_user.id,
        target_user_id=internship.intern_id,
        details={"internship_id": internship.id, "certificate_id": internship.certificate_id}
    )
    db.commit()
    db.refresh(internship)
    return internship

def update_evaluation(db: Session, evaluation_id: int, req: EvaluationUpdate, mentor: User) -> EndOfInternshipEvaluation:
    eval_record = db.query(EndOfInternshipEvaluation).filter(EndOfInternshipEvaluation.id == evaluation_id).first()
    if not eval_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluation record not found")
    
    if mentor.role.name == "mentor" and eval_record.mentor_id != mentor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another mentor's evaluation")
    
    update_data = req.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(eval_record, field, value)
    
    db.commit()
    db.refresh(eval_record)
    return eval_record

