from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.report import WeeklyReport
from app.models.internship import Internship
from app.models.user import User
from app.schemas.report import WeeklyReportCreate, WeeklyReportUpdate

def get_reports(db: Session, internship_id: Optional[int] = None, week_number: Optional[int] = None) -> List[WeeklyReport]:
    query = db.query(WeeklyReport)
    if internship_id:
        query = query.filter(WeeklyReport.internship_id == internship_id)
    if week_number:
        query = query.filter(WeeklyReport.week_number == week_number)
    return query.order_by(WeeklyReport.week_number.asc()).all()

def get_report_by_id(db: Session, report_id: int) -> Optional[WeeklyReport]:
    return db.query(WeeklyReport).filter(WeeklyReport.id == report_id).first()

def submit_weekly_report(db: Session, req: WeeklyReportCreate, current_user: User) -> WeeklyReport:
    internship_id = req.internship_id
    if not internship_id:
        active_internship = db.query(Internship).filter(
            Internship.intern_id == current_user.id,
            Internship.status == "active"
        ).first()
        if not active_internship:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active internship found")
        internship_id = active_internship.id
    
    # Check if a report for this week already exists
    existing = db.query(WeeklyReport).filter(
        WeeklyReport.internship_id == internship_id,
        WeeklyReport.week_number == req.week_number
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Report for Week {req.week_number} already submitted"
        )
    
    report = WeeklyReport(
        internship_id=internship_id,
        week_number=req.week_number,
        tasks_completed_summary=req.tasks_completed_summary,
        tasks_in_progress_summary=req.tasks_in_progress_summary,
        learnings_and_skills=req.learnings_and_skills,
        goals_next_week=req.goals_next_week,
        self_rating_productivity=req.self_rating_productivity,
        self_rating_confidence=req.self_rating_confidence,
        status=req.status
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

def update_weekly_report(db: Session, report_id: int, req: WeeklyReportUpdate, current_user: User) -> WeeklyReport:
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    
    # Intern ownership check
    if current_user.role.name == "intern" and report.internship.intern_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another intern's report")
    
    update_data = req.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(report, field, value)
    
    db.commit()
    db.refresh(report)
    return report
