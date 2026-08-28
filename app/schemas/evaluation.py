from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class EvaluationBase(BaseModel):
    overall_rating: float = 8.0  # 1-10
    technical_skills_rating: float = 4.0
    soft_skills_rating: float = 4.0
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    recommendation: str = "hire"  # hire, extend, do_not_hire, undecided
    final_comments: Optional[str] = None

class EvaluationCreate(EvaluationBase):
    pass

class EvaluationUpdate(BaseModel):
    overall_rating: Optional[float] = None
    technical_skills_rating: Optional[float] = None
    soft_skills_rating: Optional[float] = None
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    recommendation: Optional[str] = None
    final_comments: Optional[str] = None

class EvaluationResponse(EvaluationBase):
    id: int
    internship_id: int
    mentor_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
