"""
Career service — career path navigation and promotion readiness.
"""
from typing import Dict, List
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models import (
    Employee, Role, CareerPath, RoleSkill, EmployeeSkill,
    PerformanceReview, Goal, PromotionReadiness, AuditLog,
)


def get_career_path(db: Session, employee_id: str) -> Dict:
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(404, detail={"code": "EMPLOYEE_NOT_FOUND", "message": "Employee does not exist."})

    current_role = db.query(Role).filter(Role.id == emp.role_id).first()

    if not current_role:
        return {
            "employee_id": employee_id,
            "current_role": None,
            "possible_next_roles": [],
            "paths": [],
        }

    # Find possible next roles via career_paths table
    path_entries = db.query(CareerPath).filter(
        CareerPath.from_role_id == current_role.id
    ).all()

    next_roles = []
    for path in path_entries:
        next_role = db.query(Role).filter(Role.id == path.to_role_id).first()
        if next_role:
            next_roles.append({
                "id": next_role.id,
                "name": next_role.name,
                "level": next_role.level,
                "description": next_role.description,
                "path_description": path.description,
            })

    return {
        "employee_id": employee_id,
        "current_role": {
            "id": current_role.id,
            "name": current_role.name,
            "level": current_role.level,
            "description": current_role.description,
        },
        "possible_next_roles": next_roles,
        "paths": path_entries,
    }


def calculate_promotion_readiness(db: Session, employee_id: str, target_role_id: str) -> Dict:
    """
    Evaluate whether an employee meets the criteria for a target role.

    This does NOT recommend promotion — it surfaces the evidence for human review.
    """
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(404, detail={"code": "EMPLOYEE_NOT_FOUND", "message": "Employee does not exist."})

    target_role = db.query(Role).filter(Role.id == target_role_id).first()
    if not target_role:
        raise HTTPException(404, detail={"code": "ROLE_NOT_FOUND", "message": "Role does not exist."})

    current_role = db.query(Role).filter(Role.id == emp.role_id).first()

    criteria = []
    criteria_met = 0

    # --- 1. Role level check ---
    level_ok = (current_role.level >= target_role.level - 1) if current_role else False
    criteria.append({
        "name": "Current role level sufficient",
        "met": level_ok,
        "current_value": current_role.level if current_role else None,
        "required_value": target_role.level - 1,
        "details": "Employee should be one level below the target role.",
    })
    if level_ok:
        criteria_met += 1

    # --- 2. Skill requirements ---
    role_skills = db.query(RoleSkill).filter(RoleSkill.role_id == target_role_id).all()
    emp_skill_map = {
        es.skill_id: es
        for es in db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee_id).all()
    }

    skills_met = 0
    skills_total = 0
    missing_skills = []
    for rs in role_skills:
        skill_db = db.query(__import__("app.models", fromlist=["Skill"]).Skill).filter_by(id=rs.skill_id).first()
        skill_name = skill_db.name if skill_db else rs.skill_id
        emp_skill = emp_skill_map.get(rs.skill_id)
        current_level = emp_skill.current_level if emp_skill else 0.0
        met = current_level >= rs.required_level

        if rs.importance in ("HIGH", "CRITICAL"):
            skills_total += 1
            if met:
                skills_met += 1
            else:
                missing_skills.append(skill_name)

    skills_ok = skills_total == 0 or (skills_met / skills_total) >= 0.75
    criteria.append({
        "name": "Critical skill requirements met",
        "met": skills_ok,
        "current_value": f"{skills_met}/{skills_total}",
        "required_value": "≥ 75% of critical skills",
        "details": f"Missing: {', '.join(missing_skills) if missing_skills else 'None'}",
    })
    if skills_ok:
        criteria_met += 1

    # --- 3. Performance evidence ---
    reviews = db.query(PerformanceReview).filter(
        PerformanceReview.employee_id == employee_id
    ).order_by(PerformanceReview.review_cycle.desc()).limit(2).all()

    avg_evidence = (
        sum(r.evidence_score for r in reviews if r.evidence_score) / len(reviews)
        if reviews else 0.0
    )
    perf_ok = avg_evidence >= 75.0
    criteria.append({
        "name": "Performance evidence score ≥ 75",
        "met": perf_ok,
        "current_value": round(avg_evidence, 1),
        "required_value": 75.0,
        "details": "Average evidence score across recent review cycles.",
    })
    if perf_ok:
        criteria_met += 1

    # --- 4. Manager rating ---
    avg_rating = (
        sum(r.manager_rating for r in reviews) / len(reviews) if reviews else 0.0
    )
    rating_ok = avg_rating >= 3.5
    criteria.append({
        "name": "Manager rating ≥ 3.5",
        "met": rating_ok,
        "current_value": round(avg_rating, 2),
        "required_value": 3.5,
        "details": "Average manager rating from recent reviews.",
    })
    if rating_ok:
        criteria_met += 1

    # --- 5. Goal completion ---
    goals = db.query(Goal).filter(Goal.employee_id == employee_id).all()
    recent_goals = goals[-10:] if len(goals) >= 10 else goals
    completed_goals = [g for g in recent_goals if g.status.value == "COMPLETED"]
    goal_rate = len(completed_goals) / len(recent_goals) * 100 if recent_goals else 0.0
    goal_ok = goal_rate >= 70.0
    criteria.append({
        "name": "Goal completion rate ≥ 70%",
        "met": goal_ok,
        "current_value": round(goal_rate, 1),
        "required_value": 70.0,
        "details": "Percentage of recent goals completed.",
    })
    if goal_ok:
        criteria_met += 1

    criteria_total = len(criteria)
    readiness_pct = round(criteria_met / criteria_total * 100, 1)
    missing_criteria = [c["name"] for c in criteria if not c["met"]]

    # Persist/update record
    existing = db.query(PromotionReadiness).filter(
        PromotionReadiness.employee_id == employee_id,
        PromotionReadiness.target_role_id == target_role_id,
    ).first()

    if existing:
        existing.readiness_percentage = readiness_pct
        existing.criteria_met = criteria_met
        existing.criteria_total = criteria_total
        existing.missing_criteria = missing_criteria
        existing.criteria_details = criteria
        existing.calculated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        record = existing
    else:
        record = PromotionReadiness(
            employee_id=employee_id,
            target_role_id=target_role_id,
            readiness_percentage=readiness_pct,
            criteria_met=criteria_met,
            criteria_total=criteria_total,
            missing_criteria=missing_criteria,
            criteria_details=criteria,
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    return {
        "id": record.id,
        "employee_id": employee_id,
        "employee_name": emp.name,
        "current_role": current_role.name if current_role else None,
        "target_role_id": target_role_id,
        "target_role_name": target_role.name,
        "readiness_percentage": readiness_pct,
        "criteria_met": criteria_met,
        "criteria_total": criteria_total,
        "criteria": criteria,
        "missing_criteria": missing_criteria,
        "calculated_at": record.calculated_at,
    }
