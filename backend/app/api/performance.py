"""
Performance API — evidence scoring, profiles, reviews, and trends.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user, get_current_manager
from app.models import Employee, PerformanceReview, ReviewStatus
from app.services.performance_service import (
    calculate_and_store_evidence,
    get_performance_profile,
    update_review_rating,
)
from app.schemas.performance import PerformanceReviewCreate, PerformanceReviewUpdate, PerformanceReviewResponse

router = APIRouter()


# ── Evidence / Profile ──────────────────────────────────────────────────────

@router.get("/employees/{employee_id}/evidence")
def get_evidence_score(
    employee_id: str,
    review_cycle: str = Query(..., description="e.g. 2026-H1"),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Return evidence-based score breakdown for an employee in a cycle."""
    _assert_access(current_user, employee_id, db)
    from app.analytics.performance_scoring import calculate_evidence_score
    scores = calculate_evidence_score(db, employee_id, review_cycle)
    return {
        "success": True,
        "data": {
            "employee_id": employee_id,
            "review_cycle": review_cycle,
            "evidence_score": scores["total_score"],
            "components": {k: v for k, v in scores.items() if k != "total_score"},
        },
        "message": "Evidence score calculated successfully.",
    }


@router.post("/employees/{employee_id}/calculate")
def calculate_evidence(
    employee_id: str,
    review_cycle: str = Query(...),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Re-calculate evidence score and update performance reviews. Requires MANAGER+."""
    scores = calculate_and_store_evidence(db, employee_id, review_cycle)
    return {
        "success": True,
        "data": {
            "employee_id": employee_id,
            "review_cycle": review_cycle,
            "evidence_score": scores["total_score"],
            "components": {k: v for k, v in scores.items() if k != "total_score"},
        },
        "message": "Evidence score calculated and stored.",
    }


@router.get("/employees/{employee_id}/profile")
def get_profile(
    employee_id: str,
    review_cycle: str = Query(...),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Return full performance profile with insights and evidence."""
    _assert_access(current_user, employee_id, db)
    profile = get_performance_profile(db, employee_id, review_cycle)
    return {"success": True, "data": profile, "message": "Performance profile retrieved successfully."}


@router.get("/employees/{employee_id}/trend")
def get_trend(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Return evidence and manager rating trend across all review cycles."""
    _assert_access(current_user, employee_id, db)
    reviews = (
        db.query(PerformanceReview)
        .filter(PerformanceReview.employee_id == employee_id)
        .order_by(PerformanceReview.review_cycle)
        .all()
    )
    trend = [
        {
            "cycle": r.review_cycle,
            "evidence_score": r.evidence_score,
            "manager_rating": r.manager_rating,
            "status": r.status.value,
        }
        for r in reviews
    ]
    return {"success": True, "data": trend, "message": "Performance trend retrieved."}


# ── Reviews ──────────────────────────────────────────────────────────────────

@router.get("/employees/{employee_id}/reviews")
def get_reviews(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """List all performance reviews for an employee."""
    _assert_access(current_user, employee_id, db)
    reviews = (
        db.query(PerformanceReview)
        .filter(PerformanceReview.employee_id == employee_id)
        .order_by(PerformanceReview.review_cycle.desc())
        .all()
    )
    return {
        "success": True,
        "data": [PerformanceReviewResponse.model_validate(r) for r in reviews],
    }


@router.post("/reviews", response_model=PerformanceReviewResponse, status_code=201)
def create_review(
    data: PerformanceReviewCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Create a new performance review. Requires MANAGER+."""
    review = PerformanceReview(
        employee_id=data.employee_id,
        manager_id=data.manager_id,
        review_cycle=data.review_cycle,
        manager_rating=data.manager_rating,
        manager_comments=data.manager_comments,
        status=ReviewStatus.DRAFT,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Auto-calculate evidence score
    try:
        calculate_and_store_evidence(db, data.employee_id, data.review_cycle)
    except Exception:
        pass  # Non-fatal

    return review


@router.put("/reviews/{review_id}")
def update_review(
    review_id: str,
    data: PerformanceReviewUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Update a review's rating or comments. Requires MANAGER+."""
    review = update_review_rating(
        db, review_id,
        data.manager_rating, data.manager_comments,
        current_user.id,
    )
    return {
        "success": True,
        "data": PerformanceReviewResponse.model_validate(review),
        "message": "Review updated.",
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _assert_access(current_user: Employee, employee_id: str, db: Session):
    """Raise 403 if EMPLOYEE tries to access another person's data."""
    if current_user.role.value == "EMPLOYEE" and current_user.id != employee_id:
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied."})
    if current_user.role.value == "MANAGER":
        # Managers can only see their direct reports
        target = db.query(Employee).filter(Employee.id == employee_id).first()
        if target and target.manager_id != current_user.id and target.id != current_user.id:
            raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied."})
