from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SignupRequest(Base):
    """
    Stores self-registration requests that require admin approval.
    Regular /auth/register creates a SignupRequest in 'pending' status.
    Admin approves or rejects it, which then activates/rejects the user account.
    """
    __tablename__ = "signup_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    # pending, approved, rejected
    status = Column(String(50), default="pending", nullable=False, index=True)
    admin_notes = Column(Text, nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", foreign_keys=[user_id], back_populates="signup_request")
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])
