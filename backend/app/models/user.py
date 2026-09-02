from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)

    status = Column(String(50), default="active", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    role = relationship("Role", back_populates="users", lazy="joined")
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="joined")

    internships_as_intern = relationship("Internship", foreign_keys="[Internship.intern_id]", back_populates="intern")
    internships_as_mentor = relationship("Internship", foreign_keys="[Internship.mentor_id]", back_populates="mentor")

    tasks_assigned = relationship("Task", foreign_keys="[Task.intern_id]", back_populates="intern")
    tasks_created = relationship("Task", foreign_keys="[Task.created_by_id]", back_populates="created_by")

    feedbacks = relationship("MentorFeedback", back_populates="mentor")
    evaluations = relationship("EndOfInternshipEvaluation", back_populates="mentor")
    chat_logs = relationship("AIChatLog", back_populates="user")

    signup_request = relationship("SignupRequest", foreign_keys="[SignupRequest.user_id]", back_populates="user", uselist=False)
    audit_logs = relationship("AuditLog", foreign_keys="[AuditLog.actor_id]", back_populates="actor")

    # Assignments as intern
    assignments = relationship("MentorInternAssignment", foreign_keys="[MentorInternAssignment.intern_id]", back_populates="intern")
    # Assignments as mentor
    mentor_assignments = relationship("MentorInternAssignment", foreign_keys="[MentorInternAssignment.mentor_id]", back_populates="mentor")

    # Mentorship Requests
    mentorship_requests_sent = relationship("MentorshipRequest", foreign_keys="[MentorshipRequest.mentor_id]", back_populates="mentor")
    mentorship_requests_received = relationship("MentorshipRequest", foreign_keys="[MentorshipRequest.intern_id]", back_populates="intern")

