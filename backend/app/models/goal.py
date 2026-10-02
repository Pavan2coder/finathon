"""
Goal database model.
"""
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database.database import Base


class GoalStatus(str, enum.Enum):
    """Goal status enumeration."""
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Goal(Base):
    """Goal model representing employee goals and objectives."""
    
    __tablename__ = "goals"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    target_value = Column(Float, nullable=False)
    actual_value = Column(Float, default=0.0)
    unit = Column(String, nullable=True)  # e.g., "tickets", "revenue", "percentage"
    weight = Column(Float, default=1.0)  # Relative weight of this goal
    status = Column(SQLEnum(GoalStatus), nullable=False, default=GoalStatus.NOT_STARTED)
    review_cycle = Column(String, nullable=False)  # e.g., "2026-H1", "2026-Q1"
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    employee = relationship("Employee", back_populates="goals")
    
    @property
    def achievement_percentage(self) -> float:
        """Calculate goal achievement percentage."""
        if self.target_value == 0:
            return 0.0
        return min((self.actual_value / self.target_value) * 100, 200.0)  # Cap at 200%
    
    def __repr__(self):
        return f"<Goal {self.title} - {self.achievement_percentage:.1f}%>"
