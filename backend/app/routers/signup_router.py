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
    phone: str | None = None
    university: str | None = None
    degree: str | None = None
    semester: str | None = None


@router.post("", status_code=status.HTTP_201_CREATED)
def request_signup(req: SelfSignupRequestSchema, db: Session = Depends(get_db)):
    
    email = req.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user account or signup request with this email already exists."
        )

    intern_role = db.query(Role).filter(Role.name == "intern").first()
    if not intern_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Intern role is not configured."
        )

    user = User(
        email=email,
        hashed_password=get_password_hash(req.password),
        role_id=intern_role.id,
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
        "message": "Signup request submitted successfully. Account is pending admin approval.",
        "request_id": signup_req.id,
        "email": email,
        "status": "pending"
    }
