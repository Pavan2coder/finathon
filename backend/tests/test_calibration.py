"""
Tests for the calibration engine — the core differentiator of the platform.

Covers:
  - Severity determination
  - Expected rating range calculation
  - Evidence vs rating deviation logic
  - High evidence + low rating → HIGH alert
  - Moderate evidence + high rating → HIGH alert
  - Aligned evidence + rating → no alert
  - Manager pattern detection (z-score outlier)
  - CalibrationAlert model creation
"""
import pytest
from app.analytics.calibration_analysis import (
    determine_alert_severity,
    calculate_expected_rating_range,
    analyze_evidence_vs_rating,
    calculate_manager_statistics,
    calculate_organization_average,
    calculate_manager_z_score,
    detect_manager_outliers,
    generate_calibration_alerts,
    get_calibration_summary,
)
from app.models import AlertSeverity, AlertStatus
from tests.conftest import (
    make_employee, make_manager, make_hr_admin, make_review,
    make_goal, make_project, make_deliverable, make_feedback,
    make_emp_skill, make_training, make_calibration_alert, make_skill,
)


# ── Severity thresholds ───────────────────────────────────────────────────────

class TestDetermineAlertSeverity:
    def test_high_positive_deviation(self):
        assert determine_alert_severity(30.0) == AlertSeverity.HIGH

    def test_high_negative_deviation(self):
        assert determine_alert_severity(-28.0) == AlertSeverity.HIGH

    def test_medium_positive_deviation(self):
        assert determine_alert_severity(20.0) == AlertSeverity.MEDIUM

    def test_medium_negative_deviation(self):
        assert determine_alert_severity(-17.0) == AlertSeverity.MEDIUM

    def test_low_deviation(self):
        assert determine_alert_severity(10.0) == AlertSeverity.LOW

    def test_exactly_at_high_threshold(self):
        assert determine_alert_severity(25.0) == AlertSeverity.HIGH

    def test_just_below_high_threshold(self):
        assert determine_alert_severity(24.9) == AlertSeverity.MEDIUM

    def test_exactly_at_medium_threshold(self):
        assert determine_alert_severity(15.0) == AlertSeverity.MEDIUM

    def test_just_below_medium_threshold(self):
        assert determine_alert_severity(14.9) == AlertSeverity.LOW

    def test_zero_deviation(self):
        assert determine_alert_severity(0.0) == AlertSeverity.LOW


# ── Expected rating range ─────────────────────────────────────────────────────

class TestCalculateExpectedRatingRange:
    def test_high_evidence_maps_to_high_rating(self):
        lo, hi = calculate_expected_rating_range(90.0)
        assert lo >= 4.0
        assert hi <= 5.0

    def test_low_evidence_maps_to_low_rating(self):
        lo, hi = calculate_expected_rating_range(20.0)
        assert hi <= 2.5

    def test_mid_evidence_maps_to_mid_rating(self):
        lo, hi = calculate_expected_rating_range(50.0)
        assert 2.5 <= lo <= 3.5
        assert 3.0 <= hi <= 4.0

    def test_range_bounded_1_to_5(self):
        lo, hi = calculate_expected_rating_range(100.0)
        assert lo >= 1.0
        assert hi <= 5.0
        lo2, hi2 = calculate_expected_rating_range(0.0)
        assert lo2 >= 1.0
        assert hi2 <= 5.0

    def test_min_less_than_max(self):
        for ev in [0, 25, 50, 75, 100]:
            lo, hi = calculate_expected_rating_range(float(ev))
            assert lo < hi


# ── Core calibration scenarios ────────────────────────────────────────────────

