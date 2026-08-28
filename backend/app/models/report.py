from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="CASCADE"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False)
    tasks_completed_summary = Column(Text, nullable=True)
    tasks_in_progress_summary = Column(Text, nullable=True)
    learnings_and_skills = Column(Text, nullable=True)
    goals_next_week = Column(Text, nullable=True)
    self_rating_productivity = Column(Integer, default=5)  # 1 - 5
    self_rating_confidence = Column(Integer, default=5)    # 1 - 5
    status = Column(String(50), default="submitted", nullable=False)  # draft, submitted, reviewed, late
    submitted_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    internship = relationship("Internship", back_populates="reports")
    blockers = relationship("Blocker", back_populates="report", cascade="all, delete-orphan")
    feedback = relationship("MentorFeedback", back_populates="report", uselist=False, cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="report", cascade="all, delete-orphan")
