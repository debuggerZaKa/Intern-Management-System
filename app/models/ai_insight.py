from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="CASCADE"), nullable=False, index=True)
    report_id = Column(Integer, ForeignKey("weekly_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    # weekly_summary, final_narrative, risk_flag
    type = Column(String(50), default="weekly_summary", nullable=False)
    summary_text = Column(Text, nullable=False)
    # on_track, needs_attention, at_risk
    progress_status = Column(String(50), default="on_track", nullable=False)
    # Legacy field kept for backward compat
    risk_level = Column(String(50), default="on_track", nullable=False)
    risk_score = Column(Float, nullable=True)          # 0.0 – 1.0
    detected_skills = Column(Text, nullable=True)       # JSON array as text
    blockers_summary = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    needs_mentor_attention = Column(Integer, default=0, nullable=False)  # 0/1 flag
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    internship = relationship("Internship", back_populates="ai_insights")
    report = relationship("WeeklyReport", back_populates="ai_insights")


class AIChatLog(Base):
    __tablename__ = "ai_chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    context_type = Column(String(50), default="general", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="chat_logs")
