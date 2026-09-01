import secrets
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, get_current_user
from app.auth.jwt_handler import create_access_token
from app.auth.hashing import get_password_hash, verify_password
from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.models.audit_log import AuditLog
from app.schemas.auth import Token, RegisterRequest, LoginRequest
from app.schemas.user import UserResponse
from app.services.user_service import register_user, authenticate_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


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
            detail="User account is inactive, pending approval, or deactivated."
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


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Generates a password reset token for the given email address.
    """
    email = req.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Avoid user enumeration in production, but provide helpful response
        return {
            "message": "If an account exists with this email, a password reset token has been generated.",
            "status": "success"
        }

    token_str = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=2)

    reset_entry = PasswordResetToken(
        user_id=user.id,
        token=token_str,
        expires_at=expires_at,
        is_used=False
    )
    db.add(reset_entry)

    # Log to audit trail
    audit = AuditLog(
        actor_id=user.id,
        target_user_id=user.id,
        action="FORGOT_PASSWORD_REQUEST",
        details=f"Password reset requested for {user.email}"
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Password reset token generated successfully. In corporate deployment, this is sent via email.",
        "reset_token": token_str,
        "expires_in_hours": 2,
        "status": "success"
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Resets password using a valid reset token.
    """
    if len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    token_entry = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == req.token,
        PasswordResetToken.is_used == False
    ).first()

    if not token_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or already used password reset token."
        )

    now_utc = datetime.now(timezone.utc)
    # Ensure timezone awareness for comparison
    expires_at = token_entry.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now_utc > expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired. Please request a new one."
        )

    user = token_entry.user
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.hashed_password = get_password_hash(req.new_password)
    token_entry.is_used = True

    audit = AuditLog(
        actor_id=user.id,
        target_user_id=user.id,
        action="PASSWORD_RESET_COMPLETED",
        details=f"Password reset successfully with token for {user.email}"
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Password has been successfully reset. You can now login with your new password.",
        "status": "success"
    }


@router.put("/change-password")
def change_password(
    req: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows authenticated users to change their own password.
    """
    if not verify_password(req.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password."
        )

    if len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )

    current_user.hashed_password = get_password_hash(req.new_password)

    audit = AuditLog(
        actor_id=current_user.id,
        target_user_id=current_user.id,
        action="PASSWORD_CHANGED",
        details=f"User {current_user.email} changed their password."
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Password changed successfully.",
        "status": "success"
    }
