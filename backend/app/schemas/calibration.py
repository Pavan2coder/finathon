"""
Calibration schemas.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List, Any
from app.models.calibration import AlertSeverity, AlertStatus


class CalibrationAlertResponse(BaseModel):
    """Schema for calibration alert response."""
    id: str
    employee_id: str
    employee_name: str
    manager_id: str
    manager_name: str
    review_id: Optional[str]
    evidence_score: float
    manager_rating: float
    expected_rating_min: Optional[float]
    expected_rating_max: Optional[float]
    deviation: float
    severity: AlertSeverity
    reason: str
    recommended_action: Optional[str]
    status: AlertStatus
    supporting_evidence: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CalibrationSummary(BaseModel):
    """Summary of calibration alerts."""
    total_alerts: int
    high_severity: int
    medium_severity: int
    low_severity: int
    open_alerts: int
    under_review: int
    resolved: int


class ManagerStatistics(BaseModel):
    """Manager rating statistics."""
    manager_id: str
    manager_name: str
    average_rating: float
    median_rating: float
    std_dev: float
    total_reviews: int
    rating_distribution: Dict[str, int]
    high_ratings_percentage: float
    low_ratings_percentage: float
    z_score: Optional[float] = None  # Compared to organization average


class CalibrationOverview(BaseModel):
    """Complete calibration overview."""
    summary: CalibrationSummary
    alerts: List[CalibrationAlertResponse]
    manager_statistics: List[ManagerStatistics]


class CalibrationAlertUpdate(BaseModel):
    """Schema for updating calibration alert status."""
    status: AlertStatus
    notes: Optional[str] = None
