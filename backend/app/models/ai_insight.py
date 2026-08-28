from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="CASCADE"), nullable=False, index=True)
    report_id = Column(Integer, ForeignKey("weekly_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    type = Column(String(50), default="weekly_summary", nullable=False)  # weekly_summary, final_narrative, blocker_cluster, risk_flag
    summary_text = Column(Text, nullable=False)
    risk_level = Column(String(50), default="on_track", nullable=False)  # on_track, monitor, at_risk
    generated_at = Column(DateTime, default=datetime.utcnow)

    internship = relationship("Internship", back_populates="ai_insights")
    report = relationship("WeeklyReport", back_populates="ai_insights")


class AIChatLog(Base):
    __tablename__ = "ai_chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    context_type = Column(String(50), default="general", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_logs")
