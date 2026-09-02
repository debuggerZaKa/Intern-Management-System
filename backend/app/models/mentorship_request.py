from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    intern_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="pending", nullable=False, index=True)  # pending, accepted, rejected, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    responded_at = Column(DateTime(timezone=True), nullable=True)

    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="mentorship_requests_sent")
    intern = relationship("User", foreign_keys=[intern_id], back_populates="mentorship_requests_received")
