from sqlalchemy import Column, Integer, DateTime, ForeignKey, Boolean, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class MentorInternAssignment(Base):
    
    __tablename__ = "mentor_intern_assignments"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="CASCADE"), nullable=False, index=True)
    intern_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    assigned_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    notes = Column(String(500), nullable=True)

    internship = relationship("Internship", back_populates="assignments")
    intern = relationship("User", foreign_keys=[intern_id], back_populates="assignments")
    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="mentor_assignments")
    assigned_by = relationship("User", foreign_keys=[assigned_by_id])
