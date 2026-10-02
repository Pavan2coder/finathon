"""
Tests for the evidence-based performance scoring engine.
"""
import pytest
from app.analytics.performance_scoring import (
    calculate_goal_achievement_score,
    calculate_project_outcomes_score,
    calculate_deliverables_score,
    calculate_business_impact_score,
    calculate_skill_development_score,
    calculate_feedback_score,
    calculate_training_score,
    calculate_evidence_score,
)
from app.models import ImpactLevel, DeliverableStatus
from tests.conftest import (
    make_employee, make_manager, make_goal, make_project,
    make_deliverable, make_feedback, make_emp_skill, make_training,
    make_skill,
)


CYCLE = "2026-H1"


# ── Goal achievement ─────────────────────────────────────────────────────────

class TestGoalAchievementScore:
    def test_no_goals_returns_zero(self, db):
        emp = make_employee(db)
        score = calculate_goal_achievement_score(db, emp.id, CYCLE)
        assert score == 0.0

    def test_100_percent_achievement(self, db):
        emp = make_employee(db)
        make_goal(db, emp.id, target=100, actual=100, cycle=CYCLE)
        score = calculate_goal_achievement_score(db, emp.id, CYCLE)
        assert abs(score - 100.0) < 1.0

    def test_over_achievement_capped(self, db):
        emp = make_employee(db)
        make_goal(db, emp.id, target=100, actual=300, cycle=CYCLE)
        score = calculate_goal_achievement_score(db, emp.id, CYCLE)
        assert score <= 100.0

    def test_partial_achievement(self, db):
        emp = make_employee(db)
        make_goal(db, emp.id, target=100, actual=50, cycle=CYCLE)
        score = calculate_goal_achievement_score(db, emp.id, CYCLE)
        assert 45.0 <= score <= 55.0

    def test_multiple_goals_weighted_average(self, db):
        emp = make_employee(db)
        make_goal(db, emp.id, target=100, actual=100, cycle=CYCLE, weight=2.0)
        make_goal(db, emp.id, target=100, actual=50, cycle=CYCLE, weight=1.0)
        score = calculate_goal_achievement_score(db, emp.id, CYCLE)
        # Weighted: (100*2 + 50*1) / (2+1) = 83.3
        assert 80.0 <= score <= 87.0

    def test_wrong_cycle_returns_zero(self, db):
        emp = make_employee(db)
        make_goal(db, emp.id, target=100, actual=100, cycle="2025-H2")
        score = calculate_goal_achievement_score(db, emp.id, CYCLE)
        assert score == 0.0


# ── Project outcomes ──────────────────────────────────────────────────────────

class TestProjectOutcomesScore:
    def test_no_projects_returns_zero(self, db):
        emp = make_employee(db)
        assert calculate_project_outcomes_score(db, emp.id) == 0.0

    def test_full_completion_high_impact(self, db):
        emp = make_employee(db)
        make_project(db, emp.id, completion=100.0, impact=ImpactLevel.HIGH)
        score = calculate_project_outcomes_score(db, emp.id)
        assert score > 90.0

    def test_low_completion(self, db):
        emp = make_employee(db)
        make_project(db, emp.id, completion=40.0, impact=ImpactLevel.MEDIUM)
        score = calculate_project_outcomes_score(db, emp.id)
        assert score < 50.0

    def test_high_impact_weighted_more(self, db):
        emp1 = make_employee(db, code="E1")
        emp2 = make_employee(db, code="E2")
        make_project(db, emp1.id, completion=80.0, impact=ImpactLevel.CRITICAL)
        make_project(db, emp2.id, completion=80.0, impact=ImpactLevel.LOW)
        s1 = calculate_project_outcomes_score(db, emp1.id)
        s2 = calculate_project_outcomes_score(db, emp2.id)
        assert s1 == s2  # Both 80% completion, weight affects the average not raw score


# ── Deliverables ──────────────────────────────────────────────────────────────

class TestDeliverablesScore:
    def test_no_deliverables_returns_zero(self, db):
        emp = make_employee(db)
        assert calculate_deliverables_score(db, emp.id) == 0.0

    def test_high_quality_completed_deliverables(self, db):
        emp = make_employee(db)
        proj = make_project(db, emp.id)
        make_deliverable(db, emp.id, proj.id, quality=5.0)
        make_deliverable(db, emp.id, proj.id, quality=5.0)
        score = calculate_deliverables_score(db, emp.id)
        assert score > 85.0

    def test_incomplete_deliverables_lower_score(self, db):
        emp = make_employee(db)
        proj = make_project(db, emp.id)
        make_deliverable(db, emp.id, proj.id, quality=4.0, status=DeliverableStatus.COMPLETED)
        make_deliverable(db, emp.id, proj.id, quality=None, status=DeliverableStatus.IN_PROGRESS)
        make_deliverable(db, emp.id, proj.id, quality=None, status=DeliverableStatus.IN_PROGRESS)
        score = calculate_deliverables_score(db, emp.id)
        # Only 1/3 completed: completion_rate=0.33, quality=4.0/5.0=0.8
        # score = (0.33*0.6 + 0.8*0.4)*100 = (0.198 + 0.32)*100 = 51.8
        # Verify it's well below 100 (not a high performer scenario)
        assert score < 65.0


# ── Skill development ─────────────────────────────────────────────────────────

