import os
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.config import settings
from app.models.report import WeeklyReport
from app.models.internship import Internship
from app.models.task import Task
from app.models.blocker import Blocker
from app.models.user import User
from app.models.ai_insight import AIInsight, AIChatLog
from app.schemas.ai import AISummaryResponse, AIChatResponse, AIFinalSummaryResponse

def summarize_weekly_report(db: Session, report_id: int) -> AISummaryResponse:
    report = db.query(WeeklyReport).filter(WeeklyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    
    internship = report.internship
    intern_name = internship.intern.profile.full_name if internship.intern and internship.intern.profile else "Intern"
    
    # Analyze blockers
    open_blockers = [b for b in report.blockers if b.status != "resolved"]
    has_critical = any(b.severity == "critical" for b in open_blockers)
    risk_level = "at_risk" if has_critical else ("monitor" if len(open_blockers) > 0 else "on_track")
    
    # Generate concise summary
    learnings = report.learnings_and_skills or "standard core tasks"
    tasks_done = report.tasks_completed_summary or "routine project milestones"
    
    summary_text = (
        f"Week {report.week_number} Summary for {intern_name}: "
        f"Completed: {tasks_done}. "
        f"Key learnings: {learnings}. "
        f"Blockers: {len(open_blockers)} active blocker(s)."
    )
    
    key_points = [
        f"Productivity self-rating: {report.self_rating_productivity}/5",
        f"Confidence self-rating: {report.self_rating_confidence}/5",
        f"Current risk status: {risk_level.replace('_', ' ').title()}"
    ]
    
    # Persist or update AI insight
    insight = db.query(AIInsight).filter(AIInsight.report_id == report.id).first()
    if not insight:
        insight = AIInsight(
            internship_id=internship.id,
            report_id=report.id,
            type="weekly_summary",
            summary_text=summary_text,
            risk_level=risk_level
        )
        db.add(insight)
    else:
        insight.summary_text = summary_text
        insight.risk_level = risk_level
    
    db.commit()
    
    return AISummaryResponse(
        report_id=report.id,
        internship_id=internship.id,
        summary_text=summary_text,
        risk_level=risk_level,
        key_points=key_points,
        generated_at=datetime.utcnow()
    )

def handle_ai_chat(db: Session, query: str, user_id: int, intern_id: Optional[int] = None) -> AIChatResponse:
    q_lower = query.lower()
    response_text = ""
    context_data: Dict[str, Any] = {}
    
    if intern_id:
        intern = db.query(User).filter(User.id == intern_id).first()
        if intern:
            intern_name = intern.profile.full_name if intern.profile else intern.email
            internship = db.query(Internship).filter(Internship.intern_id == intern.id).first()
            
            if "blocker" in q_lower or "stuck" in q_lower:
                blockers = db.query(Blocker).filter(Blocker.intern_id == intern.id).all()
                unresolved = [b for b in blockers if b.status != "resolved"]
                response_text = f"{intern_name} has {len(unresolved)} unresolved blocker(s): " + (
                    ", ".join([f"'{b.title}' ({b.severity})" for b in unresolved]) if unresolved else "None. All clear!"
                )
                context_data["blockers_count"] = len(blockers)
            elif "task" in q_lower or "progress" in q_lower:
                tasks = db.query(Task).filter(Task.intern_id == intern.id).all()
                done_tasks = [t for t in tasks if t.status == "done"]
                response_text = f"{intern_name} has completed {len(done_tasks)} out of {len(tasks)} tasks across their internship."
                context_data["tasks_total"] = len(tasks)
                context_data["tasks_done"] = len(done_tasks)
            else:
                reports = db.query(WeeklyReport).filter(WeeklyReport.internship_id == (internship.id if internship else -1)).all()
                response_text = f"{intern_name} is in Department: {internship.department if internship else 'N/A'}, with {len(reports)} submitted weekly reports."
    
    if not response_text:
        if "blocker" in q_lower:
            open_blockers = db.query(Blocker).filter(Blocker.status != "resolved").all()
            response_text = f"There are currently {len(open_blockers)} active blocker(s) across all interns in the system."
        elif "intern" in q_lower:
            total_interns = db.query(Internship).filter(Internship.status == "active").count()
            response_text = f"There are currently {total_interns} active intern(s) undergoing the 6-week program."
        else:
            response_text = f"AI Assistant: Received query '{query}'. You can ask about intern progress, weekly reports, or active blockers."

    # Save chat log
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
        created_at=datetime.utcnow()
    )

def generate_final_summary(db: Session, internship_id: int) -> AIFinalSummaryResponse:
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    
    intern_name = internship.intern.profile.full_name if internship.intern and internship.intern.profile else "Intern"
    reports = db.query(WeeklyReport).filter(WeeklyReport.internship_id == internship.id).all()
    tasks = db.query(Task).filter(Task.intern_id == internship.intern_id).all()
    completed_tasks = [t for t in tasks if t.status == "done"]
    blockers = db.query(Blocker).filter(Blocker.intern_id == internship.intern_id).all()
    
    narrative = (
        f"{intern_name} completed a 6-week internship in the {internship.department} department. "
        f"Successfully delivered {len(completed_tasks)} tasks across {len(internship.projects)} projects. "
        f"Submitted {len(reports)} weekly progress reports detailing continuous learning and milestone delivery."
    )
    
    skills = list(set([r.learnings_and_skills for r in reports if r.learnings_and_skills]))
    achievements = [t.title for t in completed_tasks[:5]] if completed_tasks else ["Successfully onboarded and established project repository."]
    blockers_summary = f"Encountered {len(blockers)} blockers during the cycle, resolving {sum(1 for b in blockers if b.status == 'resolved')}."
    
    return AIFinalSummaryResponse(
        internship_id=internship.id,
        overall_narrative=narrative,
        skills_acquired=skills if skills else ["FastAPI", "PostgreSQL", "Version Control", "System Architecture"],
        highlight_achievements=achievements,
        blockers_summary=blockers_summary,
        recommended_focus_areas=["Advanced architectural patterns", "Automated test coverage"],
        generated_at=datetime.utcnow()
    )
