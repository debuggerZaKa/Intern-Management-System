from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from app.schemas.user import UserResponse

class InternshipBase(BaseModel):
    department: str
    start_date: date
    end_date: date
    duration_weeks: int = 6
    current_week: int = 1
    status: str = "active"

class InternshipCreate(BaseModel):
    intern_id: int
    mentor_id: Optional[int] = None
    department: str
    start_date: date
    end_date: date
    duration_weeks: int = 6

class InternshipUpdate(BaseModel):
    mentor_id: Optional[int] = None
    department: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_weeks: Optional[int] = None
    current_week: Optional[int] = None
    status: Optional[str] = None

class InternshipResponse(InternshipBase):
    id: int
    intern_id: int
    mentor_id: Optional[int] = None
    duration_weeks: int = 6
    certificate_id: Optional[str] = None
    certificate_approved_at: Optional[datetime] = None
    certificate_issued_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    intern: Optional[UserResponse] = None
    mentor: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

