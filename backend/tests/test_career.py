"""
Tests for career path and promotion readiness.
"""
import pytest
from fastapi import HTTPException
from tests.conftest import (
    make_employee, make_manager, make_skill, make_emp_skill,
    make_goal, make_review, auth_header,
)
from app.models import Role, RoleSkill, CareerPath, GoalStatus
from app.services.career_service import get_career_path, calculate_promotion_readiness


def make_role(db, name, level) -> Role:
    r = Role(name=name, description=name, level=level)
    db.add(r)
    db.flush()
    return r


class TestGetCareerPath:
    def test_no_role_returns_empty(self, db):
        emp = make_employee(db)
        result = get_career_path(db, emp.id)
        assert result["current_role"] is None
        assert result["possible_next_roles"] == []

    def test_with_role_and_path(self, db):
        role_a = make_role(db, "SWE II", 2)
        role_b = make_role(db, "Sr SWE", 3)
        db.add(CareerPath(from_role_id=role_a.id, to_role_id=role_b.id, description="Promotion path"))
        db.flush()

        emp = make_employee(db, role_id=role_a.id)
        result = get_career_path(db, emp.id)
        assert result["current_role"]["name"] == "SWE II"
        assert len(result["possible_next_roles"]) == 1
        assert result["possible_next_roles"][0]["name"] == "Sr SWE"

    def test_employee_not_found(self, db):
        with pytest.raises(HTTPException) as exc:
            get_career_path(db, "nonexistent")
        assert exc.value.status_code == 404


class TestPromotionReadiness:
    def _setup(self, db):
        """Full setup: role, skills, employee, goals, reviews."""
        role_current = make_role(db, "SWE II",  2)
        role_target  = make_role(db, "Sr SWE",  3)

        python = make_skill(db, name="PR_Python")
        design = make_skill(db, name="PR_Design")
        lead   = make_skill(db, name="PR_Leadership")

        db.add(RoleSkill(role_id=role_target.id, skill_id=python.id, required_level=4.0, importance="HIGH"))
        db.add(RoleSkill(role_id=role_target.id, skill_id=design.id, required_level=4.0, importance="CRITICAL"))
        db.add(RoleSkill(role_id=role_target.id, skill_id=lead.id,   required_level=3.0, importance="HIGH"))
        db.flush()

        mgr = make_manager(db)
        emp = make_employee(db, role_id=role_current.id, manager_id=mgr.id)
        return emp, mgr, role_target, {"python": python, "design": design, "lead": lead}

    def test_returns_expected_structure(self, db):
        emp, mgr, target_role, skills = self._setup(db)
        result = calculate_promotion_readiness(db, emp.id, target_role.id)

        assert "readiness_percentage" in result
        assert "criteria_met" in result
        assert "criteria_total" in result
        assert "criteria" in result
        assert "missing_criteria" in result
        assert 0.0 <= result["readiness_percentage"] <= 100.0

    def test_all_criteria_met(self, db):
        emp, mgr, target_role, skills = self._setup(db)

        # Skills met
        make_emp_skill(db, emp.id, skills["python"].id, level=4.5)
        make_emp_skill(db, emp.id, skills["design"].id, level=4.0)
        make_emp_skill(db, emp.id, skills["lead"].id,   level=3.5)

        # Good goals
        for _ in range(5):
            make_goal(db, emp.id, target=100, actual=90, cycle="2026-H1")

        # Good reviews
        make_review(db, emp.id, mgr.id, rating=4.5, evidence=85.0)
        make_review(db, emp.id, mgr.id, rating=4.0, evidence=82.0, cycle="2025-H2")

        result = calculate_promotion_readiness(db, emp.id, target_role.id)
        assert result["readiness_percentage"] >= 60.0

    def test_no_criteria_met(self, db):
        emp, mgr, target_role, _ = self._setup(db)
        # No skills, no goals, no reviews
        result = calculate_promotion_readiness(db, emp.id, target_role.id)
        assert result["criteria_met"] < result["criteria_total"]

    def test_does_not_recommend_promotion(self, db):
        """The system must never output a promotion recommendation."""
        emp, mgr, target_role, skills = self._setup(db)
        make_emp_skill(db, emp.id, skills["python"].id, level=4.5)
        make_review(db, emp.id, mgr.id, rating=4.5, evidence=90.0)

        result = calculate_promotion_readiness(db, emp.id, target_role.id)
        result_str = str(result).lower()
        assert "should be promoted" not in result_str
        assert "recommend promotion" not in result_str
        assert "deserves promotion" not in result_str

    def test_persists_result(self, db):
        from app.models import PromotionReadiness
        emp, mgr, target_role, _ = self._setup(db)
        calculate_promotion_readiness(db, emp.id, target_role.id)
        record = db.query(PromotionReadiness).filter(
            PromotionReadiness.employee_id == emp.id,
            PromotionReadiness.target_role_id == target_role.id,
        ).first()
        assert record is not None

    def test_recalculate_updates_existing(self, db):
        from app.models import PromotionReadiness
        emp, mgr, target_role, skills = self._setup(db)

        result1 = calculate_promotion_readiness(db, emp.id, target_role.id)
        pct1 = result1["readiness_percentage"]

        # Add some qualifications
        make_emp_skill(db, emp.id, skills["python"].id, level=4.5)
        make_emp_skill(db, emp.id, skills["design"].id, level=4.0)
        make_review(db, emp.id, mgr.id, rating=4.5, evidence=85.0)
        for _ in range(5):
            make_goal(db, emp.id, target=100, actual=90, cycle="2026-H1")

        result2 = calculate_promotion_readiness(db, emp.id, target_role.id)
        pct2 = result2["readiness_percentage"]
        assert pct2 >= pct1  # More criteria met

        count = db.query(PromotionReadiness).filter(
            PromotionReadiness.employee_id == emp.id,
            PromotionReadiness.target_role_id == target_role.id,
        ).count()
        assert count == 1  # Not duplicated
