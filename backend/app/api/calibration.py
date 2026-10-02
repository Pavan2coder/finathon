"""
Calibration API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_hr_admin
from app.schemas.calibration import (
    CalibrationAlertResponse, CalibrationOverview,
    CalibrationSummary, ManagerStatistics, CalibrationAlertUpdate
)
from app.models import CalibrationAlert, Employee, PerformanceReview
from app.analytics.calibration_analysis import (
    get_calibration_summary, calculate_manager_statistics,
    calculate_organization_average, calculate_manager_z_score,
    generate_calibration_alerts
)
import statistics

router = APIRouter()


@router.get("/", response_model=CalibrationOverview)
def get_calibration_overview(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_hr_admin)
):
    """
    Get complete calibration overview with alerts and manager statistics.
    
    Requires HR_ADMIN role.
    """
    # Get summary
    summary_data = get_calibration_summary(db)
    summary = CalibrationSummary(**summary_data)
    
    # Get all alerts with employee and manager names
    alerts = db.query(CalibrationAlert).all()
    alert_responses = []
    
    for alert in alerts:
        employee = db.query(Employee).filter(Employee.id == alert.employee_id).first()
        manager = db.query(Employee).filter(Employee.id == alert.manager_id).first()
        
        alert_responses.append(CalibrationAlertResponse(
            id=alert.id,
            employee_id=alert.employee_id,
            employee_name=employee.name if employee else "Unknown",
            manager_id=alert.manager_id,
            manager_name=manager.name if manager else "Unknown",
            review_id=alert.review_id,
            evidence_score=alert.evidence_score,
            manager_rating=alert.manager_rating,
            expected_rating_min=alert.expected_rating_min,
            expected_rating_max=alert.expected_rating_max,
            deviation=alert.deviation,
            severity=alert.severity,
            reason=alert.reason,
            recommended_action=alert.recommended_action,
            status=alert.status,
            supporting_evidence=alert.supporting_evidence,
            created_at=alert.created_at,
            updated_at=alert.updated_at
        ))
    
    # Calculate manager statistics
    managers = db.query(PerformanceReview.manager_id).distinct().all()
    manager_ids = [m[0] for m in managers]
    
    # Calculate org-level stats for z-scores
    org_average = calculate_organization_average(db)
    all_ratings = db.query(PerformanceReview.manager_rating).all()
    all_ratings = [r[0] for r in all_ratings]
    org_std_dev = statistics.stdev(all_ratings) if len(all_ratings) > 1 else 1.0
    
    manager_stats_list = []
    for manager_id in manager_ids:
        stats = calculate_manager_statistics(db, manager_id)
        manager = db.query(Employee).filter(Employee.id == manager_id).first()
        
        z_score = calculate_manager_z_score(stats, org_average, org_std_dev)
        
        manager_stats_list.append(ManagerStatistics(
            manager_id=manager_id,
            manager_name=manager.name if manager else "Unknown",
            average_rating=stats["average_rating"],
            median_rating=stats["median_rating"],
            std_dev=stats["std_dev"],
            total_reviews=stats["total_reviews"],
            rating_distribution=stats["rating_distribution"],
            high_ratings_percentage=stats["high_ratings_percentage"],
            low_ratings_percentage=stats["low_ratings_percentage"],
            z_score=z_score
        ))
    
    return CalibrationOverview(
        summary=summary,
        alerts=alert_responses,
        manager_statistics=manager_stats_list
    )


@router.get("/{alert_id}", response_model=CalibrationAlertResponse)
def get_calibration_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_hr_admin)
):
    """
    Get detailed calibration alert by ID.
    
    Requires HR_ADMIN role.
    """
    alert = db.query(CalibrationAlert).filter(CalibrationAlert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calibration alert not found"
        )
    
    employee = db.query(Employee).filter(Employee.id == alert.employee_id).first()
    manager = db.query(Employee).filter(Employee.id == alert.manager_id).first()
    
    return CalibrationAlertResponse(
        id=alert.id,
        employee_id=alert.employee_id,
        employee_name=employee.name if employee else "Unknown",
        manager_id=alert.manager_id,
        manager_name=manager.name if manager else "Unknown",
        review_id=alert.review_id,
        evidence_score=alert.evidence_score,
        manager_rating=alert.manager_rating,
        expected_rating_min=alert.expected_rating_min,
        expected_rating_max=alert.expected_rating_max,
        deviation=alert.deviation,
        severity=alert.severity,
        reason=alert.reason,
        recommended_action=alert.recommended_action,
        status=alert.status,
        supporting_evidence=alert.supporting_evidence,
        created_at=alert.created_at,
        updated_at=alert.updated_at
    )


@router.put("/{alert_id}", response_model=CalibrationAlertResponse)
def update_calibration_alert(
    alert_id: str,
    update_data: CalibrationAlertUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_hr_admin)
):
    """
    Update calibration alert status.
    
    Requires HR_ADMIN role.
    """
    alert = db.query(CalibrationAlert).filter(CalibrationAlert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calibration alert not found"
        )
    
    # Update status
    old_status = alert.status
    alert.status = update_data.status
    
    db.commit()
    db.refresh(alert)
    
    # Log the change
    from app.models import AuditLog
    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_CALIBRATION_ALERT",
        entity_type="CALIBRATION_ALERT",
        entity_id=alert_id,
        old_value={"status": old_status.value},
        new_value={"status": alert.status.value}
    )
    db.add(audit)
    db.commit()
    
    # Return updated alert
    employee = db.query(Employee).filter(Employee.id == alert.employee_id).first()
    manager = db.query(Employee).filter(Employee.id == alert.manager_id).first()
    
    return CalibrationAlertResponse(
        id=alert.id,
        employee_id=alert.employee_id,
        employee_name=employee.name if employee else "Unknown",
        manager_id=alert.manager_id,
        manager_name=manager.name if manager else "Unknown",
        review_id=alert.review_id,
        evidence_score=alert.evidence_score,
        manager_rating=alert.manager_rating,
        expected_rating_min=alert.expected_rating_min,
        expected_rating_max=alert.expected_rating_max,
        deviation=alert.deviation,
        severity=alert.severity,
        reason=alert.reason,
        recommended_action=alert.recommended_action,
        status=alert.status,
        supporting_evidence=alert.supporting_evidence,
        created_at=alert.created_at,
        updated_at=alert.updated_at
    )


@router.post("/generate")
def generate_alerts(
    review_cycle: str = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_hr_admin)
):
    """
    Generate calibration alerts for reviews.
    
    Requires HR_ADMIN role.
    """
    alerts = generate_calibration_alerts(db, review_cycle)
    
    for alert in alerts:
        db.add(alert)
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Generated {len(alerts)} calibration alerts"
    }