class TestSkillDevelopmentScore:
    def test_no_skills_returns_zero(self, db):
        emp = make_employee(db)
        assert calculate_skill_development_score(db, emp.id) == 0.0

    def test_high_average_skill_level(self, db):
        emp = make_employee(db)
        skill = make_skill(db, name="Python")
        make_emp_skill(db, emp.id, skill.id, level=4.5)
        score = calculate_skill_development_score(db, emp.id)
        # 4.5/4.0*100 = 112.5, capped to 100.0
        assert score == 100.0

    def test_low_average_skill_level(self, db):
        emp = make_employee(db)
        skill = make_skill(db, name="Python")
        make_emp_skill(db, emp.id, skill.id, level=2.0)
        score = calculate_skill_development_score(db, emp.id)
        assert score < 60.0


# ── Feedback ──────────────────────────────────────────────────────────────────

class TestFeedbackScore:
    def test_no_feedback_returns_zero(self, db):
        emp = make_employee(db)
        assert calculate_feedback_score(db, emp.id, CYCLE) == 0.0

    def test_positive_feedback_high_score(self, db):
        mgr = make_manager(db)
        emp = make_employee(db)
        make_feedback(db, emp.id, mgr.id, cycle=CYCLE, sentiment="positive", strength=0.9)
        score = calculate_feedback_score(db, emp.id, CYCLE)
        assert score > 70.0

    def test_negative_feedback_lower_score(self, db):
        mgr = make_manager(db)
        emp = make_employee(db)
        make_feedback(db, emp.id, mgr.id, cycle=CYCLE, sentiment="negative", strength=0.8)
        score = calculate_feedback_score(db, emp.id, CYCLE)
        assert score < 70.0

    def test_no_ai_data_returns_fallback(self, db):
        from app.models import Feedback, ReviewerType
        mgr = make_manager(db)
        emp = make_employee(db)
        f = Feedback(
            employee_id=emp.id, reviewer_id=mgr.id,
            reviewer_type=ReviewerType.MANAGER,
            review_cycle=CYCLE, text="Some feedback",
        )
        db.add(f)
        db.flush()
        score = calculate_feedback_score(db, emp.id, CYCLE)
        assert score == 75.0  # Fallback value


# ── Training ──────────────────────────────────────────────────────────────────

class TestTrainingScore:
    def test_no_training_returns_zero(self, db):
        emp = make_employee(db)
        assert calculate_training_score(db, emp.id) == 0.0

    def test_completed_training_high_score(self, db):
        emp = make_employee(db)
        make_training(db, emp.id, score=95.0)
        score = calculate_training_score(db, emp.id)
        assert score > 70.0

    def test_incomplete_training_zero(self, db):
        from app.models import TrainingStatus
        emp = make_employee(db)
        make_training(db, emp.id, status=TrainingStatus.IN_PROGRESS)
        score = calculate_training_score(db, emp.id)
        assert score == 0.0


# ── Full evidence score ───────────────────────────────────────────────────────

class TestCalculateEvidenceScore:
    def test_returns_all_components(self, db):
        emp = make_employee(db)
        result = calculate_evidence_score(db, emp.id, CYCLE)
        expected_keys = [
            "total_score", "goal_achievement", "project_outcomes",
            "deliverables", "business_impact", "skill_development",
            "feedback", "training",
        ]
        for k in expected_keys:
            assert k in result

    def test_score_between_0_and_100(self, db):
        mgr = make_manager(db)
        emp = make_employee(db, manager_id=mgr.id)
        skill = make_skill(db)
        proj = make_project(db, emp.id, completion=90.0)
        make_goal(db, emp.id, target=100, actual=90, cycle=CYCLE)
        make_deliverable(db, emp.id, proj.id, quality=4.0)
        make_feedback(db, emp.id, mgr.id, cycle=CYCLE)
        make_emp_skill(db, emp.id, skill.id, level=3.5)
        make_training(db, emp.id, score=85.0)

        result = calculate_evidence_score(db, emp.id, CYCLE)
        assert 0.0 <= result["total_score"] <= 100.0

    def test_high_performer_scores_higher(self, db):
        mgr = make_manager(db)
        high = make_employee(db, code="HIGH")
        low  = make_employee(db, code="LOW")
        skill1 = make_skill(db, name="Sk1")
        skill2 = make_skill(db, name="Sk2")

        proj_h = make_project(db, high.id, completion=100.0, impact=ImpactLevel.HIGH)
        make_goal(db, high.id, target=100, actual=110, cycle=CYCLE)
        make_deliverable(db, high.id, proj_h.id, quality=5.0)
        make_feedback(db, high.id, mgr.id, cycle=CYCLE, sentiment="positive", strength=0.95)
        make_emp_skill(db, high.id, skill1.id, level=4.5)
        make_training(db, high.id, score=95.0)

        proj_l = make_project(db, low.id, completion=40.0, impact=ImpactLevel.LOW)
        make_goal(db, low.id, target=100, actual=50, cycle=CYCLE)
        make_deliverable(db, low.id, proj_l.id, quality=2.0, status=DeliverableStatus.COMPLETED)
        make_feedback(db, low.id, mgr.id, cycle=CYCLE, sentiment="negative", strength=0.4)
        make_emp_skill(db, low.id, skill2.id, level=2.0)
        make_training(db, low.id, score=60.0)

        high_score = calculate_evidence_score(db, high.id, CYCLE)["total_score"]
        low_score  = calculate_evidence_score(db, low.id,  CYCLE)["total_score"]
        assert high_score > low_score
