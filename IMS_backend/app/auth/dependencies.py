from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.jwt_handler import decode_access_token
from app.models.user import User

# HTTP Bearer scheme for Swagger UI Authorization — accepts raw JWT token
security = HTTPBearer()


def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id_str: str = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    if not user.is_active or user.status in ("deactivated", "archived", "rejected"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive or deactivated",
        )

    return user


def require_role(*role_names: str):
    """
    Dependency factory that enforces one or more allowed roles.
    Usage: current_user: User = Depends(require_role("admin"))
           current_user: User = Depends(require_role("admin", "mentor"))
    """
    def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role and current_user.role.name in role_names:
            return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access restricted to: {', '.join(role_names)}",
        )
    return _check


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.role or current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def get_current_mentor(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.role or current_user.role.name not in ("admin", "mentor"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Mentor access required")
    return current_user


def get_current_intern(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.role or current_user.role.name != "intern":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Intern access required")
    return current_user
