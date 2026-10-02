"""
Skills API — employee skill management and gap analysis.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user, get_current_manager
from app.models import Employee, Skill
from app.services.skill_service import (
    get_employee_skills, calculate_skill_gaps, assess_employee_skill,
)

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class SkillAssessRequest(BaseModel):
    skill_id: str
    current_level: float
    evidence_count: int = 1


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/")
def list_all_skills(db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    """List all skills in the catalog."""
    skills = db.query(Skill).order_by(Skill.category, Skill.name).all()
    return {
        "success": True,
        "data": [{"id": s.id, "name": s.name, "category": s.category, "description": s.description} for s in skills],
    }


@router.get("/employees/{employee_id}/skills")
def get_skills(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Get all assessed skills for an employee."""
    _assert_access(current_user, employee_id, db)
    return {"success": True, "data": get_employee_skills(db, employee_id)}


@router.get("/employees/{employee_id}/skills/gaps")
def get_skill_gaps(
    employee_id: str,
    target_role_id: str = Query(..., description="Role ID to compare against"),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Calculate skill gaps between employee current levels and target role requirements."""
    _assert_access(current_user, employee_id, db)
    gaps = calculate_skill_gaps(db, employee_id, target_role_id)
    return {"success": True, "data": gaps, "message": "Skill gap analysis completed."}


@router.post("/employees/{employee_id}/skills/assess")
def assess_skill(
    employee_id: str,
    data: SkillAssessRequest,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Record or update a skill assessment. Requires MANAGER+."""
    record = assess_employee_skill(
        db, employee_id, data.skill_id, data.current_level, data.evidence_count, current_user.id
    )
    skill = db.query(Skill).filter(Skill.id == record.skill_id).first()
    return {
        "success": True,
        "data": {
            "id": record.id,
            "skill_id": record.skill_id,
            "skill_name": skill.name if skill else "Unknown",
            "current_level": record.current_level,
            "evidence_count": record.evidence_count,
            "last_assessed": record.last_assessed,
        },
        "message": "Skill assessment recorded.",
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _assert_access(current_user: Employee, employee_id: str, db: Session):
    if current_user.role.value == "EMPLOYEE" and current_user.id != employee_id:
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied."})
