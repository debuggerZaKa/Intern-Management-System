from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class WeeklyReport(Base):
    __tablename__ = "weekly_reports"
    __table_args__ = (
       
        UniqueConstraint("internship_id", "week_number", name="uq_report_internship_week"),
    )

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="CASCADE"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False)
    tasks_completed_summary = Column(Text, nullable=True)
    tasks_in_progress_summary = Column(Text, nullable=True)
    learnings_and_skills = Column(Text, nullable=True)
    goals_next_week = Column(Text, nullable=True)
    # 1-5 ratings
    self_rating_productivity = Column(Integer, default=3, nullable=False)
    self_rating_confidence = Column(Integer, default=3, nullable=False)
    # draft, submitted, reviewed, late
    status = Column(String(50), default="submitted", nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    internship = relationship("Internship", back_populates="reports")
    blockers = relationship("Blocker", back_populates="report", cascade="all, delete-orphan")
    feedback = relationship("MentorFeedback", back_populates="report", uselist=False, cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="report", cascade="all, delete-orphan")