class TestScenario1HighEvidenceLowRating:
    """Scenario 1: Evidence ~90, Rating 3.1 → HIGH alert expected."""

    def test_deviation_is_large_positive(self):
        evidence = 90.0
        rating = 3.1
        normalized_rating = ((rating - 1.0) / 4.0) * 100  # = 52.5
        deviation = evidence - normalized_rating
        assert deviation > 25.0

    def test_severity_is_high(self):
        evidence = 90.0
        rating = 3.1
        normalized = ((rating - 1.0) / 4.0) * 100
        deviation = evidence - normalized
        assert determine_alert_severity(deviation) == AlertSeverity.HIGH

    def test_analyze_returns_alert_data(self, db):
        mgr = make_manager(db)
        emp = make_employee(db, code="EMP001", manager_id=mgr.id)
        review = make_review(db, emp.id, mgr.id, rating=3.1, evidence=90.0)

        result = analyze_evidence_vs_rating(db, emp.id, review.id, 90.0, 3.1)
        assert result is not None
        assert result["severity"] == AlertSeverity.HIGH
        assert result["deviation"] > 25.0
        assert result["manager_id"] == mgr.id

    def test_expected_range_above_actual_rating(self, db):
        mgr = make_manager(db)
        emp = make_employee(db, code="EMP001", manager_id=mgr.id)
        review = make_review(db, emp.id, mgr.id, rating=3.1, evidence=90.0)

        result = analyze_evidence_vs_rating(db, emp.id, review.id, 90.0, 3.1)
        assert result["expected_rating_min"] > 3.1


class TestScenario2ModerateEvidenceHighRating:
    """Scenario 2: Evidence ~70, Rating 4.9 → alert expected (inflated)."""

    def test_deviation_is_large_negative(self):
        evidence = 70.0
        rating = 4.9
        normalized = ((rating - 1.0) / 4.0) * 100  # = 97.5
        deviation = evidence - normalized
        assert deviation < -15.0

    def test_severity_is_at_least_medium(self):
        evidence = 70.0
        rating = 4.9
        normalized = ((rating - 1.0) / 4.0) * 100
        deviation = evidence - normalized
        sev = determine_alert_severity(deviation)
        assert sev in (AlertSeverity.HIGH, AlertSeverity.MEDIUM)

    def test_analyze_returns_alert_data(self, db):
        mgr = make_manager(db)
        emp = make_employee(db, code="EMP001", manager_id=mgr.id)
        review = make_review(db, emp.id, mgr.id, rating=4.9, evidence=70.0)

        result = analyze_evidence_vs_rating(db, emp.id, review.id, 70.0, 4.9)
        assert result is not None
        assert result["deviation"] < -15.0


class TestScenario3AlignedEvidenceAndRating:
    """Scenario 3: Evidence ~83, Rating ~4.2 → no alert (aligned)."""

    def test_deviation_below_threshold(self):
        evidence = 83.0
        # Rating 4.2 normalised = ((4.2-1)/4)*100 = 80
        rating = 4.2
        normalized = ((rating - 1.0) / 4.0) * 100
        deviation = evidence - normalized
        assert abs(deviation) < 15.0

    def test_analyze_returns_none(self, db):
        mgr = make_manager(db)
        emp = make_employee(db, code="EMP001", manager_id=mgr.id)
        # Carefully aligned: evidence 83, rating 4.2 → deviation ~3
        review = make_review(db, emp.id, mgr.id, rating=4.2, evidence=83.0)

        result = analyze_evidence_vs_rating(db, emp.id, review.id, 83.0, 4.2)
        assert result is None


# ── Manager statistics ────────────────────────────────────────────────────────

class TestManagerStatistics:
    def test_empty_manager_returns_zeros(self, db):
        mgr = make_manager(db)
        stats = calculate_manager_statistics(db, mgr.id)
        assert stats["total_reviews"] == 0
        assert stats["average_rating"] == 0.0

    def test_single_review(self, db):
        mgr = make_manager(db)
        emp = make_employee(db)
        make_review(db, emp.id, mgr.id, rating=4.0)

        stats = calculate_manager_statistics(db, mgr.id)
        assert stats["total_reviews"] == 1
        assert stats["average_rating"] == 4.0

    def test_multiple_reviews_average(self, db):
        mgr = make_manager(db)
        for i, rating in enumerate([3.0, 4.0, 5.0]):
            emp = make_employee(db, code=f"E{i}")
            make_review(db, emp.id, mgr.id, rating=rating)

        stats = calculate_manager_statistics(db, mgr.id)
        assert stats["total_reviews"] == 3
        assert abs(stats["average_rating"] - 4.0) < 0.01

    def test_high_ratings_percentage(self, db):
        mgr = make_manager(db)
        for i, rating in enumerate([4.5, 4.8, 4.9, 2.0]):
            emp = make_employee(db, code=f"E{i}")
            make_review(db, emp.id, mgr.id, rating=rating)

        stats = calculate_manager_statistics(db, mgr.id)
        assert stats["high_ratings_percentage"] == 75.0  # 3/4

    def test_rating_distribution_counts(self, db):
        mgr = make_manager(db)
        for i, rating in enumerate([1.5, 2.5, 3.5, 4.5, 5.0]):
            emp = make_employee(db, code=f"E{i}")
            make_review(db, emp.id, mgr.id, rating=rating)

        stats = calculate_manager_statistics(db, mgr.id)
        dist = stats["rating_distribution"]
        assert dist["1"] == 1
        assert dist["2"] == 1
        assert dist["3"] == 1
        assert dist["4"] == 1
        assert dist["5"] == 1


