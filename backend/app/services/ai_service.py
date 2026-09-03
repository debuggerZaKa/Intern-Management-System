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
from app.models.assignment import MentorInternAssignment
from app.models.role import Role
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


# ---------------------------------------------------------------------------
# RBAC Helper — determines which intern IDs the requesting user may access.
# Authorization is enforced HERE in the backend, never delegated to the LLM.
# ---------------------------------------------------------------------------

def _get_allowed_intern_ids(db: Session, current_user: User) -> List[int]:
    """
    Returns the list of intern user IDs the current user is authorized to query.

    - admin  : all active users whose role name is 'intern'
    - mentor : interns from active MentorInternAssignment rows for this mentor
    - intern : only their own user ID
    - other  : raises HTTP 403
    """
    role_name = current_user.role.name if current_user.role else None

    if role_name == "admin":
        intern_users = (
            db.query(User)
            .join(Role, User.role_id == Role.id)
            .filter(Role.name == "intern")
            .all()
        )
        return [u.id for u in intern_users]

    elif role_name == "mentor":
        assignments = (
            db.query(MentorInternAssignment)
            .filter(
                MentorInternAssignment.mentor_id == current_user.id,
                MentorInternAssignment.is_active == True,
            )
            .all()
        )
        return [a.intern_id for a in assignments]

    elif role_name == "intern":
        return [current_user.id]

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your role does not have access to this resource.",
        )


# ---------------------------------------------------------------------------
# Intent Detection — simple keyword check to identify broad/system-wide queries.
# This is deterministic; the LLM never decides authorization scope.
# ---------------------------------------------------------------------------

_BROAD_QUESTION_KEYWORDS = [
    "all intern",
    "which intern",
    "every intern",
    "show intern",
    "list intern",
    "intern progress",
    "overall progress",
    "overall intern",
    "intern overview",
    "behind",
    "struggling",
    "critical blocker",
    "unresolved blocker",
    "cohort",
    "overview",
    "system wide",
    "system-wide",
    "who is stuck",
    "who are stuck",
    "who has blocker",
    "intern performance",
    "all blockers",
]


def _is_broad_system_question(query: str) -> bool:
    """
    Returns True when the query appears to request information about multiple
    interns or the system as a whole — not about a single specific intern.
    """
    q = query.lower()
    return any(kw in q for kw in _BROAD_QUESTION_KEYWORDS)


# Keywords that indicate the user wants an explicit, exhaustive list of interns.
# For these queries we bypass Groq enumeration and return the backend-assembled
# list directly so no record is omitted.
_LIST_ALL_KEYWORDS = [
    "show me all intern",
    "list all intern",
    "show all intern",
    "list intern",
    "show intern",
    "all intern",
    "every intern",
    "give me all intern",
    "get all intern",
    "display all intern",
    "who are the intern",
    "who are my intern",
]


def _is_list_all_request(query: str) -> bool:
    """
    Returns True when the user is explicitly requesting a complete,
    exhaustive listing of interns (not a filtered or analytical question).
    For these queries the backend returns the full list deterministically
    without relying on Groq to enumerate records.
    """
    q = query.lower()
    return any(kw in q for kw in _LIST_ALL_KEYWORDS)


def _build_complete_intern_list(db: Session, allowed_intern_ids: List[int]) -> str:
    """
    Builds a numbered, deterministic plain-text listing of ALL authorized interns.
    Every intern ID in allowed_intern_ids is guaranteed to appear exactly once.
    This result is returned directly as the AI response — Groq is not asked to
    enumerate records (which risks omission), only to reformat this text.
    """
    if not allowed_intern_ids:
        return "No interns are currently available in your authorized scope."

    interns = db.query(User).filter(User.id.in_(allowed_intern_ids)).all()
    # Preserve the order of allowed_intern_ids for consistent output
    intern_map: Dict[int, User] = {u.id: u for u in interns}

    lines = [
        f"COMPLETE INTERN LIST — {len(allowed_intern_ids)} intern(s) in authorized scope.",
        "Every intern below is from the PostgreSQL database. Do NOT add, remove, or modify any entry.",
        "",
    ]

    for idx, intern_id in enumerate(allowed_intern_ids, start=1):
        user = intern_map.get(intern_id)
        if not user:
            continue
        name = _get_intern_display_name(user)
        internship = (
            db.query(Internship)
            .filter(Internship.intern_id == intern_id)
            .order_by(Internship.created_at.desc())
            .first()
        )
        dept = internship.department if internship else "N/A"
        intern_status = internship.status if internship else "N/A"
        open_blockers = (
            db.query(Blocker)
            .filter(Blocker.intern_id == intern_id, Blocker.status != "resolved")
            .count()
        )
        tasks = db.query(Task).filter(Task.intern_id == intern_id).all()
        done = sum(1 for t in tasks if t.status == "done")
        lines.append(
            f"{idx}. {name} | Email: {user.email} | Dept: {dept} | "
            f"Internship: {intern_status} | Tasks: {done}/{len(tasks)} done | "
            f"Open blockers: {open_blockers}"
        )

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Context builders — query PostgreSQL and format results as a plain-text block
# that is sent verbatim to Groq.  NO data is invented here.
# ---------------------------------------------------------------------------

