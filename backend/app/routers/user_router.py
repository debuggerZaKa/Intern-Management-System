from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
from app.schemas.user import UserResponse, ProfileResponse, ProfileUpdate, ChangeUserRoleRequest, UpdateUserStatusRequest
from app.services.user_service import get_users, get_user_by_id, update_user_role, update_user_status, update_profile, delete_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserResponse])
def read_users(
    role_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.USER.READ))
):
   
    users = get_users(db, role_id=role_id, status_filter=status_filter)
    result = []
    for u in users:
        perms = [p.name for p in u.role.permissions] if u.role else []
        result.append(UserResponse(
            id=u.id,
            email=u.email,
            role_id=u.role_id,
            status=u.status,
            is_active=u.is_active,
            created_at=u.created_at,
            role=u.role,
            profile=u.profile,
            permissions=perms
        ))
    return result

@router.get("/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.USER.READ))
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    perms = [p.name for p in user.role.permissions] if user.role else []
    return UserResponse(
        id=user.id,
        email=user.email,
        role_id=user.role_id,
        status=user.status,
        is_active=user.is_active,
        created_at=user.created_at,
        role=user.role,
        profile=user.profile,
        permissions=perms
    )

@router.put("/profile/me", response_model=ProfileResponse)
def edit_own_profile(
    req: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_profile(db, current_user.id, req)

import os
import uuid
import shutil
from fastapi import UploadFile, File
from app.models.profile import Profile
from app.config import settings

@router.post("/profile/me/avatar", response_model=ProfileResponse)
def upload_own_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return handle_avatar_upload(db, current_user.id, file)

@router.post("/{user_id}/avatar", response_model=ProfileResponse)
def upload_user_avatar(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only the user themselves or an Admin can upload/update the profile picture
    is_admin = current_user.role and current_user.role.name == "admin"
    is_self = current_user.id == user_id
    if not (is_admin or is_self):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: Profile pictures can only be edited by the user themselves or by an administrator."
        )
    return handle_avatar_upload(db, user_id, file)

def handle_avatar_upload(db: Session, target_user_id: int, file: UploadFile) -> Profile:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image (PNG, JPG, WEBP, etc.)")
    
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "avatars")
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ".png"
    if not ext or ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]:
        ext = ".png"
    
    filename = f"avatar_{target_user_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(upload_dir, filename)

    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save image: {str(e)}")
    
    avatar_url = f"/uploads/avatars/{filename}"
    profile = db.query(Profile).filter(Profile.user_id == target_user_id).first()
    if not profile:
        profile = Profile(user_id=target_user_id, full_name="User", avatar_url=avatar_url)
        db.add(profile)
    else:
        profile.avatar_url = avatar_url

    db.commit()
    db.refresh(profile)
    return profile

@router.put("/{user_id}/role", response_model=UserResponse)
def change_role(
    user_id: int,
    req: ChangeUserRoleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.ROLE.UPDATE))
):

    user = update_user_role(db, user_id, req.role_id)
    perms = [p.name for p in user.role.permissions] if user.role else []
    return UserResponse(
        id=user.id,
        email=user.email,
        role_id=user.role_id,
        status=user.status,
        is_active=user.is_active,
        created_at=user.created_at,
        role=user.role,
        profile=user.profile,
        permissions=perms
    )

@router.put("/{user_id}/status", response_model=UserResponse)
def change_status(
    user_id: int,
    req: UpdateUserStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.USER.UPDATE))
):
   
    user = update_user_status(db, user_id, req.status)
    perms = [p.name for p in user.role.permissions] if user.role else []
    return UserResponse(
        id=user.id,
        email=user.email,
        role_id=user.role_id,
        status=user.status,
        is_active=user.is_active,
        created_at=user.created_at,
        role=user.role,
        profile=user.profile,
        permissions=perms
    )

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.USER.DELETE))
):
    delete_user(db, user_id)
    return None
