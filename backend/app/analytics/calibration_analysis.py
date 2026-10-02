"""
Calibration analysis engine - identifies rating inconsistencies across managers.
"""
from typing import Dict, List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import statistics
from app.core.config import settings
from app.models import (
    PerformanceReview, Employee, CalibrationAlert,
    AlertSeverity, AlertStatus
)


def calculate_manager_statistics(db: Session, manager_id: str) -> Dict:
    """
    Calculate rating statistics for a specific manager.
    
    Args:
        db: Database session
        manager_id: Manager ID
        
    Returns:
        Dictionary with manager rating statistics
    """
    reviews = db.query(PerformanceReview).filter(
        PerformanceReview.manager_id == manager_id
    ).all()
    
    if not reviews:
        return {
            "manager_id": manager_id,
            "total_reviews": 0,
            "average_rating": 0.0,
            "median_rating": 0.0,
            "std_dev": 0.0,
            "rating_distribution": {},
            "high_ratings_percentage": 0.0,
            "low_ratings_percentage": 0.0
        }
    
    ratings = [r.manager_rating for r in reviews]
    
    # Calculate distribution
    rating_distribution = {
        "1": sum(1 for r in ratings if 1.0 <= r < 2.0),
        "2": sum(1 for r in ratings if 2.0 <= r < 3.0),
        "3": sum(1 for r in ratings if 3.0 <= r < 4.0),
        "4": sum(1 for r in ratings if 4.0 <= r < 5.0),
        "5": sum(1 for r in ratings if r >= 5.0),
    }
    
    high_ratings = sum(1 for r in ratings if r >= 4.0)
    low_ratings = sum(1 for r in ratings if r <= 2.0)
    
    return {
        "manager_id": manager_id,
        "total_reviews": len(reviews),
        "average_rating": statistics.mean(ratings),
        "median_rating": statistics.median(ratings),
        "std_dev": statistics.stdev(ratings) if len(ratings) > 1 else 0.0,
        "rating_distribution": rating_distribution,
        "high_ratings_percentage": (high_ratings / len(ratings)) * 100,
        "low_ratings_percentage": (low_ratings / len(ratings)) * 100
    }


def calculate_organization_average(db: Session) -> float:
    """
    Calculate organization-wide average rating.
    
    Args:
        db: Database session
        
    Returns:
        Organization average rating
    """
    result = db.query(func.avg(PerformanceReview.manager_rating)).scalar()
    return result if result else 3.0


def calculate_manager_z_score(
    manager_stats: Dict,
    org_average: float,
    org_std_dev: float
) -> float:
    """
    Calculate z-score for a manager's ratings compared to organization.
    
    Args:
        manager_stats: Manager statistics
        org_average: Organization average rating
        org_std_dev: Organization standard deviation
        
    Returns:
        Z-score
    """
    if org_std_dev == 0:
        return 0.0
    
    manager_avg = manager_stats["average_rating"]
    return (manager_avg - org_average) / org_std_dev


def determine_alert_severity(deviation: float) -> AlertSeverity:
    """
    Determine alert severity based on deviation.
    
    Args:
        deviation: Absolute deviation between evidence and rating
        
    Returns:
        Alert severity
    """
    abs_deviation = abs(deviation)
    
    if abs_deviation >= settings.CALIBRATION_THRESHOLD_HIGH:
        return AlertSeverity.HIGH
    elif abs_deviation >= settings.CALIBRATION_THRESHOLD_MEDIUM:
        return AlertSeverity.MEDIUM
    else:
        return AlertSeverity.LOW


def calculate_expected_rating_range(evidence_score: float) -> Tuple[float, float]:
    """
    Calculate expected rating range based on evidence score.
    
    Converts 0-100 evidence score to 1-5 rating scale with tolerance.
    
    Args:
        evidence_score: Evidence score (0-100)
        
    Returns:
        Tuple of (min_expected_rating, max_expected_rating)
    """
    # Convert 0-100 to 1-5 scale
    # 0-100 maps to 1.0-5.0
    base_rating = 1.0 + (evidence_score / 100.0) * 4.0
    
    # Allow ±0.5 tolerance
    tolerance = 0.5
    
    return (
        max(1.0, base_rating - tolerance),
        min(5.0, base_rating + tolerance)
    )


