import json
from typing import Optional, Dict, Any

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    action: str,
    actor_id: Optional[int] = None,
    target_user_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Create an immutable audit log entry. Never include sensitive fields."""
    entry = AuditLog(
        actor_id=actor_id,
        target_user_id=target_user_id,
        action=action,
        details=json.dumps(details) if details else None,
        ip_address=ip_address,
    )
    db.add(entry)
    # Flush so it's persisted with the surrounding transaction
    db.flush()
    return entry
