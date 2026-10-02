"""
Development plans API — CRUD and auto-generation from skill gaps.
"""
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user, get_current_manager
from app.models import Employee, ActionType, DevelopmentStatus
from app.services.development_service import (
    get_development_plans, create_development_plan,
    update_development_plan, auto_generate_plans,
)

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class PlanCreate(BaseModel):
    skill_id: str
    goal: str
    recommended_action: str
    action_type: ActionType
    target_date: Optional[datetime] = None


class PlanUpdate(BaseModel):
    progress: Optional[float] = None
    status: Optional[DevelopmentStatus] = None


class AutoGenerateRequest(BaseModel):
    target_role_id: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/employees/{employee_id}/development-plan")
def get_plans(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Get all development plans for an employee."""
    _assert_access(current_user, employee_id, db)
    return {"success": True, "data": get_development_plans(db, employee_id)}


@router.post("/employees/{employee_id}/development-plan", status_code=status.HTTP_201_CREATED)
def create_plan(
    employee_id: str,
    data: PlanCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Create a development plan. Requires MANAGER+."""
    plan = create_development_plan(
        db, employee_id, data.skill_id, data.goal,
        data.recommended_action, data.action_type, data.target_date,
    )
    return {"success": True, "data": {"id": plan.id, "status": plan.status.value}, "message": "Plan created."}


@router.post("/employees/{employee_id}/development-plan/auto-generate", status_code=status.HTTP_201_CREATED)
def auto_generate(
    employee_id: str,
    data: AutoGenerateRequest,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """
    Auto-generate development plans based on skill gaps for a target role.
    Uses deterministic gap analysis — AI enrichment is applied separately.
    Requires MANAGER+.
    """
    plans = auto_generate_plans(db, employee_id, data.target_role_id)
    return {
        "success": True,
        "data": [{"id": p.id, "skill_id": p.skill_id, "action_type": p.action_type.value} for p in plans],
        "message": f"{len(plans)} development plan(s) generated.",
    }


@router.put("/development/{plan_id}")
def update_plan(
    plan_id: str,
    data: PlanUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Update progress or status of a development plan. Requires MANAGER+."""
    plan = update_development_plan(db, plan_id, data.progress, data.status, current_user.id)
    return {
        "success": True,
        "data": {"id": plan.id, "progress": plan.progress, "status": plan.status.value},
        "message": "Development plan updated.",
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _assert_access(current_user: Employee, employee_id: str, db: Session):
    if current_user.role.value == "EMPLOYEE" and current_user.id != employee_id:
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied."})
