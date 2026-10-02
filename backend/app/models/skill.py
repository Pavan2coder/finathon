"""
Skill and employee skill database models.
"""
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database.database import Base


class Skill(Base):
    """Skill model representing skills that can be assessed."""
    
    __tablename__ = "skills"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)  # TECHNICAL, LEADERSHIP, COMMUNICATION, etc.
    description = Column(Text, nullable=True)
    
    # Relationships
    employee_skills = relationship("EmployeeSkill", back_populates="skill", cascade="all, delete-orphan")
    role_requirements = relationship("RoleSkill", back_populates="skill", cascade="all, delete-orphan")
    development_plans = relationship("DevelopmentPlan", back_populates="skill", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Skill {self.name} ({self.category})>"


class EmployeeSkill(Base):
    """Employee skills - tracks current skill levels for each employee."""
    
    __tablename__ = "employee_skills"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False)
    current_level = Column(Float, nullable=False)  # 1.0 - 5.0
    last_assessed = Column(DateTime, server_default=func.now())
    evidence_count = Column(Integer, default=0)  # Number of evidence items supporting this assessment
    
    # Relationships
    employee = relationship("Employee", back_populates="skills")
    skill = relationship("Skill", back_populates="employee_skills")
    
    def __repr__(self):
        return f"<EmployeeSkill {self.employee_id} - {self.skill_id}: {self.current_level}>"
