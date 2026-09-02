from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel


class MentorshipRequestCreate(BaseModel):
    intern_id: int
    notes: Optional[str] = None


class MentorshipRequestRespond(BaseModel):
    action: str  # "accept" or "reject"


class MentorBrief(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    avatar_url: Optional[str] = None


class InternBrief(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    department: Optional[str] = None
    university: Optional[str] = None
    avatar_url: Optional[str] = None
    current_mentor_id: Optional[int] = None
    current_mentor_name: Optional[str] = None
    is_assigned_to_me: Optional[bool] = False
    request_status: Optional[str] = None  # None, "pending", "accepted", "rejected"
    request_id: Optional[int] = None


class MentorshipRequestResponse(BaseModel):
    id: int
    mentor_id: int
    intern_id: int
    status: str
    notes: Optional[str] = None
    created_at: datetime
    responded_at: Optional[datetime] = None
    mentor: Optional[MentorBrief] = None
    intern: Optional[InternBrief] = None

    class Config:
        from_attributes = True
