"""
Tests for employee CRUD operations and service layer.
"""
import pytest
from tests.conftest import make_employee, make_manager, make_hr_admin, auth_header
from app.services.employee_service import (
    get_employee_or_404, list_employees, create_employee, update_employee,
)
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.models import EmployeeRole, EmployeeStatus
from datetime import datetime
from fastapi import HTTPException


# ── Service layer ─────────────────────────────────────────────────────────────

class TestGetEmployee:
    def test_returns_existing_employee(self, db):
        emp = make_employee(db)
        result = get_employee_or_404(db, emp.id)
        assert result.id == emp.id

    def test_raises_404_for_missing(self, db):
        with pytest.raises(HTTPException) as exc_info:
            get_employee_or_404(db, "nonexistent-id")
        assert exc_info.value.status_code == 404


class TestListEmployees:
    def test_returns_all_by_default(self, db):
        make_employee(db, code="E1", email="e1@co.com")
        make_employee(db, code="E2", email="e2@co.com")
        employees, total = list_employees(db)
        assert total == 2

    def test_search_by_name(self, db):
        make_employee(db, code="E1", name="Alice Smith", email="alice@co.com")
        make_employee(db, code="E2", name="Bob Jones",   email="bob@co.com")
        employees, total = list_employees(db, search="Alice")
        assert total == 1
        assert employees[0].name == "Alice Smith"

    def test_filter_by_department(self, db):
        make_employee(db, code="E1", email="e1@co.com", department="Engineering")
        make_employee(db, code="E2", email="e2@co.com", department="Product")
        employees, total = list_employees(db, department="Engineering")
        assert total == 1

    def test_pagination(self, db):
        for i in range(5):
            make_employee(db, code=f"E{i}", email=f"e{i}@co.com")
        employees, total = list_employees(db, page=1, page_size=3)
        assert len(employees) == 3
        assert total == 5


class TestCreateEmployee:
    def test_creates_successfully(self, db):
        data = EmployeeCreate(
            employee_code="NEW001",
            name="New Employee",
            email="new@company.com",
            password="pass123",
            department="Engineering",
            joining_date=datetime(2024, 1, 1),
        )
        emp = create_employee(db, data)
        assert emp.employee_code == "NEW001"
        assert emp.name == "New Employee"

    def test_raises_on_duplicate_email(self, db):
        make_employee(db, email="dup@co.com")
        data = EmployeeCreate(
            employee_code="NEW002",
            name="Dup",
            email="dup@co.com",
            password="pass",
            department="Eng",
            joining_date=datetime(2024, 1, 1),
        )
        with pytest.raises(HTTPException) as exc:
            create_employee(db, data)
        assert exc.value.status_code == 400

    def test_raises_on_duplicate_code(self, db):
        make_employee(db, code="SAME01")
        data = EmployeeCreate(
            employee_code="SAME01",
            name="Other",
            email="other@co.com",
            password="pass",
            department="Eng",
            joining_date=datetime(2024, 1, 1),
        )
        with pytest.raises(HTTPException):
            create_employee(db, data)


class TestUpdateEmployee:
    def test_updates_name(self, db):
        hr = make_hr_admin(db)
        emp = make_employee(db, code="E1", email="e1@co.com")
        data = EmployeeUpdate(name="Updated Name")
        updated = update_employee(db, emp.id, data, hr.id)
        assert updated.name == "Updated Name"

    def test_raises_on_email_conflict(self, db):
        hr = make_hr_admin(db)
        make_employee(db, code="E1", email="taken@co.com")
        emp2 = make_employee(db, code="E2", email="mine@co.com")
        data = EmployeeUpdate(email="taken@co.com")
        with pytest.raises(HTTPException):
            update_employee(db, emp2.id, data, hr.id)

    def test_creates_audit_log(self, db):
        from app.models import AuditLog
        hr = make_hr_admin(db)
        emp = make_employee(db, code="E1", email="e1@co.com")
        update_employee(db, emp.id, EmployeeUpdate(name="New Name"), hr.id)
        audit = db.query(AuditLog).filter(AuditLog.entity_id == emp.id).first()
        assert audit is not None
        assert audit.action == "UPDATE_EMPLOYEE"


# ── API layer ─────────────────────────────────────────────────────────────────

class TestEmployeesAPI:
    def test_get_employees_requires_auth(self, client):
        resp = client.get("/api/employees/")
        # HTTPBearer returns 403 when no Authorization header is present
        assert resp.status_code in (401, 403)

    def test_get_employees_as_hr_admin(self, client, db):
        hr = make_hr_admin(db)
        make_employee(db, code="E1", email="e1@co.com")
        resp = client.get("/api/employees/", headers=auth_header(hr))
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["pagination"]["total"] >= 1

    def test_get_single_employee(self, client, db):
        hr = make_hr_admin(db)
        emp = make_employee(db, code="E1", email="e1@co.com")
        resp = client.get(f"/api/employees/{emp.id}", headers=auth_header(hr))
        assert resp.status_code == 200

    def test_get_employee_not_found(self, client, db):
        hr = make_hr_admin(db)
        resp = client.get("/api/employees/nonexistent", headers=auth_header(hr))
        assert resp.status_code == 404

    def test_employee_cannot_access_others(self, client, db):
        emp1 = make_employee(db, code="E1", email="e1@co.com")
        emp2 = make_employee(db, code="E2", email="e2@co.com")
        resp = client.get(f"/api/employees/{emp2.id}", headers=auth_header(emp1))
        assert resp.status_code == 403