def _get_intern_display_name(user: User) -> str:
    """Returns profile full name if available, otherwise email."""
    if user.profile and user.profile.full_name:
        return user.profile.full_name
    return user.email


def _build_individual_context(db: Session, intern: User, week_number: Optional[int] = None) -> str:
    """Builds a context string for a single authorized intern."""
    name = _get_intern_display_name(intern)
    internship = (
        db.query(Internship)
        .filter(Internship.intern_id == intern.id, Internship.status.in_(["active", "extended"]))
        .first()
    )

    tasks = db.query(Task).filter(Task.intern_id == intern.id).all()
    completed_tasks = [t for t in tasks if t.status == "done"]

    blocker_query = db.query(Blocker).filter(
        Blocker.intern_id == intern.id,
        Blocker.status != "resolved",
    )
    blockers = blocker_query.all()

    report_query = db.query(WeeklyReport)
    if internship:
        report_query = report_query.filter(WeeklyReport.internship_id == internship.id)
        if week_number:
            report_query = report_query.filter(WeeklyReport.week_number == week_number)
    reports = report_query.all() if internship else []

    lines = [
        f"Intern: {name}",
        f"Email: {intern.email}",
        f"Department: {internship.department if internship else 'N/A'}",
        f"Internship Status: {internship.status if internship else 'No active internship'}",
        f"Tasks — Completed: {len(completed_tasks)} / Total: {len(tasks)}",
        f"Weekly Reports Submitted: {len(reports)}",
        f"Unresolved Blockers: {len(blockers)}",
    ]

    # --- Full task details (Issue 2 fix) ---
    # Include every task record so the AI can answer questions about individual
    # tasks, their descriptions, statuses, priorities, and due dates.
    if tasks:
        lines.append(f"\nTask Details ({len(tasks)} task(s) total):")
        for idx, t in enumerate(tasks, start=1):
            due = str(t.due_date) if t.due_date else "No due date"
            task_line = (
                f"  Task {idx}: [{t.status.upper()}] {t.title}"
                f" | Priority: {t.priority}"
                f" | Due: {due}"
                f" | Week: {t.week_number}"
            )
            lines.append(task_line)
            if t.description:
                lines.append(f"    Description: {t.description}")
            if t.mentor_notes:
                lines.append(f"    Mentor Notes: {t.mentor_notes}")
            if t.submission_notes:
                lines.append(f"    Submission Notes: {t.submission_notes}")
            if t.submission_url:
                lines.append(f"    Submission URL: {t.submission_url}")
    else:
        lines.append("\nNo tasks are currently assigned to this intern.")

    if blockers:
        lines.append("\nBlocker Details:")
        for b in blockers:
            lines.append(
                f"  - [{b.severity.upper()}] {b.title}: {b.description}"
                + (f" | Help needed: {b.help_needed}" if b.help_needed else "")
            )

    if reports:
        latest = max(reports, key=lambda r: r.week_number)
        lines.append(
            f"\nLatest Report (Week {latest.week_number}): "
            f"Productivity={latest.self_rating_productivity}/5, "
            f"Confidence={latest.self_rating_confidence}/5"
        )

    return "\n".join(lines)


