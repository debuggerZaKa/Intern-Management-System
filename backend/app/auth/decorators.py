from functools import wraps
from typing import Callable, List
from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.auth.dependencies import get_current_user

class PermissionChecker:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if not current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has no assigned role"
            )
        
        # Admin has bypass access
        if current_user.role.name == "admin":
            return current_user
        
        user_permissions: List[str] = [p.name for p in current_user.role.permissions]
        
        if self.required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: required '{self.required_permission}'"
            )
        
        return current_user

def require_permission(permission_name: str):
    """
    Dependency or decorator for checking database-backed permissions.
    Usage in FastAPI routes:
        current_user: User = Depends(require_permission("report:create"))
    Or as decorator:
        @require_permission("report:create")
        async def my_endpoint(current_user: User = Depends(get_current_user)):
            ...
    """
    checker = PermissionChecker(permission_name)
    return checker
