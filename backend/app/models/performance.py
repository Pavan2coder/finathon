"""
Performance review database model.
"""
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Text, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database.database import Base


class ReviewStatus(str, enum.Enum):
    """Review status enumeration."""
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    CALIBRATION_REQUIRED = "CALIBRATION_REQUIRED"
    CALIBRATED = "CALIBRATED"
    FINALIZED = "FINALIZED"


class PerformanceReview(Base):
    """Performance review model representing formal performance evaluations."""
    
    __tablename__ = "performance_reviews"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    manager_id = Column(String, ForeignKey("employees.id"), nullable=False)
    review_cycle = Column(String, nullable=False)  # e.g., "2026-H1"
    manager_rating = Column(Float, nullable=False)  # 1.0 - 5.0
    manager_comments = Column(Text, nullable=True)
    evidence_score = Column(Float, nullable=True)  # Calculated evidence-based score
    evidence_components = Column(JSON, nullable=True)  # Breakdown of evidence score
    status = Column(SQLEnum(ReviewStatus), nullable=False, default=ReviewStatus.DRAFT)
    calculated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    employee = relationship("Employee", back_populates="performance_reviews", foreign_keys=[employee_id])
    manager = relationship("Employee", foreign_keys=[manager_id])
    
    def __repr__(self):
        return f"<PerformanceReview {self.employee_id} - {self.review_cycle}: {self.manager_rating}>"
