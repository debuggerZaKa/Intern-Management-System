import json
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.report import WeeklyReport
from app.models.internship import Internship
from app.models.task import Task
from app.models.blocker import Blocker
from app.models.user import User
from app.models.ai_insight import AIInsight, AIChatLog
from app.schemas.ai import AISummaryResponse, AIChatResponse, AIFinalSummaryResponse

logger = logging.getLogger("ims.ai_service")


def _get_groq_client():
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "YOUR_GROQ_API_KEY":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Groq AI service is not configured (missing or placeholder GROQ_API_KEY)."
        )
    try:
        from groq import Groq
        return Groq(api_key=settings.GROQ_API_KEY)
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="groq library is not installed."
        )


def summarize_weekly_report(db: Session, report_id: int, retry: bool = False) -> AISummaryResponse:
    report = db.query(WeeklyReport).filter(WeeklyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    # Return existing cached insight if available and valid (unless retry requested)
    existing_insight = db.query(AIInsight).filter(AIInsight.report_id == report.id).first()
    if existing_insight and not retry and existing_insight.progress_status != "failed":
        detected_skills = json.loads(existing_insight.detected_skills) if existing_insight.detected_skills else []
        recommendations = json.loads(existing_insight.recommendations) if existing_insight.recommendations else []
        return AISummaryResponse(
            report_id=report.id,
            internship_id=report.internship_id,
            summary_text=existing_insight.summary_text,
            risk_level=existing_insight.progress_status,
            key_points=recommendations or [f"Productivity: {report.self_rating_productivity}/5"],
            generated_at=existing_insight.generated_at
        )

    internship = report.internship
    intern_name = (
        internship.intern.profile.full_name
        if (internship.intern and internship.intern.profile)
        else (internship.intern.email if internship.intern else "Intern")
    )
    open_blockers = [b for b in report.blockers if b.status != "resolved"]

    # Build detailed context for Groq
    prompt = (
        f"Analyze this weekly progress report for intern {intern_name} (Week {report.week_number}):\n"
        f"Department: {internship.department}\n"
        f"Tasks Completed: {report.tasks_completed_summary or 'None'}\n"
        f"Tasks In Progress: {report.tasks_in_progress_summary or 'None'}\n"
        f"Learnings & Skills: {report.learnings_and_skills or 'None'}\n"
        f"Goals Next Week: {report.goals_next_week or 'None'}\n"
        f"Self-Rating Productivity (1-5): {report.self_rating_productivity}\n"
        f"Self-Rating Confidence (1-5): {report.self_rating_confidence}\n"
        f"Active Blockers ({len(open_blockers)}): " +
        "; ".join([f"{b.title} ({b.severity})" for b in open_blockers]) + "\n\n"
        "Provide a strict JSON response with the following keys:\n"
        "1. summary: concise 3-4 line evaluation of progress\n"
        "2. progress_status: one of 'on_track', 'needs_attention', or 'at_risk'\n"
        "3. risk_score: float between 0.0 and 1.0\n"
        "4. detected_skills: list of string skills demonstrated\n"
        "5. recommendations: list of actionable recommendations\n"
        "6. needs_mentor_attention: boolean (true/false)\n"
    )

    client = _get_groq_client()

    try:
        completion = client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert corporate technical internship supervisor and evaluator. Return output ONLY as JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content
        ai_data = json.loads(content)

        summary_text = ai_data.get("summary", "Analysis completed successfully.")
        progress_status = ai_data.get("progress_status", "on_track")
        if progress_status not in ("on_track", "needs_attention", "at_risk"):
            progress_status = "on_track"

        risk_score = float(ai_data.get("risk_score", 0.1))
        detected_skills = ai_data.get("detected_skills", [])
        recommendations = ai_data.get("recommendations", [])
        needs_attention = 1 if ai_data.get("needs_mentor_attention", False) else 0

    except Exception as e:
        logger.error(f"Groq API call failed for report {report_id}: {str(e)}", exc_info=True)

        # Store failed state in database so caller/frontend can see failure and retry
        if not existing_insight:
            existing_insight = AIInsight(
                internship_id=internship.id,
                report_id=report.id,
                type="weekly_summary",
                summary_text=f"AI Analysis Failed: {str(e)}",
                progress_status="failed",
                risk_level="failed",
                risk_score=1.0,
                needs_mentor_attention=1
            )
            db.add(existing_insight)
        else:
            existing_insight.progress_status = "failed"
            existing_insight.risk_level = "failed"
            existing_insight.summary_text = f"AI Analysis Failed: {str(e)}"

        db.commit()

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq AI analysis failed: {str(e)}. Status recorded as failed; you can retry."
        )

    # Persist or update successful AI insight
    if not existing_insight:
        insight = AIInsight(
            internship_id=internship.id,
            report_id=report.id,
            type="weekly_summary",
            summary_text=summary_text,
            progress_status=progress_status,
            risk_level=progress_status,
            risk_score=risk_score,
            detected_skills=json.dumps(detected_skills),
            recommendations=json.dumps(recommendations),
            needs_mentor_attention=needs_attention
        )
        db.add(insight)
    else:
        existing_insight.summary_text = summary_text
        existing_insight.progress_status = progress_status
        existing_insight.risk_level = progress_status
        existing_insight.risk_score = risk_score
        existing_insight.detected_skills = json.dumps(detected_skills)
        existing_insight.recommendations = json.dumps(recommendations)
        existing_insight.needs_mentor_attention = needs_attention

    db.commit()

    return AISummaryResponse(
        report_id=report.id,
        internship_id=internship.id,
        summary_text=summary_text,
        risk_level=progress_status,
        key_points=recommendations or [f"Productivity: {report.self_rating_productivity}/5"],
        generated_at=datetime.now(timezone.utc)
    )


