from datetime import date, datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.task import Task
from app.models.project import Project
from app.models.internship import Internship
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskSubmitRequest

def calculate_week_number(start_date: Optional[date], target_date: Optional[date]) -> int:
    if not start_date or not target_date:
        return 1
    start_monday = start_date - timedelta(days=start_date.weekday())
    target_monday = target_date - timedelta(days=target_date.weekday())
    diff_days = (target_monday - start_monday).days
    diff_weeks = diff_days // 7
    return max(1, diff_weeks + 1)

def get_tasks(
    db: Session,
    current_user: User,
    intern_id: Optional[int] = None,
    project_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    week_number: Optional[int] = None
) -> List[Task]:
    query = db.query(Task)
    
    if current_user.role.name == "mentor":
        query = query.join(Project, Task.project_id == Project.id).join(Internship, Project.internship_id == Internship.id).filter(Internship.mentor_id == current_user.id)
    elif current_user.role.name == "intern":
        query = query.filter(Task.intern_id == current_user.id)

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

def submit_task(db: Session, task_id: int, req: TaskSubmitRequest, current_user: User) -> Task:
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if current_user.role.name == "intern" and task.intern_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot submit deliverables for another intern's task")

    task.submission_notes = req.submission_notes
    task.submission_url = req.submission_url
    task.attachment_url = req.attachment_url
    task.submitted_at = datetime.now(timezone.utc)
    task.status = "done"
    db.commit()
    db.refresh(task)
    return task


def create_task(db: Session, req: TaskCreate, current_user: User) -> Task:
    project = db.query(Project).filter(Project.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected project not found")
    
    # Check if project's internship is already completed (immutable record)
    if project.internship and project.internship.status in ["completed", "terminated"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign tasks to a completed or terminated internship record."
        )

    # Determine assigned target interns
    target_intern_ids = []
    if req.intern_ids and len(req.intern_ids) > 0:
        target_intern_ids = list(set(req.intern_ids))
    elif req.intern_id:
        target_intern_ids = [req.intern_id]
    elif project.internship and project.internship.intern_id:
        target_intern_ids = [project.internship.intern_id]
    elif current_user.role.name == "intern":
        target_intern_ids = [current_user.id]
    else:
        first_active = db.query(Internship).filter(Internship.status == "active").first()
        target_intern_ids = [first_active.intern_id] if first_active else [current_user.id]
    
    week_num = req.week_number
    if (not week_num or week_num < 1) and req.due_date:
        start_date = project.internship.start_date if project.internship else None
        week_num = calculate_week_number(start_date, req.due_date)
    elif not week_num:
        week_num = 1

    created_tasks = []
    for intern_id in target_intern_ids:
        # Check target intern's internship status if exists
        target_internship = db.query(Internship).filter(
            Internship.intern_id == intern_id,
            Internship.status.in_(["active", "extended"])
        ).first()

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
            week_number=week_num,
            due_date=req.due_date,
            estimated_hours=req.estimated_hours,
            actual_hours=req.actual_hours
        )
        db.add(task)
        created_tasks.append(task)

    db.commit()
    for t in created_tasks:
        db.refresh(t)

    return created_tasks[0]

def update_task(db: Session, task_id: int, req: TaskUpdate, current_user: User) -> Task:
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Check if project's internship is completed
    if task.project and task.project.internship and task.project.internship.status in ["completed", "terminated"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify tasks belonging to a completed internship record."
        )

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
    
    # Check if project's internship is completed
    if task.project and task.project.internship and task.project.internship.status in ["completed", "terminated"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete tasks belonging to a completed internship record."
        )

    # Interns cannot delete tasks assigned by mentors
    if current_user.role.name == "intern":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Interns cannot delete mentor-assigned tasks")
    
    db.delete(task)
    db.commit()
    return True
