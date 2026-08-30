from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class EndOfInternshipEvaluation(Base):
    __tablename__ = "end_of_internship_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="CASCADE"), unique=True, nullable=False)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    overall_rating = Column(Float, default=5.0, nullable=False)

    technical_skills_rating = Column(Float, default=3.0)
    soft_skills_rating = Column(Float, default=3.0)
    strengths = Column(Text, nullable=True)
    areas_for_improvement = Column(Text, nullable=True)

    recommendation = Column(String(50), default="undecided", nullable=False)
    final_comments = Column(Text, nullable=True)

    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    internship = relationship("Internship", back_populates="evaluation")
    mentor = relationship("User", back_populates="evaluations")
