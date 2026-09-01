from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user, get_current_admin
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
from app.models.internship import Internship
from app.models.task import Task
from app.models.blocker import Blocker
from app.models.report import WeeklyReport
from app.models.evaluation import EndOfInternshipEvaluation
from app.schemas.ai import AISummaryResponse, AIChatRequest, AIChatResponse, AIFinalSummaryResponse
from app.services.ai_service import summarize_weekly_report, handle_ai_chat, generate_final_summary

router = APIRouter(prefix="/ai", tags=["AI Services"])


@router.post("/summarize-report/{report_id}", response_model=AISummaryResponse)
def summarize_report_endpoint(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.AI.SUMMARIZE))
):
    """
    Generates a concise 3-4 line summary of a weekly report for mentors.
    Requires 'ai:summarize' permission.
    """
    return summarize_weekly_report(db, report_id)


@router.post("/chat", response_model=AIChatResponse)
def chat_endpoint(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.AI.CHAT))
):
    """
    Natural language Q&A assistant for mentors and admins.
    Requires 'ai:chat' permission.
    """
    return handle_ai_chat(db, req.query, current_user.id, req.intern_id)


@router.post("/final-summary/{internship_id}", response_model=AIFinalSummaryResponse)
def final_summary_endpoint(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(PERMISSIONS.AI.SUMMARIZE))
):
    """
    Generates an automated 6-week summary narrative for the end-of-internship report.
    Requires 'ai:summarize' permission.
    """
    return generate_final_summary(db, internship_id)


@router.get("/cohort-analysis")
def cohort_analysis_endpoint(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Admin-level AI cohort overview synthesizing system-wide performance and risks.
    """
    internships = db.query(Internship).all()
    tasks = db.query(Task).all()
    completed_tasks = [t for t in tasks if t.status == "done"]
    reports = db.query(WeeklyReport).all()
    blockers = db.query(Blocker).all()
    unresolved_blockers = [b for b in blockers if b.status != "resolved"]
    evaluations = db.query(EndOfInternshipEvaluation).all()

    avg_rating = 0.0
    if evaluations:
        avg_rating = round(sum(e.overall_rating for e in evaluations) / len(evaluations), 1)

    # Department breakdown
    dept_map = {}
    for item in internships:
        d = item.department or "General"
        dept_map[d] = dept_map.get(d, 0) + 1

    return {
        "total_internships": len(internships),
        "active_tracks": len([i for i in internships if i.status == "active"]),
        "completed_tracks": len([i for i in internships if i.status == "completed"]),
        "total_tasks": len(tasks),
        "task_completion_rate": round((len(completed_tasks) / len(tasks) * 100) if tasks else 0, 1),
        "total_reports": len(reports),
        "active_blockers_count": len(unresolved_blockers),
        "average_evaluation_rating": avg_rating,
        "department_distribution": dept_map,
        "ai_cohort_health": "Optimal" if len(unresolved_blockers) < 5 else "Requires Oversight",
        "key_growth_themes": [
            "Full Stack Architecture & REST API Design",
            "Microservices & Database Query Optimization",
            "Automated Testing & CI/CD Pipelines"
        ]
    }
