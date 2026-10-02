"""
Calibration service — wraps analytics engine and exposes business operations.
"""
from typing import Dict, List, Optional
import statistics
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models import (
    CalibrationAlert, Employee, PerformanceReview, AuditLog, AlertStatus
)
from app.analytics.calibration_analysis import (
    get_calibration_summary,
    calculate_manager_statistics,
    calculate_organization_average,
    calculate_manager_z_score,
    generate_calibration_alerts,
)


def get_full_overview(db: Session) -> Dict:
    summary = get_calibration_summary(db)

    alerts = db.query(CalibrationAlert).order_by(CalibrationAlert.created_at.desc()).all()
    alert_list = _serialize_alerts(db, alerts)

    manager_ids = [m[0] for m in db.query(PerformanceReview.manager_id).distinct().all()]
    all_ratings = [r[0] for r in db.query(PerformanceReview.manager_rating).all()]
    org_avg = calculate_organization_average(db)
    org_std = statistics.stdev(all_ratings) if len(all_ratings) > 1 else 1.0

    manager_stats = []
    for mid in manager_ids:
        stats = calculate_manager_statistics(db, mid)
        manager = db.query(Employee).filter(Employee.id == mid).first()
        z = calculate_manager_z_score(stats, org_avg, org_std)
        manager_stats.append({**stats, "manager_name": manager.name if manager else "Unknown", "z_score": round(z, 3)})

    return {"summary": summary, "alerts": alert_list, "manager_statistics": manager_stats}


def _serialize_alerts(db: Session, alerts: List[CalibrationAlert]) -> List[Dict]:
    result = []
    for a in alerts:
        emp = db.query(Employee).filter(Employee.id == a.employee_id).first()
        mgr = db.query(Employee).filter(Employee.id == a.manager_id).first()
        result.append({
            "id": a.id,
            "employee_id": a.employee_id,
            "employee_name": emp.name if emp else "Unknown",
            "manager_id": a.manager_id,
            "manager_name": mgr.name if mgr else "Unknown",
            "review_id": a.review_id,
            "evidence_score": a.evidence_score,
            "manager_rating": a.manager_rating,
            "expected_rating_min": a.expected_rating_min,
            "expected_rating_max": a.expected_rating_max,
            "deviation": a.deviation,
            "severity": a.severity.value,
            "reason": a.reason,
            "recommended_action": a.recommended_action,
            "status": a.status.value,
            "supporting_evidence": a.supporting_evidence,
            "created_at": a.created_at,
            "updated_at": a.updated_at,
        })
    return result


def get_alert_detail(db: Session, alert_id: str) -> Dict:
    alert = db.query(CalibrationAlert).filter(CalibrationAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(404, detail={"code": "ALERT_NOT_FOUND", "message": "Calibration alert not found."})

    emp = db.query(Employee).filter(Employee.id == alert.employee_id).first()
    mgr = db.query(Employee).filter(Employee.id == alert.manager_id).first()
    review = db.query(PerformanceReview).filter(PerformanceReview.id == alert.review_id).first() if alert.review_id else None

    audits = db.query(AuditLog).filter(
        AuditLog.entity_type == "CALIBRATION_ALERT",
        AuditLog.entity_id == alert_id,
    ).order_by(AuditLog.timestamp.desc()).all()

    return {
        "id": alert.id,
        "employee": {"id": emp.id, "name": emp.name, "department": emp.department} if emp else None,
        "manager": {"id": mgr.id, "name": mgr.name} if mgr else None,
        "review": {
            "id": review.id,
            "review_cycle": review.review_cycle,
            "manager_rating": review.manager_rating,
            "evidence_components": review.evidence_components,
        } if review else None,
        "evidence_score": alert.evidence_score,
        "manager_rating": alert.manager_rating,
        "expected_rating_min": alert.expected_rating_min,
        "expected_rating_max": alert.expected_rating_max,
        "deviation": alert.deviation,
        "severity": alert.severity.value,
        "reason": alert.reason,
        "recommended_action": alert.recommended_action,
        "status": alert.status.value,
        "supporting_evidence": alert.supporting_evidence,
        "audit_history": [
            {
                "action": au.action,
                "old_value": au.old_value,
                "new_value": au.new_value,
                "timestamp": au.timestamp,
            }
            for au in audits
        ],
        "created_at": alert.created_at,
        "updated_at": alert.updated_at,
    }


def update_alert_status(
    db: Session,
    alert_id: str,
    new_status: AlertStatus,
    actor_id: str,
    notes: Optional[str] = None,
) -> Dict:
    alert = db.query(CalibrationAlert).filter(CalibrationAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(404, detail={"code": "ALERT_NOT_FOUND", "message": "Calibration alert not found."})

    old_status = alert.status
    alert.status = new_status
    db.commit()
    db.refresh(alert)

    audit = AuditLog(
        user_id=actor_id,
        action="UPDATE_CALIBRATION_ALERT",
        entity_type="CALIBRATION_ALERT",
        entity_id=alert_id,
        old_value={"status": old_status.value, "notes": None},
        new_value={"status": new_status.value, "notes": notes},
    )
    db.add(audit)
    db.commit()
    return get_alert_detail(db, alert_id)


def trigger_alert_generation(db: Session, review_cycle: Optional[str] = None) -> int:
    alerts = generate_calibration_alerts(db, review_cycle)
    for a in alerts:
        db.add(a)
    db.commit()
    return len(alerts)
