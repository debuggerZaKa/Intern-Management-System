from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
from app.schemas.report import WeeklyReportCreate, WeeklyReportUpdate, WeeklyReportResponse
from app.services.report_service import get_reports, get_report_by_id, submit_weekly_report, update_weekly_report

router = APIRouter(prefix="/reports", tags=["Weekly Reports"])

@router.get("", response_model=List[WeeklyReportResponse])
def read_reports(
    internship_id: Optional[int] = None,
    week_number: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.REPORT.READ))
):
    return get_reports(db, internship_id=internship_id, week_number=week_number)

@router.get("/{report_id}", response_model=WeeklyReportResponse)
def read_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.REPORT.READ))
):
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report

@router.post("", response_model=WeeklyReportResponse, status_code=status.HTTP_201_CREATED)
def submit_report(
    req: WeeklyReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.REPORT.CREATE))
):
    return submit_weekly_report(db, req, current_user)

@router.put("/{report_id}", response_model=WeeklyReportResponse)
def edit_report(
    report_id: int,
    req: WeeklyReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.REPORT.UPDATE))
):
    return update_weekly_report(db, report_id, req, current_user)
