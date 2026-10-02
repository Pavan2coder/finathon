"""
Pytest fixtures shared across the test suite.
Uses an in-memory SQLite DB — created fresh for every test function.
"""
import pytest
from datetime import datetime
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database.database import Base
from app.core.security import get_password_hash, create_access_token
from app.models import (
    Employee, EmployeeRole, EmployeeStatus,
    Role, RoleSkill, Skill, EmployeeSkill,
    Goal, GoalStatus,
    Project, Deliverable, ImpactLevel, DeliverableStatus,
    Feedback, ReviewerType,
    Training, TrainingStatus,
    PerformanceReview, ReviewStatus,
    CalibrationAlert, AlertSeverity, AlertStatus,
    BusinessImpact,
)


# ── Per-test in-memory SQLite engine ─────────────────────────────────────────

@pytest.fixture(scope="function")
def db():
    """Fresh in-memory SQLite DB per test function."""
    from sqlalchemy.pool import StaticPool
    
    # Use StaticPool to ensure all connections share the same in-memory DB
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Enable FK enforcement on SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, _):
        dbapi_conn.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture(scope="function")
def client(db):
    """TestClient wired to the test DB."""
    from app.main import app
    from app.core.dependencies import get_db

    def override_get_db():
        try:
            yield db
        finally:
            pass  # Session managed by db fixture

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()


# ── Counter for unique values ─────────────────────────────────────────────────

_counter = 0


def _uid() -> str:
    global _counter
    _counter += 1
    return str(_counter)


# ── Model factories ───────────────────────────────────────────────────────────

def make_role(db, name=None, level=2) -> Role:
    name = name or f"Role-{_uid()}"
    r = Role(name=name, description=name, level=level)
    db.add(r)
    db.flush()
    return r


def make_skill(db, name=None, category="TECHNICAL") -> Skill:
    name = name or f"Skill-{_uid()}"
    s = Skill(name=name, category=category)
    db.add(s)
    db.flush()
    return s


def make_employee(
    db,
    code=None,
    name="Test Employee",
    email=None,
    role=EmployeeRole.EMPLOYEE,
    department="Engineering",
    role_id=None,
    manager_id=None,
    password="password123",
) -> Employee:
    # Accept string role values
    if isinstance(role, str):
        role = EmployeeRole(role)
    uid = _uid()
    emp = Employee(
        employee_code=code or f"EMP{uid}",
        name=name,
        email=email or f"emp{uid}@company.com",
        password_hash=get_password_hash(password),
        role=role,
        role_id=role_id,
        department=department,
        manager_id=manager_id,
        joining_date=datetime(2022, 1, 1),
        status=EmployeeStatus.ACTIVE,
    )
    db.add(emp)
    db.flush()
    return emp


def make_manager(db, code=None, name="Test Manager", email=None, department="Engineering") -> Employee:
    return make_employee(db, code=code, name=name, email=email, role=EmployeeRole.MANAGER, department=department)


def make_hr_admin(db) -> Employee:
    return make_employee(db, name="HR Admin", role=EmployeeRole.HR_ADMIN)


def make_goal(db, employee_id, target=100.0, actual=90.0, cycle="2026-H1", weight=1.0) -> Goal:
    g = Goal(
        employee_id=employee_id,
        title="Test Goal",
        target_value=target,
        actual_value=actual,
        unit="tasks",
        weight=weight,
        status=GoalStatus.COMPLETED,
        review_cycle=cycle,
    )
    db.add(g)
    db.flush()
    return g


def make_project(db, employee_id, completion=90.0, impact=ImpactLevel.HIGH) -> Project:
    p = Project(
        employee_id=employee_id,
        name="Test Project",
        role="Developer",
        start_date=datetime(2025, 1, 1),
        end_date=datetime(2026, 1, 1),
        completion_percentage=completion,
        impact_level=impact,
    )
    db.add(p)
    db.flush()
    return p


def make_deliverable(db, employee_id, project_id, quality=4.5, status=DeliverableStatus.COMPLETED) -> Deliverable:
    d = Deliverable(
        employee_id=employee_id,
        project_id=project_id,
        title="Test Deliverable",
        status=status,
        quality_score=quality,
        completed_at=datetime(2026, 3, 1),
    )
    db.add(d)
    db.flush()
    return d


def make_feedback(
    db, employee_id, reviewer_id,
    reviewer_type=ReviewerType.MANAGER,
    cycle="2026-H1",
    text="Good work.",
    sentiment="positive",
    strength=0.8,
) -> Feedback:
    f = Feedback(
        employee_id=employee_id,
        reviewer_id=reviewer_id,
        reviewer_type=reviewer_type,
        review_cycle=cycle,
        text=text,
        ai_sentiment=sentiment,
        ai_evidence_strength=strength,
        ai_themes='["collaboration"]',
        ai_skills='[]',
    )
    db.add(f)
    db.flush()
    return f


def make_emp_skill(db, employee_id, skill_id, level=3.5, evidence=5) -> EmployeeSkill:
    es = EmployeeSkill(
        employee_id=employee_id,
        skill_id=skill_id,
        current_level=level,
        evidence_count=evidence,
    )
    db.add(es)
    db.flush()
    return es


def make_training(db, employee_id, score=85.0, status=TrainingStatus.COMPLETED) -> Training:
    t = Training(
        employee_id=employee_id,
        name=f"Training-{_uid()}",
        provider="Platform",
        category="TECHNICAL",
        completion_date=datetime(2026, 3, 1) if status == TrainingStatus.COMPLETED else None,
        score=score,
        status=status,
    )
    db.add(t)
    db.flush()
    return t


def make_review(
    db, employee_id, manager_id,
    rating=4.0, evidence=80.0, cycle="2026-H1",
    status=ReviewStatus.SUBMITTED,
) -> PerformanceReview:
    r = PerformanceReview(
        employee_id=employee_id,
        manager_id=manager_id,
        review_cycle=cycle,
        manager_rating=rating,
        evidence_score=evidence,
        evidence_components={},
        status=status,
        calculated_at=datetime.utcnow(),
    )
    db.add(r)
    db.flush()
    return r


def make_calibration_alert(
    db, employee_id, manager_id, review_id,
    evidence=90.0, rating=3.1,
    deviation=40.0, severity=AlertSeverity.HIGH,
    status=AlertStatus.OPEN,
) -> CalibrationAlert:
    a = CalibrationAlert(
        employee_id=employee_id,
        manager_id=manager_id,
        review_id=review_id,
        evidence_score=evidence,
        manager_rating=rating,
        expected_rating_min=4.0,
        expected_rating_max=4.8,
        deviation=deviation,
        severity=severity,
        reason="Rating differs significantly from evidence indicators.",
        recommended_action="Review during calibration session.",
        status=status,
    )
    db.add(a)
    db.flush()
    return a


def auth_header(employee: Employee) -> dict:
    token = create_access_token({"sub": employee.id})
    return {"Authorization": f"Bearer {token}"}
