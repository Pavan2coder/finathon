"""
Report service — aggregated analytics for HR reporting.
"""
from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    Employee, PerformanceReview, CalibrationAlert, PromotionReadiness,
    EmployeeSkill, Skill, Goal, AlertSeverity, EmployeeStatus,
)


def get_dashboard_summary(db: Session) -> Dict:
    total_employees = db.query(Employee).filter(Employee.status == EmployeeStatus.ACTIVE).count()

    reviews = db.query(PerformanceReview).all()
    reviews_completed = sum(1 for r in reviews if r.status.value in ("SUBMITTED", "CALIBRATED", "FINALIZED"))

    evidence_scores = [r.evidence_score for r in reviews if r.evidence_score is not None]
    avg_evidence = round(sum(evidence_scores) / len(evidence_scores), 1) if evidence_scores else 0.0

    calibration_alerts = db.query(CalibrationAlert).filter(
        CalibrationAlert.status.in_(["OPEN", "UNDER_REVIEW"])
    ).count()

    # Promotion ready = readiness_percentage >= 75
    promotion_ready = db.query(PromotionReadiness).filter(
        PromotionReadiness.readiness_percentage >= 75.0
    ).count()

    return {
        "total_employees": total_employees,
        "reviews_completed": reviews_completed,
        "average_evidence_score": avg_evidence,
        "calibration_alerts": calibration_alerts,
        "promotion_ready": promotion_ready,
    }


def get_performance_report(db: Session) -> List[Dict]:
    employees = db.query(Employee).filter(Employee.status == EmployeeStatus.ACTIVE).all()
    result = []
    for emp in employees:
        reviews = db.query(PerformanceReview).filter(
            PerformanceReview.employee_id == emp.id
        ).order_by(PerformanceReview.review_cycle.desc()).all()

        latest = reviews[0] if reviews else None
        result.append({
            "employee_id": emp.id,
            "employee_name": emp.name,
            "department": emp.department,
            "latest_cycle": latest.review_cycle if latest else None,
            "evidence_score": latest.evidence_score if latest else None,
            "manager_rating": latest.manager_rating if latest else None,
            "review_status": latest.status.value if latest else None,
            "total_reviews": len(reviews),
        })
    return result


def get_calibration_report(db: Session) -> Dict:
    alerts = db.query(CalibrationAlert).all()

    by_severity = {
        "HIGH": [],
        "MEDIUM": [],
        "LOW": [],
    }
    for a in alerts:
        by_severity[a.severity.value].append({
            "id": a.id,
            "employee_id": a.employee_id,
            "manager_id": a.manager_id,
            "evidence_score": a.evidence_score,
            "manager_rating": a.manager_rating,
            "deviation": a.deviation,
            "status": a.status.value,
        })

    return {
        "total_alerts": len(alerts),
        "by_severity": by_severity,
        "open_count": sum(1 for a in alerts if a.status.value == "OPEN"),
        "resolved_count": sum(1 for a in alerts if a.status.value == "RESOLVED"),
    }


def get_skills_report(db: Session) -> List[Dict]:
    skills = db.query(Skill).all()
    result = []
    for skill in skills:
        emp_skills = db.query(EmployeeSkill).filter(EmployeeSkill.skill_id == skill.id).all()
        levels = [es.current_level for es in emp_skills]
        result.append({
            "skill_id": skill.id,
            "skill_name": skill.name,
            "category": skill.category,
            "employees_assessed": len(emp_skills),
            "average_level": round(sum(levels) / len(levels), 2) if levels else 0.0,
            "min_level": min(levels) if levels else 0.0,
            "max_level": max(levels) if levels else 0.0,
        })
    return result


def get_promotion_readiness_report(db: Session) -> List[Dict]:
    records = db.query(PromotionReadiness).order_by(
        PromotionReadiness.readiness_percentage.desc()
    ).all()
    result = []
    for rec in records:
        emp = db.query(Employee).filter(Employee.id == rec.employee_id).first()
        from app.models import Role
        role = db.query(Role).filter(Role.id == rec.target_role_id).first()
        result.append({
            "employee_id": rec.employee_id,
            "employee_name": emp.name if emp else "Unknown",
            "target_role": role.name if role else "Unknown",
            "readiness_percentage": rec.readiness_percentage,
            "criteria_met": rec.criteria_met,
            "criteria_total": rec.criteria_total,
            "missing_criteria": rec.missing_criteria,
            "calculated_at": rec.calculated_at,
        })
    return result
