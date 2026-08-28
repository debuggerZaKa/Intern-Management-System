from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.role import Role
from app.models.permission import Permission

def get_all_roles(db: Session) -> List[Role]:
    return db.query(Role).all()

def get_role_by_id(db: Session, role_id: int) -> Optional[Role]:
    return db.query(Role).filter(Role.id == role_id).first()

def get_role_by_name(db: Session, name: str) -> Optional[Role]:
    return db.query(Role).filter(Role.name == name).first()

def get_role_permissions(db: Session, role_id: int) -> List[Permission]:
    role = get_role_by_id(db, role_id)
    if not role:
        return []
    return role.permissions
