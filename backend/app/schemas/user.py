from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from app.schemas.role import RoleResponse

class ProfileBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    semester: Optional[str] = None
    department: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    semester: Optional[str] = None
    department: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role_id: int
    status: str
    is_active: bool
    created_at: Optional[datetime] = None
    role: Optional[RoleResponse] = None
    profile: Optional[ProfileResponse] = None
    permissions: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class ChangeUserRoleRequest(BaseModel):
    role_id: int

class UpdateUserStatusRequest(BaseModel):
    status: str  # pending, active, rejected, deactivated
