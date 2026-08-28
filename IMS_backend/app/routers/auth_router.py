from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.jwt_handler import create_access_token
from app.models.user import User
from app.schemas.auth import Token, RegisterRequest, LoginRequest
from app.schemas.user import UserResponse
from app.services.user_service import register_user, authenticate_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new user. The user automatically receives the 'intern' role.
    Clients cannot supply role or permissions.
    """
    user = register_user(db, req, default_role_name="intern")
    permissions = [p.name for p in user.role.permissions] if user.role else []
    return UserResponse(
        id=user.id,
        email=user.email,
        role_id=user.role_id,
        status=user.status,
        is_active=user.is_active,
        created_at=user.created_at,
        role=user.role,
        profile=user.profile,
        permissions=permissions
    )


@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint accepting email and password JSON payload.
    Returns JWT Bearer access token.
    """
    user = authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active or user.status in ("deactivated", "archived", "rejected", "pending"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive or deactivated"
        )

    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user with their database-stored role and permissions.
    """
    permissions = [p.name for p in current_user.role.permissions] if current_user.role else []
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role_id=current_user.role_id,
        status=current_user.status,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        role=current_user.role,
        profile=current_user.profile,
        permissions=permissions
    )
