"""
Training database model.
"""
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database.database import Base


class TrainingStatus(str, enum.Enum):
    """Training status enumeration."""
    ENROLLED = "ENROLLED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Training(Base):
    """Training model representing training and certifications completed by employees."""
    
    __tablename__ = "training"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=True)
    category = Column(String, nullable=False)  # TECHNICAL, LEADERSHIP, SOFT_SKILLS, etc.
    completion_date = Column(DateTime, nullable=True)
    score = Column(Float, nullable=True)  # Grade or assessment score
    status = Column(SQLEnum(TrainingStatus), nullable=False, default=TrainingStatus.ENROLLED)
    
    # Relationships
    employee = relationship("Employee", back_populates="training")
    
    def __repr__(self):
        return f"<Training {self.name} - {self.status.value}>"
