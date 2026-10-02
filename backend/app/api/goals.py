"""
Goals API — CRUD for employee goals.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.dependencies import get_db, get_current_user, get_current_manager
from app.models import Employee, Goal, GoalStatus

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_value: float
    actual_value: float = 0.0
    unit: Optional[str] = None
    weight: float = 1.0
    review_cycle: str
    status: GoalStatus = GoalStatus.NOT_STARTED


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    actual_value: Optional[float] = None
    status: Optional[GoalStatus] = None
    weight: Optional[float] = None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/employees/{employee_id}/goals")
def get_goals(
    employee_id: str,
    review_cycle: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """List goals for an employee, optionally filtered by cycle."""
    _assert_access(current_user, employee_id, db)
    query = db.query(Goal).filter(Goal.employee_id == employee_id)
    if review_cycle:
        query = query.filter(Goal.review_cycle == review_cycle)
    goals = query.order_by(Goal.created_at.desc()).all()

    return {
        "success": True,
        "data": [_serialize(g) for g in goals],
    }


@router.post("/employees/{employee_id}/goals", status_code=status.HTTP_201_CREATED)
def create_goal(
    employee_id: str,
    data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Create a new goal for an employee. Requires MANAGER+."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(404, detail={"code": "EMPLOYEE_NOT_FOUND", "message": "Employee does not exist."})

    goal = Goal(
        employee_id=employee_id,
        title=data.title,
        description=data.description,
        target_value=data.target_value,
        actual_value=data.actual_value,
        unit=data.unit,
        weight=data.weight,
        review_cycle=data.review_cycle,
        status=data.status,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return {"success": True, "data": _serialize(goal), "message": "Goal created."}


@router.put("/goals/{goal_id}")
def update_goal(
    goal_id: str,
    data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Update a goal. Requires MANAGER+."""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(404, detail={"code": "GOAL_NOT_FOUND", "message": "Goal does not exist."})

    if data.title is not None:
        goal.title = data.title
    if data.actual_value is not None:
        goal.actual_value = data.actual_value
    if data.status is not None:
        goal.status = data.status
    if data.weight is not None:
        goal.weight = data.weight

    db.commit()
    db.refresh(goal)
    return {"success": True, "data": _serialize(goal), "message": "Goal updated."}


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Delete a goal. Requires MANAGER+."""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(404, detail={"code": "GOAL_NOT_FOUND", "message": "Goal does not exist."})
    db.delete(goal)
    db.commit()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _serialize(g: Goal) -> dict:
    return {
        "id": g.id,
        "employee_id": g.employee_id,
        "title": g.title,
        "description": g.description,
        "target_value": g.target_value,
        "actual_value": g.actual_value,
        "unit": g.unit,
        "weight": g.weight,
        "achievement_percentage": round(g.achievement_percentage, 1),
        "status": g.status.value,
        "review_cycle": g.review_cycle,
        "created_at": g.created_at,
    }


def _assert_access(current_user: Employee, employee_id: str, db: Session):
    if current_user.role.value == "EMPLOYEE" and current_user.id != employee_id:
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied."})
