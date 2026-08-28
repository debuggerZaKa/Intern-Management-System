from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    # RESTRICT: deleting a user does NOT cascade-delete internship history
    intern_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    department = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    # Duration from config; stored here for historical accuracy
    duration_weeks = Column(Integer, nullable=False, default=6)
    current_week = Column(Integer, default=1, nullable=False)
    # active, completed, extended, terminated
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    intern = relationship("User", foreign_keys=[intern_id], back_populates="internships_as_intern")
    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="internships_as_mentor")

    projects = relationship("Project", back_populates="internship", cascade="all, delete-orphan")
    reports = relationship("WeeklyReport", back_populates="internship", cascade="all, delete-orphan")
    evaluation = relationship("EndOfInternshipEvaluation", back_populates="internship", uselist=False, cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="internship", cascade="all, delete-orphan")
    assignments = relationship("MentorInternAssignment", back_populates="internship", cascade="all, delete-orphan")
