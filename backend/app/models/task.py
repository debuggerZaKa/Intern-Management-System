from sqlalchemy import Column, Integer, String, Text, Date, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    intern_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
  
    priority = Column(String(50), default="medium", nullable=False)
 
    status = Column(String(50), default="todo", nullable=False)
    week_number = Column(Integer, default=1, nullable=False)
    due_date = Column(Date, nullable=True)
    estimated_hours = Column(Float, default=0.0)
    actual_hours = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    project = relationship("Project", back_populates="tasks")
    intern = relationship("User", foreign_keys=[intern_id], back_populates="tasks_assigned")
    created_by = relationship("User", foreign_keys=[created_by_id], back_populates="tasks_created")
