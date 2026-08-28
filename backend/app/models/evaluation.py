from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class EndOfInternshipEvaluation(Base):
    __tablename__ = "end_of_internship_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="CASCADE"), unique=True, nullable=False)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_rating = Column(Float, default=8.0, nullable=False)  # 1 - 10
    technical_skills_rating = Column(Float, default=4.0)        # 1 - 5
    soft_skills_rating = Column(Float, default=4.0)             # 1 - 5
    strengths = Column(Text, nullable=True)
    areas_for_improvement = Column(Text, nullable=True)
    recommendation = Column(String(50), default="hire", nullable=False)  # hire, extend, do_not_hire, undecided
    final_comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    internship = relationship("Internship", back_populates="evaluation")
    mentor = relationship("User", back_populates="evaluations")
