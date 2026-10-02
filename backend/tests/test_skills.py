"""
Tests for skill gap analysis and assessment.
"""
import pytest
from fastapi import HTTPException
from tests.conftest import make_employee, make_manager, make_skill, make_emp_skill, auth_header
from app.services.skill_service import calculate_skill_gaps, assess_employee_skill, get_employee_skills
from app.models import Role, RoleSkill


class TestSkillGapAnalysis:
    def _setup_role_with_skills(self, db):
        role = Role(name="Senior Engineer", description="Senior", level=3)
        db.add(role)
        db.flush()

        python = make_skill(db, name="PyTest_Python")
        design = make_skill(db, name="PyTest_Design")

        db.add(RoleSkill(role_id=role.id, skill_id=python.id, required_level=4.0, importance="HIGH"))
        db.add(RoleSkill(role_id=role.id, skill_id=design.id, required_level=3.5, importance="CRITICAL"))
        db.flush()
        return role, python, design

    def test_gap_with_no_skills(self, db):
        role, python, design = self._setup_role_with_skills(db)
        emp = make_employee(db)
        result = calculate_skill_gaps(db, emp.id, role.id)
        gaps = result["skill_gaps"]
        assert all(g["current_level"] == 0.0 for g in gaps)
        assert all(g["gap"] > 0 for g in gaps)

    def test_gap_fully_met(self, db):
        role, python, design = self._setup_role_with_skills(db)
        emp = make_employee(db)
        make_emp_skill(db, emp.id, python.id, level=4.5)
        make_emp_skill(db, emp.id, design.id, level=4.0)
        result = calculate_skill_gaps(db, emp.id, role.id)
        assert result["total_gaps"] == 0

    def test_partial_gap(self, db):
        role, python, design = self._setup_role_with_skills(db)
        emp = make_employee(db)
        make_emp_skill(db, emp.id, python.id, level=4.0)  # met
        make_emp_skill(db, emp.id, design.id, level=2.0)  # gap of 1.5
        result = calculate_skill_gaps(db, emp.id, role.id)
        assert result["total_gaps"] == 1
        gap_item = next(g for g in result["skill_gaps"] if g["skill_id"] == design.id)
        assert abs(gap_item["gap"] - 1.5) < 0.01

    def test_sorted_by_gap_descending(self, db):
        role, python, design = self._setup_role_with_skills(db)
        emp = make_employee(db)
        make_emp_skill(db, emp.id, python.id, level=1.0)  # gap 3.0
        make_emp_skill(db, emp.id, design.id, level=3.0)  # gap 0.5
        result = calculate_skill_gaps(db, emp.id, role.id)
        gaps = result["skill_gaps"]
        assert gaps[0]["gap"] >= gaps[1]["gap"]

    def test_employee_not_found_raises(self, db):
        role = Role(name="X", description="X", level=1)
        db.add(role)
        db.flush()
        with pytest.raises(HTTPException) as exc:
            calculate_skill_gaps(db, "nonexistent", role.id)
        assert exc.value.status_code == 404

    def test_role_not_found_raises(self, db):
        emp = make_employee(db)
        with pytest.raises(HTTPException) as exc:
            calculate_skill_gaps(db, emp.id, "nonexistent-role")
        assert exc.value.status_code == 404


class TestSkillAssessment:
    def test_create_new_assessment(self, db):
        hr = make_employee(db, code="HR1", role="HR_ADMIN")
        emp = make_employee(db, code="E1", email="e1@co.com")
        skill = make_skill(db)
        record = assess_employee_skill(db, emp.id, skill.id, 3.5, 5, hr.id)
        assert record.current_level == 3.5
        assert record.evidence_count == 5

    def test_update_existing_assessment(self, db):
        hr = make_employee(db, code="HR1", role="HR_ADMIN")
        emp = make_employee(db, code="E1", email="e1@co.com")
        skill = make_skill(db)
        make_emp_skill(db, emp.id, skill.id, level=2.0)
        record = assess_employee_skill(db, emp.id, skill.id, 4.0, 8, hr.id)
        assert record.current_level == 4.0

    def test_invalid_level_raises(self, db):
        hr = make_employee(db, code="HR1", role="HR_ADMIN")
        emp = make_employee(db, code="E1", email="e1@co.com")
        skill = make_skill(db)
        with pytest.raises(HTTPException) as exc:
            assess_employee_skill(db, emp.id, skill.id, 6.0, 1, hr.id)
        assert exc.value.status_code == 400

    def test_creates_audit_log(self, db):
        from app.models import AuditLog
        hr = make_employee(db, code="HR1", role="HR_ADMIN")
        emp = make_employee(db, code="E1", email="e1@co.com")
        skill = make_skill(db)
        assess_employee_skill(db, emp.id, skill.id, 3.0, 3, hr.id)
        audit = db.query(AuditLog).filter(AuditLog.action == "ASSESS_SKILL").first()
        assert audit is not None


class TestGetEmployeeSkills:
    def test_returns_empty_list(self, db):
        emp = make_employee(db)
        result = get_employee_skills(db, emp.id)
        assert result == []

    def test_returns_skills_with_names(self, db):
        emp = make_employee(db)
        skill = make_skill(db, name="JavaScript")
        make_emp_skill(db, emp.id, skill.id, level=3.2)
        result = get_employee_skills(db, emp.id)
        assert len(result) == 1
        assert result[0]["skill_name"] == "JavaScript"
        assert result[0]["current_level"] == 3.2
