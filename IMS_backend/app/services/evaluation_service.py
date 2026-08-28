from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.evaluation import EndOfInternshipEvaluation
from app.models.internship import Internship
from app.models.user import User
from app.schemas.evaluation import EvaluationCreate, EvaluationUpdate

def get_evaluation(db: Session, internship_id: int) -> Optional[EndOfInternshipEvaluation]:
    return db.query(EndOfInternshipEvaluation).filter(EndOfInternshipEvaluation.internship_id == internship_id).first()

def create_evaluation(db: Session, internship_id: int, req: EvaluationCreate, mentor: User) -> EndOfInternshipEvaluation:
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    
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
    
    # Mark internship as completed
    internship.status = "completed"
    db.commit()
    db.refresh(eval_record)
    return eval_record

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
