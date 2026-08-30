from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Blocker(Base):
    __tablename__ = "blockers"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("weekly_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    intern_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    severity = Column(String(50), default="moderate", nullable=False)

    status = Column(String(50), default="unresolved", nullable=False)
    help_needed = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    report = relationship("WeeklyReport", back_populates="blockers")
    intern = relationship("User")
