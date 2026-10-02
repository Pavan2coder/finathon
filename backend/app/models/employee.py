"""
Employee database model.
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database.database import Base


class EmployeeRole(str, enum.Enum):
    HR_ADMIN = "HR_ADMIN"
    MANAGER = "MANAGER"
    EMPLOYEE = "EMPLOYEE"


class EmployeeStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    ON_LEAVE = "ON_LEAVE"


class Employee(Base):
    __tablename__ = "employees"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_code = Column(String, unique=True, nullable=False, index=True)
    name          = Column(String, nullable=False)
    email         = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role          = Column(SQLEnum(EmployeeRole), nullable=False, default=EmployeeRole.EMPLOYEE)
    role_id       = Column(String, ForeignKey("roles.id"), nullable=True)
    department    = Column(String, nullable=False)
    manager_id    = Column(String, ForeignKey("employees.id"), nullable=True)
    joining_date  = Column(DateTime, nullable=False)
    status        = Column(SQLEnum(EmployeeStatus), nullable=False, default=EmployeeStatus.ACTIVE)
    created_at    = Column(DateTime, server_default=func.now())
    updated_at    = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # ── Relationships ────────────────────────────────────────────────────────
    role_info = relationship(
        "Role", back_populates="employees", foreign_keys=[role_id]
    )
    manager = relationship(
        "Employee", remote_side=[id], foreign_keys=[manager_id], backref="team_members"
    )
    goals = relationship(
        "Goal", back_populates="employee", cascade="all, delete-orphan"
    )
    projects = relationship(
        "Project", back_populates="employee", cascade="all, delete-orphan"
    )
    deliverables = relationship(
        "Deliverable", back_populates="employee", cascade="all, delete-orphan"
    )
    feedback_received = relationship(
        "Feedback",
        foreign_keys="Feedback.employee_id",
        back_populates="employee",
        cascade="all, delete-orphan",
    )
    feedback_given = relationship(
        "Feedback",
        foreign_keys="Feedback.reviewer_id",
        back_populates="reviewer",
    )
    skills = relationship(
        "EmployeeSkill", back_populates="employee", cascade="all, delete-orphan"
    )
    training = relationship(
        "Training", back_populates="employee", cascade="all, delete-orphan"
    )
    attendance = relationship(
        "Attendance", back_populates="employee", cascade="all, delete-orphan"
    )
    # Two FK paths to employees → must specify which one this relationship uses
    performance_reviews = relationship(
        "PerformanceReview",
        foreign_keys="PerformanceReview.employee_id",
        back_populates="employee",
        cascade="all, delete-orphan",
    )
    development_plans = relationship(
        "DevelopmentPlan", back_populates="employee", cascade="all, delete-orphan"
    )
    promotion_readiness = relationship(
        "PromotionReadiness", back_populates="employee", cascade="all, delete-orphan"
    )
    # CalibrationAlert has employee_id and manager_id both → employees
    calibration_alerts = relationship(
        "CalibrationAlert",
        foreign_keys="CalibrationAlert.employee_id",
        back_populates="employee",
        cascade="all, delete-orphan",
    )
    business_impacts = relationship(
        "BusinessImpact", back_populates="employee", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Employee {self.employee_code}: {self.name}>"