class TestZScoreCalculation:
    def test_z_score_zero_when_at_mean(self):
        z = calculate_manager_z_score({"average_rating": 3.5}, 3.5, 0.5)
        assert z == 0.0

    def test_positive_z_score_above_mean(self):
        z = calculate_manager_z_score({"average_rating": 4.5}, 3.5, 0.5)
        assert z == 2.0

    def test_negative_z_score_below_mean(self):
        z = calculate_manager_z_score({"average_rating": 2.5}, 3.5, 0.5)
        assert z == -2.0

    def test_zero_std_dev_returns_zero(self):
        z = calculate_manager_z_score({"average_rating": 4.0}, 3.5, 0.0)
        assert z == 0.0


# ── Org average ───────────────────────────────────────────────────────────────

class TestOrgAverage:
    def test_empty_db_returns_default(self, db):
        avg = calculate_organization_average(db)
        assert avg == 3.0

    def test_correct_average(self, db):
        mgr = make_manager(db)
        for i, rating in enumerate([3.0, 4.0, 5.0]):
            emp = make_employee(db, code=f"E{i}")
            make_review(db, emp.id, mgr.id, rating=rating)

        avg = calculate_organization_average(db)
        assert abs(avg - 4.0) < 0.01


# ── Full alert generation pipeline ───────────────────────────────────────────

class TestGenerateCalibrationAlerts:
    def test_high_evidence_low_rating_creates_alert(self, db):
        mgr = make_manager(db)
        emp = make_employee(db)
        review = make_review(db, emp.id, mgr.id, rating=3.1, evidence=90.0)

        alerts = generate_calibration_alerts(db, "2026-H1")
        assert len(alerts) >= 1
        high_alerts = [a for a in alerts if a.severity == AlertSeverity.HIGH]
        assert len(high_alerts) >= 1

    def test_aligned_review_creates_no_alert(self, db):
        mgr = make_manager(db)
        emp = make_employee(db)
        # evidence 80, rating 4.2: deviation = 80 - 80 = 0
        make_review(db, emp.id, mgr.id, rating=4.2, evidence=80.0)

        alerts = generate_calibration_alerts(db, "2026-H1")
        assert len(alerts) == 0

    def test_no_duplicate_alerts_on_rerun(self, db):
        mgr = make_manager(db)
        emp = make_employee(db)
        review = make_review(db, emp.id, mgr.id, rating=3.1, evidence=90.0)

        # First generation
        alerts1 = generate_calibration_alerts(db, "2026-H1")
        for a in alerts1:
            db.add(a)
        db.commit()

        # Second generation on same data should produce no new alerts
        alerts2 = generate_calibration_alerts(db, "2026-H1")
        assert len(alerts2) == 0


# ── Summary ───────────────────────────────────────────────────────────────────

class TestCalibrationSummary:
    def test_summary_counts(self, db):
        mgr = make_manager(db)
        emp = make_employee(db)
        review = make_review(db, emp.id, mgr.id)

        make_calibration_alert(db, emp.id, mgr.id, review.id, severity=AlertSeverity.HIGH)
        make_calibration_alert(db, emp.id, mgr.id, review.id, severity=AlertSeverity.MEDIUM, status=AlertStatus.UNDER_REVIEW)

        summary = get_calibration_summary(db)
        assert summary["total_alerts"] == 2
        assert summary["high_severity"] == 1
        assert summary["medium_severity"] == 1
        assert summary["open_alerts"] == 1
        assert summary["under_review"] == 1
