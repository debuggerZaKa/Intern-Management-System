from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class FeedbackBase(BaseModel):
    feedback_text: str
    rating: int = 5  # 1-5
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
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
