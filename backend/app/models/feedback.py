from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class MentorFeedback(Base):
    __tablename__ = "mentor_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("weekly_reports.id", ondelete="CASCADE"), unique=True, nullable=False)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    feedback_text = Column(Text, nullable=False)
    rating = Column(Integer, default=5, nullable=False)  # 1 - 5 stars
    category = Column(String(50), default="meeting_expectations", nullable=False)  # meeting_expectations, exceeding, needs_improvement, critical_attention
    action_items = Column(Text, nullable=True)  # JSON or bullet points
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    report = relationship("WeeklyReport", back_populates="feedback")
    mentor = relationship("User", back_populates="feedbacks")
