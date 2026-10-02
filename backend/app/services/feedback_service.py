"""
Feedback service — CRUD and AI analysis orchestration.
"""
import json
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models import Feedback, Employee, ReviewerType


def get_employee_feedback(db: Session, employee_id: str, review_cycle: Optional[str] = None) -> List[Dict]:
    query = db.query(Feedback).filter(Feedback.employee_id == employee_id)
    if review_cycle:
        query = query.filter(Feedback.review_cycle == review_cycle)
    feedbacks = query.order_by(Feedback.created_at.desc()).all()

    result = []
    for f in feedbacks:
        reviewer = db.query(Employee).filter(Employee.id == f.reviewer_id).first()
        result.append({
            "id": f.id,
            "employee_id": f.employee_id,
            "reviewer_id": f.reviewer_id,
            "reviewer_name": reviewer.name if reviewer else "Unknown",
            "reviewer_type": f.reviewer_type.value,
            "review_cycle": f.review_cycle,
            "text": f.text,
            "created_at": f.created_at,
            "ai_summary": f.ai_summary,
            "ai_themes": json.loads(f.ai_themes) if f.ai_themes else [],
            "ai_skills": json.loads(f.ai_skills) if f.ai_skills else [],
            "ai_sentiment": f.ai_sentiment,
            "ai_evidence_strength": f.ai_evidence_strength,
        })
    return result


def create_feedback(
    db: Session,
    employee_id: str,
    reviewer_id: str,
    reviewer_type: ReviewerType,
    review_cycle: str,
    text: str,
) -> Feedback:
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(404, detail={"code": "EMPLOYEE_NOT_FOUND", "message": "Employee does not exist."})

    feedback = Feedback(
        employee_id=employee_id,
        reviewer_id=reviewer_id,
        reviewer_type=reviewer_type,
        review_cycle=review_cycle,
        text=text,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


async def run_ai_analysis(db: Session, feedback_id: str) -> Dict:
    """Run AI analysis on a feedback entry using Nova, with graceful fallback."""
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(404, detail={"code": "FEEDBACK_NOT_FOUND", "message": "Feedback does not exist."})

    # Use Nova service for AI analysis
    from app.ai.nova_service import analyze_feedback
    analysis = await analyze_feedback(feedback.text)

    # Store analysis results
    feedback.ai_summary = analysis.get("summary")
    feedback.ai_themes = json.dumps(analysis.get("themes", []))
    feedback.ai_skills = json.dumps(analysis.get("skills", []))
    feedback.ai_sentiment = analysis.get("sentiment")
    feedback.ai_evidence_strength = analysis.get("evidence_strength")

    db.commit()
    db.refresh(feedback)
    return analysis
