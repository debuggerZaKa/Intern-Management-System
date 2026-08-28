from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
from app.schemas.role import RoleResponse, PermissionResponse
from app.services.role_service import get_all_roles, get_role_by_id, get_role_permissions

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.get("", response_model=List[RoleResponse])
def read_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.ROLE.READ))
):
    """
    Returns available roles. Requires 'role:read' permission.
    """
    return get_all_roles(db)

@router.get("/{role_id}/permissions", response_model=List[PermissionResponse])
def read_role_permissions(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.ROLE.READ))
):
    """
    Returns permissions assigned to a specific role. Requires 'role:read' permission.
    """
    role = get_role_by_id(db, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    return get_role_permissions(db, role_id)
