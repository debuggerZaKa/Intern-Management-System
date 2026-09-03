from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime

class ProjectInternshipInfo(BaseModel):
    id: int
    intern_id: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    current_week: int = 1
    duration_weeks: int = 6

    model_config = ConfigDict(from_attributes=True)

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    repo_url: Optional[str] = None
    image_url: Optional[str] = None
    status: str = "in_progress"

class ProjectCreate(ProjectBase):
    internship_id: Optional[int] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[str] = None
    repo_url: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    internship_id: int
    created_at: Optional[datetime] = None
    internship: Optional[ProjectInternshipInfo] = None

    model_config = ConfigDict(from_attributes=True)
