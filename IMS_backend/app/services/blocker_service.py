from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.blocker import Blocker
from app.models.report import WeeklyReport
from app.models.user import User
from app.schemas.blocker import BlockerCreate, BlockerUpdate

def get_blockers(db: Session, intern_id: Optional[int] = None, status_filter: Optional[str] = None) -> List[Blocker]:
    query = db.query(Blocker)
    if intern_id:
        query = query.filter(Blocker.intern_id == intern_id)
    if status_filter:
        query = query.filter(Blocker.status == status_filter)
    return query.all()

def get_blocker_by_id(db: Session, blocker_id: int) -> Optional[Blocker]:
    return db.query(Blocker).filter(Blocker.id == blocker_id).first()

def create_blocker(db: Session, req: BlockerCreate, current_user: User) -> Blocker:
    report = db.query(WeeklyReport).filter(WeeklyReport.id == req.report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weekly report not found")
    
    blocker = Blocker(
        report_id=req.report_id,
        intern_id=current_user.id,
        title=req.title,
        description=req.description,
        severity=req.severity,
        status="unresolved",
        help_needed=req.help_needed
    )
    db.add(blocker)
    db.commit()
    db.refresh(blocker)
    return blocker

def update_blocker(db: Session, blocker_id: int, req: BlockerUpdate, current_user: User) -> Blocker:
    blocker = get_blocker_by_id(db, blocker_id)
    if not blocker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blocker not found")
    
    update_data = req.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(blocker, field, value)
    
    if req.status == "resolved" and not blocker.resolved_at:
        blocker.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(blocker)
    return blocker
