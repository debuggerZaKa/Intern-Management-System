from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.task import Task
from app.models.project import Project
from app.models.internship import Internship
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected project not found")
    
    # Task belongs to the project's assigned intern
    intern_id = None
    if project.internship and project.internship.intern_id:
        intern_id = project.internship.intern_id
    elif current_user.role.name == "intern":
        intern_id = current_user.id
    else:
        # If no intern directly on project, check active internships
        first_active = db.query(Internship).filter(Internship.status == "active").first()
        intern_id = first_active.intern_id if first_active else current_user.id
    
    task = Task(
        project_id=req.project_id,
        intern_id=intern_id,
        created_by_id=current_user.id,
        title=req.title,
        description=req.description,
        mentor_notes=req.mentor_notes,
        submission_notes=req.submission_notes,
        submission_url=req.submission_url,
        attachment_url=req.attachment_url,
        priority=req.priority,
        status=req.status or "todo",
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
    
    # Interns can update status, submission notes/URLs, and actual_hours on their assigned tasks
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
    
    # Interns cannot delete tasks assigned by mentors
    if current_user.role.name == "intern":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Interns cannot delete mentor-assigned tasks")
    
    db.delete(task)
    db.commit()
    return True
