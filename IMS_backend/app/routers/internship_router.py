from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
from app.schemas.internship import InternshipCreate, InternshipUpdate, InternshipResponse
from app.services.internship_service import get_internships, get_internship_by_id, get_intern_active_internship, create_internship, update_internship

router = APIRouter(prefix="/internships", tags=["Internships"])

@router.get("", response_model=List[InternshipResponse])
def read_internships(
    mentor_id: Optional[int] = None,
    intern_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.INTERNSHIP.READ))
):
    # If user is mentor, default to own assigned interns
    if current_user.role.name == "mentor" and not mentor_id:
        mentor_id = current_user.id
    # If user is intern, default to own internship
    if current_user.role.name == "intern" and not intern_id:
        intern_id = current_user.id
    
    return get_internships(db, mentor_id=mentor_id, intern_id=intern_id)

@router.get("/active", response_model=InternshipResponse)
def read_active_internship(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    internship = get_intern_active_internship(db, current_user.id)
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active internship found")
    return internship

@router.get("/{internship_id}", response_model=InternshipResponse)
def read_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.INTERNSHIP.READ))
):
    internship = get_internship_by_id(db, internship_id)
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    return internship

@router.post("", response_model=InternshipResponse, status_code=status.HTTP_201_CREATED)
def create_new_internship(
    req: InternshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.INTERNSHIP.CREATE))
):
    return create_internship(db, req)

@router.put("/{internship_id}", response_model=InternshipResponse)
def edit_internship(
    internship_id: int,
    req: InternshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.INTERNSHIP.UPDATE))
):
    return update_internship(db, internship_id, req)
