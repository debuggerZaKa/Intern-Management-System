from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.project import Project
from app.models.internship import Internship
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate

def get_projects(db: Session, current_user: User, internship_id: Optional[int] = None) -> List[Project]:
    query = db.query(Project).join(Internship, Project.internship_id == Internship.id)
    
    if current_user.role.name == "mentor":
        query = query.filter(Internship.mentor_id == current_user.id)
    elif current_user.role.name == "intern":
        query = query.filter(Internship.intern_id == current_user.id)

    if internship_id:
        query = query.filter(Project.internship_id == internship_id)

    return query.all()

def get_project_by_id(db: Session, project_id: int) -> Optional[Project]:
    return db.query(Project).filter(Project.id == project_id).first()

def create_project(db: Session, req: ProjectCreate, current_user: User) -> Project:
    internship_id = req.internship_id
    if not internship_id:
        if current_user.role.name == "mentor":
            # Find first active internship for this mentor
            active_internship = db.query(Internship).filter(
                Internship.mentor_id == current_user.id,
                Internship.status.in_(["active", "extended"])
            ).first()
        else:
            active_internship = db.query(Internship).filter(
                Internship.intern_id == current_user.id,
                Internship.status.in_(["active", "extended"])
            ).first()

        if not active_internship:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active internship track found to assign project to"
            )
        internship_id = active_internship.id
    else:
        # Verify mentor or intern has access to this internship
        internship = db.query(Internship).filter(Internship.id == internship_id).first()
        if not internship:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
        if internship.status in ["completed", "terminated"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot assign projects to a completed or terminated internship record.")
        if current_user.role.name == "mentor" and internship.mentor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot assign project to an intern not assigned to you")
        if current_user.role.name == "intern" and internship.intern_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create project on another intern's track")

    project = Project(
        internship_id=internship_id,
        title=req.title,
        description=req.description,
        technologies=req.technologies,
        repo_url=req.repo_url,
        image_url=req.image_url,
        status=req.status or "in_progress"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project_id: int, req: ProjectUpdate, current_user: User) -> Project:
    project = get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    if project.internship and project.internship.status in ["completed", "terminated"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot edit projects on a completed internship record.")

    # Ownership verification: if intern, must own the internship
    if current_user.role.name == "intern" and project.internship.intern_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another intern's project")
    
    update_data = req.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project

def delete_project(db: Session, project_id: int, current_user: User) -> bool:
    project = get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    if project.internship and project.internship.status in ["completed", "terminated"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete projects on a completed internship record.")

    # Ownership verification
    if current_user.role.name == "intern" and project.internship.intern_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another intern's project")
    
    # Clean up uploaded cover file if exists
    if project.image_url:
        try:
            import os
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            file_path = os.path.join(base_dir, project.image_url.lstrip("/\\"))
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass

    db.delete(project)
    db.commit()
    return True
