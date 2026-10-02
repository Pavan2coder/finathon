"""
Development plan database model.
"""
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database.database import Base


class ActionType(str, enum.Enum):
    """Development action type enumeration."""
    TRAINING = "TRAINING"
    STRETCH_ASSIGNMENT = "STRETCH_ASSIGNMENT"
    MENTORING = "MENTORING"
    PROJECT = "PROJECT"
    CERTIFICATION = "CERTIFICATION"


class DevelopmentStatus(str, enum.Enum):
    """Development plan status enumeration."""
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class DevelopmentPlan(Base):
    """Development plan model representing skill development initiatives."""
    
    __tablename__ = "development_plans"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False)
    goal = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    action_type = Column(SQLEnum(ActionType), nullable=False)
    progress = Column(Float, default=0.0)  # 0.0 - 100.0
    target_date = Column(DateTime, nullable=True)
    status = Column(SQLEnum(DevelopmentStatus), nullable=False, default=DevelopmentStatus.PLANNED)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    employee = relationship("Employee", back_populates="development_plans")
    skill = relationship("Skill", back_populates="development_plans")
    
    def __repr__(self):
        return f"<DevelopmentPlan {self.employee_id} - {self.skill_id}: {self.action_type.value}>"
