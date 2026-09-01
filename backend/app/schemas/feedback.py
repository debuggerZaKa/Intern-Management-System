from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class FeedbackBase(BaseModel):
    feedback_text: str
    rating: int = 5
    category: str = "meeting_expectations"
    action_items: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackUpdate(BaseModel):
    feedback_text: Optional[str] = None
    rating: Optional[int] = None
    category: Optional[str] = None
    action_items: Optional[str] = None

class FeedbackResponse(FeedbackBase):
    id: int
    report_id: int
    mentor_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