def _build_broad_context(db: Session, allowed_intern_ids: List[int], query: str) -> str:
    """
    Builds a context string covering multiple authorized interns.
    Data is restricted to allowed_intern_ids — no data leaks across role boundaries.
    """
    if not allowed_intern_ids:
        return "No interns are currently assigned to you."

    q = query.lower()

    # Fetch intern user objects for name lookups
    interns = db.query(User).filter(User.id.in_(allowed_intern_ids)).all()
    intern_map: Dict[int, User] = {u.id: u for u in interns}

    sections: List[str] = [f"Authorized intern scope: {len(allowed_intern_ids)} intern(s)\n"]

    # --- Blocker-focused context ---
    if any(kw in q for kw in ["blocker", "stuck", "blocked", "critical", "unresolved", "struggling"]):
        severity_filter = "critical" if "critical" in q else None

        blocker_query = db.query(Blocker).filter(
            Blocker.intern_id.in_(allowed_intern_ids),
            Blocker.status != "resolved",
        )
        if severity_filter:
            blocker_query = blocker_query.filter(Blocker.severity == severity_filter)

        blockers = blocker_query.order_by(Blocker.severity, Blocker.created_at).all()

        if not blockers:
            label = "critical unresolved" if severity_filter else "unresolved"
            sections.append(f"No interns currently have {label} blockers.")
        else:
            sections.append(
                f"{'Critical u' if severity_filter else 'U'}nresolved blockers ({len(blockers)} total):"
            )
            # Group by intern
            by_intern: Dict[int, List[Blocker]] = {}
            for b in blockers:
                by_intern.setdefault(b.intern_id, []).append(b)

            for intern_id, iblocks in by_intern.items():
                user = intern_map.get(intern_id)
                name = _get_intern_display_name(user) if user else f"Intern #{intern_id}"
                internship = (
                    db.query(Internship)
                    .filter(Internship.intern_id == intern_id, Internship.status.in_(["active", "extended"]))
                    .first()
                )
                dept = internship.department if internship else "N/A"
                sections.append(f"\n  Intern: {name} | Department: {dept}")
                for b in iblocks:
                    sections.append(
                        f"    - [{b.severity.upper()}] {b.title}: {b.description}"
                        + (f"\n      Help needed: {b.help_needed}" if b.help_needed else "")
                    )

    # --- Task/progress-focused context ---
    elif any(kw in q for kw in ["task", "progress", "behind", "complet", "performance"]):
        tasks = db.query(Task).filter(Task.intern_id.in_(allowed_intern_ids)).all()

        # Group by intern
        task_by_intern: Dict[int, List[Task]] = {}
        for t in tasks:
            task_by_intern.setdefault(t.intern_id, []).append(t)

        if not task_by_intern:
            sections.append("No task data found for authorized interns.")
        else:
            sections.append("Task progress per intern:")
            for intern_id in allowed_intern_ids:
                user = intern_map.get(intern_id)
                name = _get_intern_display_name(user) if user else f"Intern #{intern_id}"
                itasks = task_by_intern.get(intern_id, [])
                done = sum(1 for t in itasks if t.status == "done")
                total = len(itasks)
                pct = round(done / total * 100) if total else 0
                open_blockers = db.query(Blocker).filter(
                    Blocker.intern_id == intern_id,
                    Blocker.status != "resolved",
                ).count()
                sections.append(
                    f"  {name}: {done}/{total} tasks done ({pct}%), "
                    f"{open_blockers} unresolved blocker(s)"
                )

    # --- General overview context ---
    else:
        sections.append("Intern Overview:")
        for intern_id in allowed_intern_ids:
            user = intern_map.get(intern_id)
            name = _get_intern_display_name(user) if user else f"Intern #{intern_id}"
            internship = (
                db.query(Internship)
                .filter(Internship.intern_id == intern_id)
                .order_by(Internship.created_at.desc())
                .first()
            )
            tasks = db.query(Task).filter(Task.intern_id == intern_id).all()
            done = sum(1 for t in tasks if t.status == "done")
            open_blockers = db.query(Blocker).filter(
                Blocker.intern_id == intern_id,
                Blocker.status != "resolved",
            ).count()
            sections.append(
                f"  {name} | Dept: {internship.department if internship else 'N/A'} | "
                f"Status: {internship.status if internship else 'N/A'} | "
                f"Tasks: {done}/{len(tasks)} done | "
                f"Open blockers: {open_blockers}"
            )

    return "\n".join(sections)


# ---------------------------------------------------------------------------
# Main chat handler
# ---------------------------------------------------------------------------

