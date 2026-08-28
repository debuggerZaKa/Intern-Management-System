from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)
    status = Column(String(50), default="active", nullable=False)  # pending, active, rejected, deactivated
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    role = relationship("Role", back_populates="users", lazy="joined")
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="joined")
    
    # Relationships for internships
    internships_as_intern = relationship("Internship", foreign_keys="[Internship.intern_id]", back_populates="intern")
    internships_as_mentor = relationship("Internship", foreign_keys="[Internship.mentor_id]", back_populates="mentor")
    
    # Tasks created/assigned
    tasks = relationship("Task", back_populates="intern")
    feedbacks = relationship("MentorFeedback", back_populates="mentor")
    evaluations = relationship("EndOfInternshipEvaluation", back_populates="mentor")
    chat_logs = relationship("AIChatLog", back_populates="user")
