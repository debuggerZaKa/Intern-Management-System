from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.internship import Internship
from app.models.user import User
from app.schemas.internship import InternshipCreate, InternshipUpdate

def get_internships(db: Session, mentor_id: Optional[int] = None, intern_id: Optional[int] = None) -> List[Internship]:
    query = db.query(Internship)
    if mentor_id:
        query = query.filter(Internship.mentor_id == mentor_id)
    if intern_id:
        query = query.filter(Internship.intern_id == intern_id)
    return query.all()

def get_internship_by_id(db: Session, internship_id: int) -> Optional[Internship]:
    return db.query(Internship).filter(Internship.id == internship_id).first()

def get_intern_active_internship(db: Session, intern_id: int) -> Optional[Internship]:
    return db.query(Internship).filter(Internship.intern_id == intern_id, Internship.status.in_(["active", "extended"])).first()

def create_internship(db: Session, req: InternshipCreate) -> Internship:
    intern = db.query(User).filter(User.id == req.intern_id).first()
    if not intern:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Intern not found")
    
    if req.mentor_id:
        mentor = db.query(User).filter(User.id == req.mentor_id).first()
        if not mentor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")

    # Compute duration_weeks from the provided value or derive from date range as fallback
    from math import ceil
    date_derived_weeks = max(1, ceil((req.end_date - req.start_date).days / 7))
    duration_weeks = req.duration_weeks if req.duration_weeks and req.duration_weeks > 0 else date_derived_weeks

    internship = Internship(
        intern_id=req.intern_id,
        mentor_id=req.mentor_id,
        department=req.department,
        start_date=req.start_date,
        end_date=req.end_date,
        duration_weeks=duration_weeks,
        current_week=1,
        status="active"
    )
    db.add(internship)
    db.commit()
    db.refresh(internship)
    return internship





def update_internship(db: Session, internship_id: int, req: InternshipUpdate) -> Internship:
    internship = get_internship_by_id(db, internship_id)
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    
    update_data = req.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(internship, field, value)
    
    db.commit()
    db.refresh(internship)
    return internship
