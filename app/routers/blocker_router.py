from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
from app.schemas.blocker import BlockerCreate, BlockerUpdate, BlockerResponse
from app.services.blocker_service import get_blockers, get_blocker_by_id, create_blocker, update_blocker

router = APIRouter(prefix="/blockers", tags=["Blockers"])

@router.get("", response_model=List[BlockerResponse])
def read_blockers(
    intern_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.BLOCKER.READ))
):
    if current_user.role.name == "intern" and not intern_id:
        intern_id = current_user.id
    return get_blockers(db, intern_id=intern_id, status_filter=status_filter)

@router.get("/{blocker_id}", response_model=BlockerResponse)
def read_blocker(
    blocker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.BLOCKER.READ))
):
    blocker = get_blocker_by_id(db, blocker_id)
    if not blocker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blocker not found")
    return blocker

@router.post("", response_model=BlockerResponse, status_code=status.HTTP_201_CREATED)
def report_blocker(
    req: BlockerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.BLOCKER.CREATE))
):
    return create_blocker(db, req, current_user)

@router.put("/{blocker_id}", response_model=BlockerResponse)
def resolve_or_edit_blocker(
    blocker_id: int,
    req: BlockerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.BLOCKER.UPDATE))
):
    return update_blocker(db, blocker_id, req, current_user)
