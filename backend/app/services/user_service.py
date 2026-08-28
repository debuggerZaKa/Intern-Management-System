from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.profile import Profile
from app.models.role import Role
from app.schemas.auth import RegisterRequest
from app.schemas.user import ProfileUpdate, ChangeUserRoleRequest, UpdateUserStatusRequest
from app.auth.hashing import get_password_hash, verify_password

def get_users(db: Session, role_id: Optional[int] = None, status_filter: Optional[str] = None) -> List[User]:
    query = db.query(User)
    if role_id:
        query = query.filter(User.role_id == role_id)
    if status_filter:
        query = query.filter(User.status == status_filter)
    return query.all()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower()).first()

def register_user(db: Session, req: RegisterRequest, default_role_name: str = "intern") -> User:
    # Check if email exists
    if get_user_by_email(db, req.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    role = db.query(Role).filter(Role.name == default_role_name).first()
    if not role:
        # Fallback to first role if specific default not found
        role = db.query(Role).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="System roles not initialized. Please run seeds."
            )
    
    hashed_pwd = get_password_hash(req.password)
    user = User(
        email=req.email.lower(),
        hashed_password=hashed_pwd,
        role_id=role.id,
        status="active",
        is_active=True
    )
    db.add(user)
    db.flush()

    profile = Profile(
        user_id=user.id,
        full_name=req.full_name,
        phone=req.phone,
        university=req.university,
        degree=req.degree,
        semester=req.semester,
        department=req.department
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def update_user_role(db: Session, user_id: int, role_id: int) -> User:
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target role not found")
    
    user.role_id = role.id
    db.commit()
    db.refresh(user)
    return user

def update_user_status(db: Session, user_id: int, new_status: str) -> User:
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.status = new_status
    if new_status in ["rejected", "deactivated"]:
        user.is_active = False
    else:
        user.is_active = True
    
    db.commit()
    db.refresh(user)
    return user

def update_profile(db: Session, user_id: int, req: ProfileUpdate) -> Profile:
    user = get_user_by_id(db, user_id)
    if not user or not user.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    
    profile = user.profile
    update_data = req.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile

def delete_user(db: Session, user_id: int) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return True
