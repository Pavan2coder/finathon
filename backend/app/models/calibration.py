"""
Calibration alert database model.
"""
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Text, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database.database import Base


class AlertSeverity(str, enum.Enum):
    """Alert severity enumeration."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class AlertStatus(str, enum.Enum):
    """Alert status enumeration."""
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class CalibrationAlert(Base):
    """Calibration alert model for flagging rating inconsistencies."""
    
    __tablename__ = "calibration_alerts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    manager_id = Column(String, ForeignKey("employees.id"), nullable=False)
    review_id = Column(String, ForeignKey("performance_reviews.id"), nullable=True)
    evidence_score = Column(Float, nullable=False)
    manager_rating = Column(Float, nullable=False)
    expected_rating_min = Column(Float, nullable=True)
    expected_rating_max = Column(Float, nullable=True)
    deviation = Column(Float, nullable=False)  # Difference between evidence and rating
    severity = Column(SQLEnum(AlertSeverity), nullable=False)
    reason = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=True)
    status = Column(SQLEnum(AlertStatus), nullable=False, default=AlertStatus.OPEN)
    supporting_evidence = Column(JSON, nullable=True)  # Evidence IDs supporting the alert
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    employee = relationship("Employee", back_populates="calibration_alerts", foreign_keys=[employee_id])
    manager = relationship("Employee", foreign_keys=[manager_id])
    review = relationship("PerformanceReview", foreign_keys=[review_id])
    
    def __repr__(self):
        return f"<CalibrationAlert {self.employee_id} - {self.severity.value}: Deviation {self.deviation:.1f}>"