def handle_ai_chat(
    db: Session,
    query: str,
    current_user: User,
    intern_id: Optional[int] = None,
    week_number: Optional[int] = None,
) -> AIChatResponse:
    """
    Grounded AI chat with strict role-based access control.

    Authorization is enforced by the backend before any data reaches Groq.
    The LLM receives ONLY data the current user is permitted to see.
    """
    client = _get_groq_client()

    role_name = current_user.role.name if current_user.role else None
    allowed_intern_ids = _get_allowed_intern_ids(db, current_user)
    context_data: Dict[str, Any] = {}
    is_broad = _is_broad_system_question(query)

    # ------------------------------------------------------------------
    # CASE 1: Specific intern_id requested → validate authorization first
    # ------------------------------------------------------------------
    if intern_id is not None:
        if intern_id not in allowed_intern_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this intern's information.",
            )

        # Verify the intern actually exists
        target_intern = db.query(User).filter(User.id == intern_id).first()
        if not target_intern:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The requested intern was not found.",
            )

        context_str = (
            "DATABASE CONTEXT (authorized data from PostgreSQL — use ONLY this):\n"
            + _build_individual_context(db, target_intern, week_number)
        )
        context_data["intern_id"] = intern_id
        context_data["context_type"] = "individual"

    # ------------------------------------------------------------------
    # CASE 2: No intern_id, but intern is asking a broad system question
    # ------------------------------------------------------------------
    elif role_name == "intern" and is_broad:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access system-wide intern information.",
        )

    # ------------------------------------------------------------------
    # CASE 3: No intern_id, intern asking about themselves
    # ------------------------------------------------------------------
    elif role_name == "intern":
        target_intern = db.query(User).filter(User.id == current_user.id).first()
        context_str = (
            "DATABASE CONTEXT (authorized data from PostgreSQL — use ONLY this):\n"
            + _build_individual_context(db, target_intern, week_number)
        )
        context_data["context_type"] = "individual_self"

    # ------------------------------------------------------------------
    # CASE 4: Admin or Mentor — explicit "list all interns" request.
    # The backend assembles the complete numbered list and returns it
    # directly. Groq is only asked to present it, NOT to enumerate
    # records — this guarantees no intern is omitted from the response.
    # ------------------------------------------------------------------
    elif _is_list_all_request(query):
        list_text = _build_complete_intern_list(db, allowed_intern_ids)
        context_str = (
            "DATABASE CONTEXT (authorized data from PostgreSQL — use ONLY this):\n"
            + list_text
        )
        context_data["context_type"] = "list_all"
        context_data["authorized_intern_count"] = len(allowed_intern_ids)

    # ------------------------------------------------------------------
    # CASE 5: Admin or Mentor — broad or analytical query over authorized scope
    # ------------------------------------------------------------------
    else:
        context_str = (
            "DATABASE CONTEXT (authorized data from PostgreSQL — use ONLY this):\n"
            + _build_broad_context(db, allowed_intern_ids, query)
        )
        context_data["context_type"] = "broad"
        context_data["authorized_intern_count"] = len(allowed_intern_ids)

    # ------------------------------------------------------------------
    # Call Groq — ONLY with backend-provided, authorized DB context
    # ------------------------------------------------------------------
    system_prompt = (
        "You are an AI assistant for an Internship Management System. "
        "You must answer ONLY using the database context provided by the backend in the user message. "
        "Never invent or assume intern names, blocker titles, task counts, departments, dates, "
        "progress metrics, reports, or any other database facts. "
        "If the requested information is not present in the provided context, clearly state that "
        "the information is not available in the system. "
        "Never fabricate examples or placeholder data. "
        "When the context contains a numbered list of interns, you MUST include EVERY entry in your "
        "response without omitting any. Do not summarise, truncate, or select a subset. "
        "Be concise and professional."
    )

    try:
        completion = client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"{context_str}\n\nUser Question: {query}"},
            ],
            temperature=0.1,
        )
        response_text = completion.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq Chat API failed for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq AI Chat service failed: {str(e)}",
        )

    # Log chat history
    chat_log = AIChatLog(
        user_id=current_user.id,
        query=query,
        response=response_text,
        context_type=context_data.get("context_type", "general"),
    )
    db.add(chat_log)
    db.commit()

    return AIChatResponse(
        query=query,
        response=response_text,
        context=context_data,
        created_at=datetime.now(timezone.utc),
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
