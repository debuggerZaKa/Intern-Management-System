from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, get_current_admin
from app.models.user import User
from app.services import settings_service

router = APIRouter(prefix="/admin/settings", tags=["System Settings"])


@router.get("")
def get_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve all configurable platform system settings."""
    return settings_service.get_all_settings(db)


@router.put("")
def update_settings(
    updates: Dict[str, Any],
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update platform settings (departments, default weeks, AI config, etc.)."""
    return settings_service.update_settings(db, updates, actor=admin)
