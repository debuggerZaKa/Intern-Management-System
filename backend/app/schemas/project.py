from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    repo_url: Optional[str] = None
    status: str = "in_progress"

class ProjectCreate(ProjectBase):
    internship_id: Optional[int] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[str] = None
    repo_url: Optional[str] = None
    status: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    internship_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