def handle_ai_chat(db: Session, query: str, user_id: int, intern_id: Optional[int] = None) -> AIChatResponse:
    client = _get_groq_client()

    context_str = "System Context: User is querying the Internship Management System.\n"
    context_data: Dict[str, Any] = {}

    if intern_id:
        intern = db.query(User).filter(User.id == intern_id).first()
        if intern:
            intern_name = intern.profile.full_name if intern.profile else intern.email
            internship = db.query(Internship).filter(Internship.intern_id == intern.id, Internship.status == "active").first()
            tasks = db.query(Task).filter(Task.intern_id == intern.id).all()
            completed_tasks = [t for t in tasks if t.status == "done"]
            reports = db.query(WeeklyReport).filter(WeeklyReport.internship_id == (internship.id if internship else -1)).all()
            blockers = db.query(Blocker).filter(Blocker.intern_id == intern.id, Blocker.status != "resolved").all()

            context_str += (
                f"Target Intern: {intern_name}\n"
                f"Department: {internship.department if internship else 'N/A'}\n"
                f"Completed Tasks: {len(completed_tasks)}/{len(tasks)}\n"
                f"Weekly Reports Submitted: {len(reports)}\n"
                f"Unresolved Blockers: {len(blockers)} ({', '.join([b.title for b in blockers])})\n"
            )
            context_data["tasks_total"] = len(tasks)
            context_data["tasks_completed"] = len(completed_tasks)
            context_data["unresolved_blockers"] = len(blockers)

    try:
        completion = client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": "You are an intelligent corporate AI assistant for an Internship Progress Management System. Provide concise, professional, and helpful answers."},
                {"role": "user", "content": f"{context_str}\nUser Question: {query}"}
            ],
            temperature=0.5
        )
        response_text = completion.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq Chat API failed for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq AI Chat service failed: {str(e)}"
        )

    # Log chat history
    chat_log = AIChatLog(
        user_id=user_id,
        query=query,
        response=response_text,
        context_type="intern_qa" if intern_id else "general"
    )
    db.add(chat_log)
    db.commit()

    return AIChatResponse(
        query=query,
        response=response_text,
        context=context_data,
        created_at=datetime.now(timezone.utc)
    )


def generate_final_summary(db: Session, internship_id: int) -> AIFinalSummaryResponse:
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")

    intern_name = (
        internship.intern.profile.full_name
        if (internship.intern and internship.intern.profile)
        else "Intern"
    )
    reports = db.query(WeeklyReport).filter(WeeklyReport.internship_id == internship.id).all()
    tasks = db.query(Task).filter(Task.intern_id == internship.intern_id).all()
    completed_tasks = [t for t in tasks if t.status == "done"]
    blockers = db.query(Blocker).filter(Blocker.intern_id == internship.intern_id).all()

    prompt = (
        f"Generate a final 6-week internship performance summary for {intern_name}:\n"
        f"Department: {internship.department}\n"
        f"Total Tasks Completed: {len(completed_tasks)} of {len(tasks)}\n"
        f"Weekly Reports Submitted: {len(reports)}\n"
        f"Blockers Encountered: {len(blockers)}\n\n"
        "Return a strict JSON object with fields:\n"
        "1. overall_narrative (string summary of performance)\n"
        "2. skills_acquired (array of strings)\n"
        "3. highlight_achievements (array of strings)\n"
        "4. blockers_summary (string summary of how blockers were handled)\n"
        "5. recommended_focus_areas (array of strings for future growth)\n"
    )

    client = _get_groq_client()

    try:
        completion = client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": "You are a senior corporate technical Director performing end-of-internship evaluations. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        ai_data = json.loads(completion.choices[0].message.content)

        narrative = ai_data.get("overall_narrative", f"{intern_name} successfully completed the internship program.")
        skills = ai_data.get("skills_acquired", [])
        achievements = ai_data.get("highlight_achievements", [])
        blockers_summary = ai_data.get("blockers_summary", "Managed blockers effectively.")
        focus_areas = ai_data.get("recommended_focus_areas", [])

    except Exception as e:
        logger.error(f"Groq final summary failed for internship {internship_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq AI final summary generation failed: {str(e)}"
        )

    return AIFinalSummaryResponse(
        internship_id=internship.id,
        overall_narrative=narrative,
        skills_acquired=skills,
        highlight_achievements=achievements,
        blockers_summary=blockers_summary,
        recommended_focus_areas=focus_areas,
        generated_at=datetime.now(timezone.utc)
    )
