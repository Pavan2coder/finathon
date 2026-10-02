"""
Development plan service.
"""
from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models import DevelopmentPlan, Employee, Skill, AuditLog, DevelopmentStatus, ActionType
from app.services.skill_service import calculate_skill_gaps


def get_development_plans(db: Session, employee_id: str) -> List[Dict]:
    plans = db.query(DevelopmentPlan).filter(DevelopmentPlan.employee_id == employee_id).all()
    result = []
    for p in plans:
        skill = db.query(Skill).filter(Skill.id == p.skill_id).first()
        result.append({
            "id": p.id,
            "employee_id": p.employee_id,
            "skill_id": p.skill_id,
            "skill_name": skill.name if skill else "Unknown",
            "goal": p.goal,
            "recommended_action": p.recommended_action,
            "action_type": p.action_type.value,
            "progress": p.progress,
            "target_date": p.target_date,
            "status": p.status.value,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
        })
    return result


def create_development_plan(
    db: Session,
    employee_id: str,
    skill_id: str,
    goal: str,
    recommended_action: str,
    action_type: ActionType,
    target_date: Optional[datetime],
) -> DevelopmentPlan:
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(404, detail={"code": "EMPLOYEE_NOT_FOUND", "message": "Employee does not exist."})

    plan = DevelopmentPlan(
        employee_id=employee_id,
        skill_id=skill_id,
        goal=goal,
        recommended_action=recommended_action,
        action_type=action_type,
        target_date=target_date,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def update_development_plan(
    db: Session,
    plan_id: str,
    progress: Optional[float],
    status: Optional[DevelopmentStatus],
    actor_id: str,
) -> DevelopmentPlan:
    plan = db.query(DevelopmentPlan).filter(DevelopmentPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(404, detail={"code": "PLAN_NOT_FOUND", "message": "Development plan does not exist."})

    old_values: Dict = {}
    if progress is not None:
        old_values["progress"] = plan.progress
        plan.progress = progress
    if status is not None:
        old_values["status"] = plan.status.value
        plan.status = status

    db.commit()
    db.refresh(plan)

    audit = AuditLog(
        user_id=actor_id,
        action="UPDATE_DEVELOPMENT_PLAN",
        entity_type="DEVELOPMENT_PLAN",
        entity_id=plan_id,
        old_value=old_values,
        new_value={"progress": plan.progress, "status": plan.status.value},
    )
    db.add(audit)
    db.commit()
    return plan


def auto_generate_plans(db: Session, employee_id: str, target_role_id: str) -> List[DevelopmentPlan]:
    """
    Auto-generate development plans based on skill gaps for a target role.
    Uses deterministic gap calculation; descriptions may be enriched by AI separately.
    """
    gap_data = calculate_skill_gaps(db, employee_id, target_role_id)

    # Action type heuristic based on gap size
    def pick_action(gap: float) -> ActionType:
        if gap >= 2.0:
            return ActionType.TRAINING
        elif gap >= 1.0:
            return ActionType.STRETCH_ASSIGNMENT
        else:
            return ActionType.MENTORING

    created = []
    for gap_item in gap_data["skill_gaps"]:
        if gap_item["gap"] <= 0:
            continue

        # Skip if plan already exists for this skill
        existing = db.query(DevelopmentPlan).filter(
            DevelopmentPlan.employee_id == employee_id,
            DevelopmentPlan.skill_id == gap_item["skill_id"],
            DevelopmentPlan.status.in_([DevelopmentStatus.PLANNED, DevelopmentStatus.IN_PROGRESS]),
        ).first()
        if existing:
            continue

        action = pick_action(gap_item["gap"])
        plan = DevelopmentPlan(
            employee_id=employee_id,
            skill_id=gap_item["skill_id"],
            goal=(
                f"Improve {gap_item['skill_name']} from level {gap_item['current_level']:.1f} "
                f"to {gap_item['required_level']:.1f}"
            ),
            recommended_action=(
                f"{action.value.replace('_', ' ').title()} to close {gap_item['gap']:.1f}-point gap "
                f"in {gap_item['skill_name']}."
            ),
            action_type=action,
        )
        db.add(plan)
        created.append(plan)

    db.commit()
    return created
