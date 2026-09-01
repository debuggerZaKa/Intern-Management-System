import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.auth.dependencies import get_db
from app.auth.hashing import get_password_hash
from app.models.user import User
from app.models.profile import Profile
from app.models.role import Role
from app.models.signup_request import SignupRequest

router = APIRouter(prefix="/signup", tags=["Signup Workflow"])


class SelfSignupRequestSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    department: str
    role_name: Optional[str] = "intern"
    phone: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    semester: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED)
def request_signup(req: SelfSignupRequestSchema, db: Session = Depends(get_db)):
    email = req.email.lower().strip()
    
    # Password complexity check (8+ chars)
    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # Check for existing email in users
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user account or signup request with this email already exists."
        )

    requested_role = req.role_name.lower().strip() if req.role_name else "intern"
    if requested_role not in ("intern", "mentor"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'intern' or 'mentor'."
        )

    target_role = db.query(Role).filter(Role.name == requested_role).first()
    if not target_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Requested role '{requested_role}' is not configured."
        )

    user = User(
        email=email,
        hashed_password=get_password_hash(req.password),
        role_id=target_role.id,
        status="pending",
        is_active=False
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

    signup_req = SignupRequest(
        user_id=user.id,
        status="pending"
    )
    db.add(signup_req)

    db.commit()
    db.refresh(signup_req)

    return {
        "message": f"Signup request for {requested_role.capitalize()} submitted successfully. Account is pending admin approval.",
        "request_id": signup_req.id,
        "email": email,
        "role": requested_role,
        "status": "pending"
    }
