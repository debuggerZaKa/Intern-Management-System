from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.project_service import get_projects, get_project_by_id, create_project, update_project, delete_project

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def read_projects(
    internship_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.PROJECT.READ))
):
    return get_projects(db, current_user=current_user, internship_id=internship_id)


@router.get("/{project_id}", response_model=ProjectResponse)
def read_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.PROJECT.READ))
):
    project = get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_new_project(
    req: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.PROJECT.CREATE))
):
    return create_project(db, req, current_user)

@router.put("/{project_id}", response_model=ProjectResponse)
def edit_project(
    project_id: int,
    req: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.PROJECT.UPDATE))
):
    return update_project(db, project_id, req, current_user)

import os
import uuid
import shutil
from fastapi import UploadFile, File

@router.post("/{project_id}/image", response_model=ProjectResponse)
def upload_project_image(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    is_admin = current_user.role and current_user.role.name == "admin"
    is_mentor = project.internship and project.internship.mentor_id == current_user.id
    is_intern = project.internship and project.internship.intern_id == current_user.id

    if not (is_admin or is_mentor or is_intern):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: Only the assigned mentor, intern, or an admin can upload images for this project."
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image (PNG, JPG, WEBP, etc.)")
    
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "projects")
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ".png"
    if not ext or ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]:
        ext = ".png"
    
    filename = f"project_{project_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(upload_dir, filename)

    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save project image: {str(e)}")
    
    project.image_url = f"/uploads/projects/{filename}"
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.PROJECT.DELETE))
):
    delete_project(db, project_id, current_user)
    return None