def analyze_evidence_vs_rating(
    db: Session,
    employee_id: str,
    review_id: str,
    evidence_score: float,
    manager_rating: float
) -> Optional[Dict]:
    """
    Analyze mismatch between evidence score and manager rating.
    
    Args:
        db: Database session
        employee_id: Employee ID
        review_id: Performance review ID
        evidence_score: Evidence-based score (0-100)
        manager_rating: Manager's rating (1-5)
        
    Returns:
        Alert data dict if calibration needed, None otherwise
    """
    # Convert manager rating to comparable scale (1-5 to 0-100)
    manager_rating_normalized = ((manager_rating - 1.0) / 4.0) * 100
    
    # Calculate deviation
    deviation = evidence_score - manager_rating_normalized
    
    # Determine if alert is needed
    severity = determine_alert_severity(deviation)
    
    # If deviation is too small, no alert needed
    if abs(deviation) < settings.CALIBRATION_THRESHOLD_MEDIUM:
        return None
    
    # Calculate expected rating range
    expected_min, expected_max = calculate_expected_rating_range(evidence_score)
    
    # Determine reason
    if deviation > 0:
        reason = "Rating differs significantly from evidence indicators. Evidence suggests higher performance than rating reflects."
    else:
        reason = "Rating differs significantly from evidence indicators. Rating is higher than supporting evidence suggests."
    
    review = db.query(PerformanceReview).filter(
        PerformanceReview.id == review_id
    ).first()
    
    return {
        "employee_id": employee_id,
        "manager_id": review.manager_id if review else None,
        "review_id": review_id,
        "evidence_score": evidence_score,
        "manager_rating": manager_rating,
        "expected_rating_min": expected_min,
        "expected_rating_max": expected_max,
        "deviation": deviation,
        "severity": severity,
        "reason": reason,
        "recommended_action": "Review during calibration session to ensure rating consistency.",
        "status": AlertStatus.OPEN
    }


def detect_manager_outliers(db: Session) -> List[str]:
    """
    Detect managers with unusual rating patterns.
    
    Args:
        db: Database session
        
    Returns:
        List of manager IDs with outlier patterns
    """
    # Get all managers who have submitted reviews
    managers = db.query(PerformanceReview.manager_id).distinct().all()
    manager_ids = [m[0] for m in managers]
    
    if len(manager_ids) < 3:
        # Not enough managers to detect outliers
        return []
    
    # Calculate organization statistics
    org_average = calculate_organization_average(db)
    
    all_ratings = db.query(PerformanceReview.manager_rating).all()
    all_ratings = [r[0] for r in all_ratings]
    org_std_dev = statistics.stdev(all_ratings) if len(all_ratings) > 1 else 1.0
    
    outlier_managers = []
    
    for manager_id in manager_ids:
        stats = calculate_manager_statistics(db, manager_id)
        
        if stats["total_reviews"] < 3:
            # Not enough reviews to make determination
            continue
        
        z_score = calculate_manager_z_score(stats, org_average, org_std_dev)
        
        # Flag if z-score exceeds threshold
        if abs(z_score) > settings.MANAGER_RATING_OUTLIER_SIGMA:
            outlier_managers.append(manager_id)
    
    return outlier_managers


def generate_calibration_alerts(
    db: Session,
    review_cycle: Optional[str] = None
) -> List[CalibrationAlert]:
    """
    Generate calibration alerts for reviews with rating inconsistencies.
    
    Args:
        db: Database session
        review_cycle: Optional specific review cycle to analyze
        
    Returns:
        List of generated calibration alerts
    """
    # Query reviews
    query = db.query(PerformanceReview).filter(
        PerformanceReview.evidence_score.isnot(None)
    )
    
    if review_cycle:
        query = query.filter(PerformanceReview.review_cycle == review_cycle)
    
    reviews = query.all()
    
    alerts_to_create = []
    
    for review in reviews:
        alert_data = analyze_evidence_vs_rating(
            db,
            review.employee_id,
            review.id,
            review.evidence_score,
            review.manager_rating
        )
        
        if alert_data:
            # Check if alert already exists
            existing_alert = db.query(CalibrationAlert).filter(
                CalibrationAlert.review_id == review.id,
                CalibrationAlert.status.in_([AlertStatus.OPEN, AlertStatus.UNDER_REVIEW])
            ).first()
            
            if not existing_alert:
                alert = CalibrationAlert(**alert_data)
                alerts_to_create.append(alert)
    
    return alerts_to_create


def get_calibration_summary(db: Session) -> Dict:
    """
    Get summary of all calibration alerts.
    
    Args:
        db: Database session
        
    Returns:
        Summary dictionary
    """
    alerts = db.query(CalibrationAlert).all()
    
    return {
        "total_alerts": len(alerts),
        "high_severity": sum(1 for a in alerts if a.severity == AlertSeverity.HIGH),
        "medium_severity": sum(1 for a in alerts if a.severity == AlertSeverity.MEDIUM),
        "low_severity": sum(1 for a in alerts if a.severity == AlertSeverity.LOW),
        "open_alerts": sum(1 for a in alerts if a.status == AlertStatus.OPEN),
        "under_review": sum(1 for a in alerts if a.status == AlertStatus.UNDER_REVIEW),
        "resolved": sum(1 for a in alerts if a.status == AlertStatus.RESOLVED)
    }
