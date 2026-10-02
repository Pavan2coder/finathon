"""
Skill service — skill assessment and gap analysis.
"""
from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models import (
    Employee, Skill, EmployeeSkill, RoleSkill, Role,
    Feedback, Training, Deliverable, Project,
)


def get_employee_skills(db: Session, employee_id: str) -> List[Dict]:
    emp_skills = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee_id).all()
    result = []
    for es in emp_skills:
        skill = db.query(Skill).filter(Skill.id == es.skill_id).first()
        result.append({
            "id": es.id,
            "skill_id": es.skill_id,
            "skill_name": skill.name if skill else "Unknown",
            "skill_category": skill.category if skill else "UNKNOWN",
            "current_level": es.current_level,
            "last_assessed": es.last_assessed,
            "evidence_count": es.evidence_count,
        })
    return result


def calculate_skill_gaps(db: Session, employee_id: str, target_role_id: str) -> Dict:
    """Compare employee skills against role requirements."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(404, detail={"code": "EMPLOYEE_NOT_FOUND", "message": "Employee does not exist."})

    target_role = db.query(Role).filter(Role.id == target_role_id).first()
    if not target_role:
        raise HTTPException(404, detail={"code": "ROLE_NOT_FOUND", "message": "Role does not exist."})

    role_skills = db.query(RoleSkill).filter(RoleSkill.role_id == target_role_id).all()
    emp_skill_map = {
        es.skill_id: es
        for es in db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee_id).all()
    }

    gaps = []
    for rs in role_skills:
        skill = db.query(Skill).filter(Skill.id == rs.skill_id).first()
        emp_skill = emp_skill_map.get(rs.skill_id)
        current = emp_skill.current_level if emp_skill else 0.0
        gap = rs.required_level - current
        gaps.append({
            "skill_id": rs.skill_id,
            "skill_name": skill.name if skill else "Unknown",
            "current_level": current,
            "required_level": rs.required_level,
            "gap": round(max(gap, 0.0), 2),
            "importance": rs.importance,
            "evidence_count": emp_skill.evidence_count if emp_skill else 0,
        })

    # Sort by gap descending (biggest gap first)
    gaps.sort(key=lambda x: x["gap"], reverse=True)
    total_gaps = sum(1 for g in gaps if g["gap"] > 0)
    avg_gap = (
        sum(g["gap"] for g in gaps if g["gap"] > 0) / total_gaps if total_gaps else 0.0
    )

    return {
        "employee_id": employee_id,
        "target_role_id": target_role_id,
        "target_role_name": target_role.name,
        "skill_gaps": gaps,
        "total_gaps": total_gaps,
        "average_gap": round(avg_gap, 2),
    }


def assess_employee_skill(
    db: Session,
    employee_id: str,
    skill_id: str,
    level: float,
    evidence_count: int,
    actor_id: str,
) -> EmployeeSkill:
    """Manually set or update an employee's assessed skill level."""
    if not (1.0 <= level <= 5.0):
        raise HTTPException(400, detail={"code": "INVALID_LEVEL", "message": "Skill level must be between 1.0 and 5.0."})

    existing = db.query(EmployeeSkill).filter(
        EmployeeSkill.employee_id == employee_id,
        EmployeeSkill.skill_id == skill_id,
    ).first()

    if existing:
        old_level = existing.current_level
        existing.current_level = level
        existing.evidence_count = evidence_count
        existing.last_assessed = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        record = existing
    else:
        record = EmployeeSkill(
            employee_id=employee_id,
            skill_id=skill_id,
            current_level=level,
            evidence_count=evidence_count,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        old_level = None

    from app.models import AuditLog
    audit = AuditLog(
        user_id=actor_id,
        action="ASSESS_SKILL",
        entity_type="EMPLOYEE_SKILL",
        entity_id=record.id,
        old_value={"level": old_level},
        new_value={"level": level},
    )
    db.add(audit)
    db.commit()
    return record
