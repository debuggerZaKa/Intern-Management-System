from typing import List

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
                detail="User has no assigned role",
            )


        if current_user.role.name == "admin":
            return current_user

        user_permissions: List[str] = [p.name for p in current_user.role.permissions]

        if self.required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: '{self.required_permission}' required",
            )

        return current_user


def require_permission(permission_name: str) -> PermissionChecker:
   
    return PermissionChecker(permission_name)
