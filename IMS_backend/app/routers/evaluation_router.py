from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
from app.schemas.evaluation import EvaluationCreate, EvaluationUpdate, EvaluationResponse
from app.services.evaluation_service import get_evaluation, create_evaluation, update_evaluation

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
