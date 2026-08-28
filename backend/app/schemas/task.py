from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"  # low, medium, high, critical
    status: str = "todo"      # todo, in_progress, in_review, done
    week_number: int = 1
    due_date: Optional[date] = None
    estimated_hours: float = 0.0
    actual_hours: float = 0.0

class TaskCreate(TaskBase):
    project_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    week_number: Optional[int] = None
    due_date: Optional[date] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None

class TaskResponse(TaskBase):
    id: int
    project_id: int
    intern_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
