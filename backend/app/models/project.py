from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(String(255), nullable=True)  # comma separated or json string
    repo_url = Column(String(255), nullable=True)
    status = Column(String(50), default="in_progress", nullable=False)  # not_started, in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)

    internship = relationship("Internship", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
