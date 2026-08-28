from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.auth.decorators import require_permission
from app.constants.permissions import PERMISSIONS
from app.models.user import User
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
