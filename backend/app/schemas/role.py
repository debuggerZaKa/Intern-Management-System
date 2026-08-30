from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class PermissionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleResponse(RoleBase):
    id: int
    created_at: Optional[datetime] = None
    permissions: List[PermissionResponse] = []

    model_config = ConfigDict(from_attributes=True)
