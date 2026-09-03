from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
from app.models.internship import Internship
from app.schemas.evaluation import EvaluationCreate, EvaluationUpdate, EvaluationResponse
from app.services.evaluation_service import (
    get_evaluation,
    create_evaluation,
    update_evaluation,
    approve_certificate,
    issue_certificate
)


router = APIRouter(prefix="/evaluations", tags=["End-of-Internship Evaluations"])


@router.get("/internship/{internship_id}", response_model=EvaluationResponse)
def read_evaluation(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.EVALUATION.READ))
):
    evaluation = get_evaluation(db, internship_id)
    if not evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No evaluation found for this internship")
    
    # Interns may only view their own evaluation
    if current_user.role.name == "intern":
        if evaluation.internship.intern_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: you can only view your own evaluation")
    
    return evaluation


@router.post("/internship/{internship_id}", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
def submit_evaluation(
    internship_id: int,
    req: EvaluationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.EVALUATION.CREATE))
):
    return create_evaluation(db, internship_id, req, current_user)


@router.put("/{evaluation_id}", response_model=EvaluationResponse)
def edit_evaluation(
    evaluation_id: int,
    req: EvaluationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.EVALUATION.UPDATE))
):
    return update_evaluation(db, evaluation_id, req, current_user)


@router.get("/internship/{internship_id}/export")
def export_evaluation_report(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.EVALUATION.READ))
):
    """
    Returns a comprehensive, ready-to-print corporate End-of-Internship Evaluation summary.
    """
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    
    # Interns may only export their own evaluation
    if current_user.role.name == "intern" and internship.intern_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: you can only view your own evaluation")

    evaluation = get_evaluation(db, internship_id)
    intern = internship.intern
    mentor = internship.mentor
    intern_name = intern.profile.full_name if (intern and intern.profile) else (intern.email if intern else "Intern")
    mentor_name = mentor.profile.full_name if (mentor and mentor.profile) else (mentor.email if mentor else "Mentor")

    return {
        "internship_id": internship.id,
        "department": internship.department,
        "start_date": str(internship.start_date),
        "end_date": str(internship.end_date),
        "duration_weeks": internship.duration_weeks,
        "intern": {
            "name": intern_name,
            "email": intern.email if intern else None,
            "university": intern.profile.university if (intern and intern.profile) else None,
            "degree": intern.profile.degree if (intern and intern.profile) else None,
        },
        "mentor": {
            "name": mentor_name,
            "email": mentor.email if mentor else None,
        },
        "evaluation": {
            "overall_rating": evaluation.overall_rating if evaluation else None,
            "technical_skills_rating": evaluation.technical_skills_rating if evaluation else None,
            "soft_skills_rating": evaluation.soft_skills_rating if evaluation else None,
            "strengths": evaluation.strengths if evaluation else None,
            "areas_for_improvement": evaluation.areas_for_improvement if evaluation else None,
            "recommendation": evaluation.recommendation if evaluation else None,
            "final_comments": evaluation.final_comments if evaluation else None,
            "ai_summary": evaluation.ai_summary if evaluation else None,
        } if evaluation else None,
    }


@router.post("/internship/{internship_id}/approve-certificate")
def admin_approve_certificate(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.USER.UPDATE))
):
    """Admin reviews and approves student for certificate generation."""
    internship = approve_certificate(db, internship_id, current_user)
    return {
        "message": "Certificate approved by administrator. Student is now queued for certificate generation.",
        "status": internship.status,
        "internship_id": internship.id
    }


@router.post("/internship/{internship_id}/issue-certificate")
def admin_issue_certificate(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.USER.UPDATE))
):
    """Admin issues certificate and marks student as Certified Alumni."""
    internship = issue_certificate(db, internship_id, current_user)
    return {
        "message": "Certificate generated and issued successfully. Student is now a Certified Alumni.",
        "status": internship.status,
        "internship_id": internship.id,
        "certificate_id": internship.certificate_id
    }

