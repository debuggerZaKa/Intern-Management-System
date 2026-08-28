from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    # Stored as JSON array string, e.g. '["Python","FastAPI","PostgreSQL"]'
    technologies = Column(Text, nullable=True)
    repo_url = Column(String(255), nullable=True)
    # not_started, in_progress, completed
    status = Column(String(50), default="in_progress", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    internship = relationship("Internship", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
