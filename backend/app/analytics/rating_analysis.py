"""
Rating analysis — statistical analysis of manager rating patterns.

This module provides tools for detecting unusual rating distributions
across managers. It uses z-scores, percentiles, and distribution
analysis to surface patterns for human review.

IMPORTANT: This module identifies statistical anomalies only.
It does NOT conclude that any manager is biased, lenient, or strict.
All findings are presented as patterns for HR to investigate.
"""
from typing import Dict, List, Tuple, Optional
import statistics
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import PerformanceReview, Employee


def get_all_manager_ratings(db: Session) -> Dict[str, List[float]]:
    """
    Build a map of manager_id → list of ratings they have given.
    """
    reviews = db.query(PerformanceReview).all()
    manager_map: Dict[str, List[float]] = {}
    for r in reviews:
        manager_map.setdefault(r.manager_id, []).append(r.manager_rating)
    return manager_map


def compute_org_stats(db: Session) -> Dict[str, float]:
    """
    Compute organisation-wide rating statistics.

    Returns:
        mean, median, std_dev, p25, p75, total_reviews
    """
    all_ratings_q = db.query(PerformanceReview.manager_rating).all()
    all_ratings = [r[0] for r in all_ratings_q]

    if not all_ratings:
        return {"mean": 0.0, "median": 0.0, "std_dev": 1.0, "p25": 0.0, "p75": 0.0, "total_reviews": 0}

    sorted_r = sorted(all_ratings)
    n = len(sorted_r)
    p25 = sorted_r[int(n * 0.25)]
    p75 = sorted_r[int(n * 0.75)]

    return {
        "mean": round(statistics.mean(all_ratings), 3),
        "median": round(statistics.median(all_ratings), 3),
        "std_dev": round(statistics.stdev(all_ratings) if n > 1 else 1.0, 3),
        "p25": round(p25, 3),
        "p75": round(p75, 3),
        "total_reviews": n,
    }


def compute_manager_stats(ratings: List[float]) -> Dict:
    """
    Compute statistics for a single manager's rating list.
    """
    if not ratings:
        return {
            "count": 0, "mean": 0.0, "median": 0.0, "std_dev": 0.0,
            "min": 0.0, "max": 0.0,
            "rating_1_count": 0, "rating_2_count": 0, "rating_3_count": 0,
            "rating_4_count": 0, "rating_5_count": 0,
            "high_pct": 0.0, "low_pct": 0.0,
        }

    n = len(ratings)
    dist = {
        "rating_1_count": sum(1 for r in ratings if 1.0 <= r < 2.0),
        "rating_2_count": sum(1 for r in ratings if 2.0 <= r < 3.0),
        "rating_3_count": sum(1 for r in ratings if 3.0 <= r < 4.0),
        "rating_4_count": sum(1 for r in ratings if 4.0 <= r < 5.0),
        "rating_5_count": sum(1 for r in ratings if r >= 5.0),
    }

    return {
        "count": n,
        "mean": round(statistics.mean(ratings), 3),
        "median": round(statistics.median(ratings), 3),
        "std_dev": round(statistics.stdev(ratings) if n > 1 else 0.0, 3),
        "min": round(min(ratings), 2),
        "max": round(max(ratings), 2),
        **dist,
        "high_pct": round(sum(1 for r in ratings if r >= 4.0) / n * 100, 1),
        "low_pct": round(sum(1 for r in ratings if r <= 2.0) / n * 100, 1),
    }


def compute_z_score(manager_mean: float, org_mean: float, org_std: float) -> float:
    """Z-score of a manager's average rating relative to org."""
    if org_std == 0:
        return 0.0
    return round((manager_mean - org_mean) / org_std, 3)


def compute_percentile_rank(manager_mean: float, all_manager_means: List[float]) -> float:
    """Percentile rank of manager's average among all managers."""
    if not all_manager_means:
        return 50.0
    below = sum(1 for m in all_manager_means if m < manager_mean)
    return round(below / len(all_manager_means) * 100, 1)


def full_manager_rating_analysis(db: Session) -> Dict:
    """
    Produce a complete rating analysis for all managers.

    Includes:
    - Per-manager statistics (mean, distribution, z-score, percentile)
    - Organisation-wide statistics
    - Flagged managers (statistical outliers — for human review only)

    Returns a structured dict safe to serialise as a JSON API response.
    """
    org_stats = compute_org_stats(db)
    manager_ratings_map = get_all_manager_ratings(db)

    if not manager_ratings_map:
        return {"org_stats": org_stats, "managers": [], "flagged_managers": []}

    # Compute per-manager stats and collect means for percentile calc
    manager_analyses = []
    all_means = []

    for manager_id, ratings in manager_ratings_map.items():
        stats = compute_manager_stats(ratings)
        all_means.append(stats["mean"])
        manager_analyses.append({"manager_id": manager_id, "stats": stats})

    # Second pass — add z-score and percentile
    flagged = []
    org_mean = org_stats["mean"]
    org_std = org_stats["std_dev"]

    final = []
    for item in manager_analyses:
        mgr = db.query(Employee).filter(Employee.id == item["manager_id"]).first()
        stats = item["stats"]
        z = compute_z_score(stats["mean"], org_mean, org_std)
        pct = compute_percentile_rank(stats["mean"], all_means)

        entry = {
            "manager_id": item["manager_id"],
            "manager_name": mgr.name if mgr else "Unknown",
            **stats,
            "z_score": z,
            "percentile_rank": pct,
        }
        final.append(entry)

        # Flag statistical outliers — NOT labelled as biased/strict/lenient
        if abs(z) >= 2.0 and stats["count"] >= 3:
            direction = "above" if z > 0 else "below"
            flagged.append({
                "manager_id": item["manager_id"],
                "manager_name": mgr.name if mgr else "Unknown",
                "z_score": z,
                "mean": stats["mean"],
                "observation": (
                    f"Manager's average rating ({stats['mean']:.2f}) is {abs(z):.2f} standard deviations "
                    f"{direction} the organisation average ({org_mean:.2f}). "
                    f"Unusual rating distribution detected — review recommended during calibration."
                ),
            })

    return {
        "org_stats": org_stats,
        "managers": final,
        "flagged_managers": flagged,
    }


def detect_rating_inflation_deflation(
    db: Session,
    threshold_z: float = 2.0,
) -> Tuple[List[str], List[str]]:
    """
    Identify manager IDs whose average is significantly above or below org average.

    Returns:
        (above_average_managers, below_average_managers) — IDs only.
        Labels are intentionally neutral — human review decides interpretation.
    """
    analysis = full_manager_rating_analysis(db)
    above, below = [], []
    for m in analysis["managers"]:
        if m["count"] < 3:
            continue
        if m["z_score"] >= threshold_z:
            above.append(m["manager_id"])
        elif m["z_score"] <= -threshold_z:
            below.append(m["manager_id"])
    return above, below
