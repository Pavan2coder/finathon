"""
Project and deliverable database models.
"""
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database.database import Base


class ImpactLevel(str, enum.Enum):
    """Impact level enumeration."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Project(Base):
    """Project model representing projects employees have worked on."""
    
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    role = Column(String, nullable=False)  # Role in the project
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    completion_percentage = Column(Float, default=0.0)
    outcome = Column(Text, nullable=True)
    business_impact = Column(Text, nullable=True)
    impact_level = Column(SQLEnum(ImpactLevel), nullable=False, default=ImpactLevel.MEDIUM)
    
    # Relationships
    employee = relationship("Employee", back_populates="projects")
    deliverables = relationship("Deliverable", back_populates="project", cascade="all, delete-orphan")
    business_impacts = relationship("BusinessImpact", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Project {self.name} ({self.impact_level.value})>"


class DeliverableStatus(str, enum.Enum):
    """Deliverable status enumeration."""
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DELAYED = "DELAYED"


class Deliverable(Base):
    """Deliverable model representing specific work outputs."""
    
    __tablename__ = "deliverables"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(DeliverableStatus), nullable=False, default=DeliverableStatus.PENDING)
    quality_score = Column(Float, nullable=True)  # 1.0 - 5.0
    deadline = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    employee = relationship("Employee", back_populates="deliverables")
    project = relationship("Project", back_populates="deliverables")
    
    def __repr__(self):
        return f"<Deliverable {self.title} - {self.status.value}>"
