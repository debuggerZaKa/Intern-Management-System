import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.system_setting import SystemSetting
from app.models.audit_log import AuditLog
from app.models.user import User

DEFAULT_SETTINGS = {
    "departments": json.dumps([
        "Enterprise Software Solutions",
        "Financial Cloud Solutions",
        "Artificial Intelligence & Analytics",
        "Quality Engineering & Assurance",
        "DevOps & Cloud Infrastructure",
        "Cybersecurity & Compliance",
        "UI/UX Product Design"
    ]),
    "duration_options": json.dumps([4, 6, 8, 12]),
    "ai_model": "llama-3.3-70b-versatile",
    "ai_enabled": "true",
    "email_notifications_enabled": "true",
    "late_submission_alert_hours": "24"
}


def initialize_default_settings_if_needed(db: Session):
    for key, val in DEFAULT_SETTINGS.items():
        existing = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if not existing:
            setting = SystemSetting(
                key=key,
                value=val,
                description=f"System configuration for {key.replace('_', ' ')}",
                category="system"
            )
            db.add(setting)
    db.commit()


def get_all_settings(db: Session) -> Dict[str, Any]:
    initialize_default_settings_if_needed(db)
    settings = db.query(SystemSetting).all()
    result = {}
    for s in settings:
        try:
            result[s.key] = json.loads(s.value)
        except (ValueError, TypeError):
            result[s.key] = s.value
    return result


def update_settings(db: Session, updates: Dict[str, Any], actor: User) -> Dict[str, Any]:
    for key, value in updates.items():
        val_str = json.dumps(value) if isinstance(value, (list, dict, bool)) else str(value)
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting:
            setting.value = val_str
        else:
            setting = SystemSetting(
                key=key,
                value=val_str,
                description=f"System configuration for {key.replace('_', ' ')}",
                category="custom"
            )
            db.add(setting)

    audit = AuditLog(
        actor_id=actor.id,
        action="UPDATE_SYSTEM_SETTINGS",
        details=f"Admin updated system settings: {', '.join(updates.keys())}"
    )
    db.add(audit)
    db.commit()

    return get_all_settings(db)
