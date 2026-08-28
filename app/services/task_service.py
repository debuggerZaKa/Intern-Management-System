from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.task import Task
from app.models.project import Project
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate

def get_tasks(
    db: Session,
    intern_id: Optional[int] = None,
    project_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    week_number: Optional[int] = None
) -> List[Task]:
    query = db.query(Task)
    if intern_id:
        query = query.filter(Task.intern_id == intern_id)
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status_filter:
        query = query.filter(Task.status == status_filter)
    if week_number:
        query = query.filter(Task.week_number == week_number)
    return query.all()

def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
    return db.query(Task).filter(Task.id == task_id).first()

def create_task(db: Session, req: TaskCreate, current_user: User) -> Task:
    project = db.query(Project).filter(Project.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    task = Task(
        project_id=req.project_id,
        intern_id=current_user.id,
        title=req.title,
        description=req.description,
        priority=req.priority,
        status=req.status,
        week_number=req.week_number,
        due_date=req.due_date,
        estimated_hours=req.estimated_hours,
        actual_hours=req.actual_hours
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def update_task(db: Session, task_id: int, req: TaskUpdate, current_user: User) -> Task:
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Interns can only update their own tasks
    if current_user.role.name == "intern" and task.intern_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another intern's task")
    
    update_data = req.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int, current_user: User) -> bool:
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Ownership verification
    if current_user.role.name == "intern" and task.intern_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another intern's task")
    
    db.delete(task)
    db.commit()
    return True
