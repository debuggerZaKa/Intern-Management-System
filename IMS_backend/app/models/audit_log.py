from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class AuditLog(Base):
    """
    Immutable log of important admin/security events.
    Never log passwords, API keys, JWT secrets, or credentials.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    # The user who performed the action
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    # The target user affected (if any)
    target_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    # e.g. user_created, signup_approved, intern_assigned, account_deactivated
    action = Column(String(100), nullable=False, index=True)
    # JSON string with non-sensitive context
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    actor = relationship("User", foreign_keys=[actor_id], back_populates="audit_logs")
    target_user = relationship("User", foreign_keys=[target_user_id])
