import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import get_tasks, get_task_by_id, create_task, update_task, delete_task

router = APIRouter(prefix="/tasks", tags=["Tasks"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[TaskResponse])
def read_tasks(
    intern_id: Optional[int] = None,
    project_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    week_number: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.TASK.READ))
):
    # If intern, default to their own tasks
    if current_user.role.name == "intern" and not intern_id:
        intern_id = current_user.id
    
    return get_tasks(
        db,
        intern_id=intern_id,
        project_id=project_id,
        status_filter=status_filter,
        week_number=week_number
    )

@router.post("/upload")
async def upload_task_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
            
        file_url = f"/uploads/{unique_name}"
        return {
            "filename": file.filename,
            "url": file_url
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"File upload failed: {str(e)}")

@router.get("/{task_id}", response_model=TaskResponse)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.TASK.READ))
):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(
    req: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.TASK.CREATE))
):
    return create_task(db, req, current_user)

@router.put("/{task_id}", response_model=TaskResponse)
def edit_task(
    task_id: int,
    req: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.TASK.UPDATE))
):
    return update_task(db, task_id, req, current_user)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.TASK.DELETE))
):
    delete_task(db, task_id, current_user)
    return None
