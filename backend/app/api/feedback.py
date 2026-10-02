"""
Feedback API — CRUD and AI analysis.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models import Employee, ReviewerType
from app.services.feedback_service import (
    get_employee_feedback, create_feedback, run_ai_analysis,
)

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class FeedbackCreate(BaseModel):
    employee_id: str
    reviewer_type: ReviewerType
    review_cycle: str
    text: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/employees/{employee_id}/feedback")
def get_feedback(
    employee_id: str,
    review_cycle: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Get all feedback for an employee."""
    _assert_access(current_user, employee_id, db)
    data = get_employee_feedback(db, employee_id, review_cycle)
    return {"success": True, "data": data}


@router.post("/employees/{employee_id}/feedback", status_code=status.HTTP_201_CREATED)
def submit_feedback(
    employee_id: str,
    data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Submit feedback for an employee. Any authenticated user can give feedback."""
    feedback = create_feedback(
        db,
        employee_id=employee_id,
        reviewer_id=current_user.id,
        reviewer_type=data.reviewer_type,
        review_cycle=data.review_cycle,
        text=data.text,
    )
    return {
        "success": True,
        "data": {"id": feedback.id, "employee_id": feedback.employee_id, "created_at": feedback.created_at},
        "message": "Feedback submitted.",
    }


@router.post("/feedback/{feedback_id}/analyze")
async def analyze_feedback(
    feedback_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """
    Run AI analysis on a specific feedback entry.
    
    Extracts themes, skills, sentiment, and evidence strength via Nova.
    Falls back to deterministic analysis if AI is unavailable.
    """
    analysis = await run_ai_analysis(db, feedback_id)
    return {
        "success": True,
        "data": {"feedback_id": feedback_id, "analysis": analysis},
        "message": "Feedback analyzed.",
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _assert_access(current_user: Employee, employee_id: str, db: Session):
    if current_user.role.value == "EMPLOYEE" and current_user.id != employee_id:
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied."})
