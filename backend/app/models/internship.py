from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    department = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    current_week = Column(Integer, default=1, nullable=False)
    status = Column(String(50), default="active", nullable=False)  # active, completed, extended, terminated
    created_at = Column(DateTime, default=datetime.utcnow)

    intern = relationship("User", foreign_keys=[intern_id], back_populates="internships_as_intern")
    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="internships_as_mentor")
    
    projects = relationship("Project", back_populates="internship", cascade="all, delete-orphan")
    reports = relationship("WeeklyReport", back_populates="internship", cascade="all, delete-orphan")
    evaluation = relationship("EndOfInternshipEvaluation", back_populates="internship", uselist=False, cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="internship", cascade="all, delete-orphan")
