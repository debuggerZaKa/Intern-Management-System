from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class BlockerBase(BaseModel):
    title: str
    description: str
    severity: str = "moderate"
    help_needed: Optional[str] = None

class BlockerCreate(BlockerBase):
    report_id: int

class BlockerUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    help_needed: Optional[str] = None

class BlockerResponse(BlockerBase):
    id: int
    report_id: int
    intern_id: int
    status: str
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
