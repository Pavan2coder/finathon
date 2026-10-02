"""
Role and role skills database models.
"""
from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid
from app.database.database import Base


class Role(Base):
    """Role model representing job roles/positions."""
    
    __tablename__ = "roles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    level = Column(Integer, nullable=False)  # 1=Junior, 2=Mid, 3=Senior, 4=Staff, etc.
    
    # Relationships
    employees = relationship("Employee", back_populates="role_info", foreign_keys="Employee.role_id")
    required_skills = relationship("RoleSkill", back_populates="role", cascade="all, delete-orphan")
    career_paths_from = relationship("CareerPath", foreign_keys="CareerPath.from_role_id", back_populates="from_role")
    career_paths_to = relationship("CareerPath", foreign_keys="CareerPath.to_role_id", back_populates="to_role")
    promotion_readiness = relationship("PromotionReadiness", back_populates="target_role")
    
    def __repr__(self):
        return f"<Role {self.name} (Level {self.level})>"


class RoleSkill(Base):
    """Role skills - defines skills required for each role."""
    
    __tablename__ = "role_skills"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False)
    required_level = Column(Float, nullable=False)  # 1.0 - 5.0
    importance = Column(String, nullable=False, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    
    # Relationships
    role = relationship("Role", back_populates="required_skills")
    skill = relationship("Skill", back_populates="role_requirements")
    
    def __repr__(self):
        return f"<RoleSkill {self.role_id} requires {self.skill_id} at {self.required_level}>"
