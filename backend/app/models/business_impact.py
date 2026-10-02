"""
Business impact database model.
"""
from sqlalchemy import Column, String, Float, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
import uuid
from app.database.database import Base
from app.models.project import ImpactLevel


class BusinessImpact(Base):
    """Business impact model representing measurable business outcomes."""
    
    __tablename__ = "business_impacts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    metric_name = Column(String, nullable=False)
    baseline_value = Column(Float, nullable=False)
    actual_value = Column(Float, nullable=False)
    improvement_percentage = Column(Float, nullable=False)
    impact_level = Column(SQLEnum(ImpactLevel), nullable=False, default=ImpactLevel.MEDIUM)
    description = Column(Text, nullable=True)
    
    # Relationships
    employee = relationship("Employee", back_populates="business_impacts")
    project = relationship("Project", back_populates="business_impacts")
    
    def __repr__(self):
        return f"<BusinessImpact {self.metric_name}: +{self.improvement_percentage}%>"
