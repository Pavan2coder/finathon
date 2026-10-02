"""
Career path and promotion readiness database models.
"""
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database.database import Base


class CareerPath(Base):
    """Career path model defining possible role progressions."""
    
    __tablename__ = "career_paths"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    from_role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    to_role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    from_role = relationship("Role", foreign_keys=[from_role_id], back_populates="career_paths_from")
    to_role = relationship("Role", foreign_keys=[to_role_id], back_populates="career_paths_to")
    
    def __repr__(self):
        return f"<CareerPath {self.from_role_id} -> {self.to_role_id}>"


class PromotionReadiness(Base):
    """Promotion readiness model tracking employee readiness for next role."""
    
    __tablename__ = "promotion_readiness"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    target_role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    readiness_percentage = Column(Float, nullable=False)  # 0.0 - 100.0
    criteria_met = Column(Integer, nullable=False)
    criteria_total = Column(Integer, nullable=False)
    missing_criteria = Column(JSON, nullable=True)  # List of missing criteria
    criteria_details = Column(JSON, nullable=True)  # Detailed breakdown of each criterion
    calculated_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    employee = relationship("Employee", back_populates="promotion_readiness")
    target_role = relationship("Role", back_populates="promotion_readiness")
    
    def __repr__(self):
        return f"<PromotionReadiness {self.employee_id} -> {self.target_role_id}: {self.readiness_percentage:.1f}%>"
