from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.blocker import BlockerResponse
from app.schemas.feedback import FeedbackResponse

class WeeklyReportBase(BaseModel):
    week_number: int
    tasks_completed_summary: Optional[str] = None
    tasks_in_progress_summary: Optional[str] = None
    learnings_and_skills: Optional[str] = None
    goals_next_week: Optional[str] = None
    self_rating_productivity: Optional[int] = 5
    self_rating_confidence: Optional[int] = 5

class WeeklyReportCreate(WeeklyReportBase):
    internship_id: Optional[int] = None
    status: str = "submitted"

class WeeklyReportUpdate(BaseModel):
    tasks_completed_summary: Optional[str] = None
    tasks_in_progress_summary: Optional[str] = None
    learnings_and_skills: Optional[str] = None
    goals_next_week: Optional[str] = None
    self_rating_productivity: Optional[int] = None
    self_rating_confidence: Optional[int] = None
    status: Optional[str] = None

class WeeklyReportResponse(WeeklyReportBase):
    id: int
    internship_id: int
    status: str
    submitted_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    blockers: List[BlockerResponse] = []
    feedback: Optional[FeedbackResponse] = None

    model_config = ConfigDict(from_attributes=True)
