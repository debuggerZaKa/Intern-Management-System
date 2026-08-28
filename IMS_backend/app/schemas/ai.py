from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class AISummaryResponse(BaseModel):
    report_id: Optional[int] = None
    internship_id: int
    summary_text: str
    risk_level: str
    key_points: List[str] = []
    generated_at: datetime

class AIChatRequest(BaseModel):
    query: str
    intern_id: Optional[int] = None
    week_number: Optional[int] = None

class AIChatResponse(BaseModel):
    query: str
    response: str
    context: Optional[dict] = None
    created_at: datetime

class AIFinalSummaryResponse(BaseModel):
    internship_id: int
    overall_narrative: str
    skills_acquired: List[str] = []
    highlight_achievements: List[str] = []
    blockers_summary: str
    recommended_focus_areas: List[str] = []
    generated_at: datetime
