"""
Reports API — aggregated analytics for HR/management reporting.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_hr_admin, get_current_manager
from app.models import Employee
from app.services.report_service import (
    get_dashboard_summary,
    get_performance_report,
    get_calibration_report,
    get_skills_report,
    get_promotion_readiness_report,
)

router = APIRouter()


@router.get("/dashboard/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """
    Return top-level KPI summary for the dashboard.

    Returns:
      - total_employees, reviews_completed, average_evidence_score,
        calibration_alerts, promotion_ready
    """
    summary = get_dashboard_summary(db)
    return {"success": True, "data": summary, "message": "Dashboard summary retrieved."}


@router.get("/performance")
def performance_report(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Performance summary report for all active employees."""
    data = get_performance_report(db)
    return {
        "success": True,
        "data": data,
        "pagination": {"total": len(data)},
        "message": "Performance report retrieved.",
    }


@router.get("/calibration")
def calibration_report(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_hr_admin),
):
    """Calibration alerts report grouped by severity. Requires HR_ADMIN."""
    data = get_calibration_report(db)
    return {"success": True, "data": data, "message": "Calibration report retrieved."}


@router.get("/skills")
def skills_report(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Org-wide skill coverage and average levels."""
    data = get_skills_report(db)
    return {"success": True, "data": data, "message": "Skills report retrieved."}


@router.get("/promotion-readiness")
def promotion_readiness_report(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_hr_admin),
):
    """Promotion readiness report ordered by readiness percentage. Requires HR_ADMIN."""
    data = get_promotion_readiness_report(db)
    return {
        "success": True,
        "data": data,
        "pagination": {"total": len(data)},
        "message": "Promotion readiness report retrieved.",
    }
