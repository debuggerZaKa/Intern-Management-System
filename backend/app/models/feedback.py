from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class MentorFeedback(Base):
    __tablename__ = "mentor_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("weekly_reports.id", ondelete="CASCADE"), unique=True, nullable=False)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    feedback_text = Column(Text, nullable=False)

    rating = Column(Integer, default=3, nullable=False)

    category = Column(String(50), default="meeting_expectations", nullable=False)
    action_items = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    report = relationship("WeeklyReport", back_populates="feedback")
    mentor = relationship("User", back_populates="feedbacks")
