"""
Tests for manager rating analysis and statistical outlier detection.
"""
import pytest
from app.analytics.rating_analysis import (
    compute_org_stats,
    compute_manager_stats,
    compute_z_score,
    compute_percentile_rank,
    full_manager_rating_analysis,
    detect_rating_inflation_deflation,
)
from tests.conftest import make_employee, make_manager, make_review


class TestOrgStats:
    def test_empty_returns_defaults(self, db):
        stats = compute_org_stats(db)
        assert stats["mean"] == 0.0
        assert stats["total_reviews"] == 0

    def test_correct_stats(self, db):
        mgr = make_manager(db)
        for i, r in enumerate([3.0, 4.0, 5.0]):
            emp = make_employee(db, code=f"E{i}")
            make_review(db, emp.id, mgr.id, rating=r)

        stats = compute_org_stats(db)
        assert abs(stats["mean"] - 4.0) < 0.01
        assert stats["total_reviews"] == 3


class TestManagerStats:
    def test_empty_returns_zeros(self):
        stats = compute_manager_stats([])
        assert stats["count"] == 0

    def test_correct_mean(self):
        stats = compute_manager_stats([3.0, 4.0, 5.0])
        assert abs(stats["mean"] - 4.0) < 0.01

    def test_correct_distribution(self):
        ratings = [1.5, 2.5, 3.5, 4.5, 5.0]
        stats = compute_manager_stats(ratings)
        assert stats["rating_1_count"] == 1
        assert stats["rating_5_count"] == 1
        assert stats["high_pct"] == 40.0  # 2/5

    def test_std_dev_single_rating(self):
        stats = compute_manager_stats([4.0])
        assert stats["std_dev"] == 0.0


class TestZScore:
    def test_at_mean_is_zero(self):
        assert compute_z_score(3.5, 3.5, 0.5) == 0.0

    def test_two_std_devs_above(self):
        assert compute_z_score(4.5, 3.5, 0.5) == 2.0

    def test_two_std_devs_below(self):
        assert compute_z_score(2.5, 3.5, 0.5) == -2.0

    def test_zero_std_dev_safe(self):
        assert compute_z_score(4.0, 3.5, 0.0) == 0.0


class TestPercentileRank:
    def test_at_median(self):
        means = [2.0, 3.0, 4.0, 5.0]
        rank = compute_percentile_rank(3.5, means)
        assert rank == 50.0

    def test_top(self):
        means = [2.0, 3.0, 4.0]
        rank = compute_percentile_rank(5.0, means)
        assert rank == 100.0

    def test_bottom(self):
        means = [3.0, 4.0, 5.0]
        rank = compute_percentile_rank(1.0, means)
        assert rank == 0.0


class TestFullAnalysis:
    def test_returns_structure(self, db):
        result = full_manager_rating_analysis(db)
        assert "org_stats" in result
        assert "managers" in result
        assert "flagged_managers" in result

    def test_lenient_manager_flagged(self, db):
        """Manager giving all 5.0s while org avg is ~1.5 should be flagged."""
        mgr_strict1 = make_manager(db)
        mgr_strict2 = make_manager(db)
        mgr_lenient = make_manager(db)

        # Create extreme spread: many reviews at 1.0, then one manager at 5.0
        # This creates large std_dev and ensures z-score > 2.0
        for _ in range(25):
            emp = make_employee(db)
            make_review(db, emp.id, mgr_strict1.id, rating=1.0)
        for _ in range(25):
            emp = make_employee(db)
            make_review(db, emp.id, mgr_strict2.id, rating=1.0)
        # Outlier manager: 5 reviews all at 5.0 (smaller count to increase std_dev impact)
        for _ in range(5):
            emp = make_employee(db)
            make_review(db, emp.id, mgr_lenient.id, rating=5.0)

        result = full_manager_rating_analysis(db)
        flagged_ids = [f["manager_id"] for f in result["flagged_managers"]]
        assert mgr_lenient.id in flagged_ids

    def test_strict_manager_flagged(self, db):
        """Manager giving all 1.0s while org avg is ~4.5 should be flagged."""
        mgr_high1 = make_manager(db)
        mgr_high2 = make_manager(db)
        mgr_strict  = make_manager(db)

        # Create extreme spread: many reviews at 5.0, then one manager at 1.0
        for _ in range(25):
            emp = make_employee(db)
            make_review(db, emp.id, mgr_high1.id, rating=5.0)
        for _ in range(25):
            emp = make_employee(db)
            make_review(db, emp.id, mgr_high2.id, rating=5.0)
        # Outlier manager: 5 reviews all at 1.0
        for _ in range(5):
            emp = make_employee(db)
            make_review(db, emp.id, mgr_strict.id, rating=1.0)

        result = full_manager_rating_analysis(db)
        flagged_ids = [f["manager_id"] for f in result["flagged_managers"]]
        assert mgr_strict.id in flagged_ids

    def test_calibrated_manager_not_flagged(self, db):
        """Manager with average ratings should not be flagged."""
        mgr1 = make_manager(db)
        mgr2 = make_manager(db)
        for _ in range(5):
            emp = make_employee(db)
            make_review(db, emp.id, mgr1.id, rating=3.5)
        for _ in range(5):
            emp = make_employee(db)
            make_review(db, emp.id, mgr2.id, rating=3.5)

        result = full_manager_rating_analysis(db)
        flagged_ids = [f["manager_id"] for f in result["flagged_managers"]]
        assert mgr1.id not in flagged_ids
        assert mgr2.id not in flagged_ids

    def test_flagged_message_uses_neutral_language(self, db):
        """Flagged entries must NOT use terms like 'biased', 'lenient', or 'strict'."""
        mgr_low1 = make_manager(db)
        mgr_low2 = make_manager(db)
        mgr_outlier = make_manager(db)
        
        # Create scenario similar to test_lenient_manager_flagged
        for _ in range(25):
            emp = make_employee(db)
            make_review(db, emp.id, mgr_low1.id, rating=1.0)
        for _ in range(25):
            emp = make_employee(db)
            make_review(db, emp.id, mgr_low2.id, rating=1.0)
        for _ in range(5):
            emp = make_employee(db)
            make_review(db, emp.id, mgr_outlier.id, rating=5.0)

        result = full_manager_rating_analysis(db)
        for flagged in result["flagged_managers"]:
            obs = flagged["observation"].lower()
            assert "bias" not in obs
            assert "biased" not in obs
            assert "lenient" not in obs
            assert "strict" not in obs


class TestDetectInflationDeflation:
    def test_returns_two_lists(self, db):
        above, below = detect_rating_inflation_deflation(db)
        assert isinstance(above, list)
        assert isinstance(below, list)

    def test_empty_db(self, db):
        above, below = detect_rating_inflation_deflation(db)
        assert above == []
        assert below == []
