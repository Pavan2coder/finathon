"""
Performance service — orchestrates evidence calculation and profile assembly.
"""
from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import (
    Employee, PerformanceReview, Goal, Project, Deliverable,
    BusinessImpact, Feedback, Training, EmployeeSkill, ReviewStatus, AuditLog,
)
from app.analytics.performance_scoring import calculate_evidence_score


def get_review_or_404(db: Session, review_id: str) -> PerformanceReview:
    review = db.query(PerformanceReview).filter(PerformanceReview.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "REVIEW_NOT_FOUND", "message": "Performance review does not exist."},
        )
    return review


def calculate_and_store_evidence(db: Session, employee_id: str, review_cycle: str) -> Dict:
    """Run evidence engine and persist results against all matching reviews."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(404, detail={"code": "EMPLOYEE_NOT_FOUND", "message": "Employee does not exist."})

    scores = calculate_evidence_score(db, employee_id, review_cycle)

    # Update all matching reviews for this cycle
    reviews = db.query(PerformanceReview).filter(
        PerformanceReview.employee_id == employee_id,
        PerformanceReview.review_cycle == review_cycle,
    ).all()

    for review in reviews:
        review.evidence_score = scores["total_score"]
        review.evidence_components = {k: v for k, v in scores.items() if k != "total_score"}
        review.calculated_at = datetime.utcnow()
        if review.status == ReviewStatus.DRAFT:
            review.status = ReviewStatus.SUBMITTED

    db.commit()
    return scores


def get_performance_profile(db: Session, employee_id: str, review_cycle: str) -> Dict:
    """Assemble a full performance profile with all evidence."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(404, detail={"code": "EMPLOYEE_NOT_FOUND", "message": "Employee does not exist."})

    scores = calculate_evidence_score(db, employee_id, review_cycle)

    # Goals
    goals = db.query(Goal).filter(
        Goal.employee_id == employee_id, Goal.review_cycle == review_cycle
    ).all()
    goal_performance = {
        "total": len(goals),
        "completed": sum(1 for g in goals if g.status.value == "COMPLETED"),
        "average_achievement": (
            sum(g.achievement_percentage for g in goals) / len(goals) if goals else 0.0
        ),
        "goals": [
            {
                "id": g.id, "title": g.title,
                "target": g.target_value, "actual": g.actual_value,
                "achievement_pct": round(g.achievement_percentage, 1),
                "status": g.status.value,
            }
            for g in goals
        ],
    }

    # Projects
    projects = db.query(Project).filter(Project.employee_id == employee_id).all()
    project_outcomes = [
        {
            "id": p.id, "name": p.name, "role": p.role,
            "completion": p.completion_percentage,
            "impact_level": p.impact_level.value,
            "outcome": p.outcome,
        }
        for p in projects
    ]

    # Deliverables
    deliverables = db.query(Deliverable).filter(Deliverable.employee_id == employee_id).all()
    deliverable_data = [
        {
            "id": d.id, "title": d.title, "status": d.status.value,
            "quality_score": d.quality_score,
        }
        for d in deliverables
    ]

    # Feedback themes (from AI analysis where available)
    feedbacks = db.query(Feedback).filter(
        Feedback.employee_id == employee_id,
        Feedback.review_cycle == review_cycle,
    ).all()
    import json
    themes = []
    for f in feedbacks:
        if f.ai_themes:
            try:
                themes.extend(json.loads(f.ai_themes))
            except Exception:
                pass
    # Deduplicate
    from collections import Counter
    theme_counts = Counter(themes)
    feedback_themes = [t for t, _ in theme_counts.most_common(8)]

    # Skill growth
    emp_skills = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee_id).all()
    skill_growth = {
        "total_skills": len(emp_skills),
        "average_level": round(
            sum(s.current_level for s in emp_skills) / len(emp_skills) if emp_skills else 0.0, 2
        ),
        "skills": [
            {"skill_id": s.skill_id, "level": s.current_level, "evidence_count": s.evidence_count}
            for s in emp_skills
        ],
    }

    # Training
    training_records = db.query(Training).filter(Training.employee_id == employee_id).all()
    completed_training = [t for t in training_records if t.status.value == "COMPLETED"]
    training_summary = {
        "total": len(training_records),
        "completed": len(completed_training),
        "completion_rate": round(
            len(completed_training) / len(training_records) * 100 if training_records else 0.0, 1
        ),
        "records": [
            {"id": t.id, "name": t.name, "category": t.category, "score": t.score, "status": t.status.value}
            for t in training_records
        ],
    }

    # Business impact
    impacts = db.query(BusinessImpact).filter(BusinessImpact.employee_id == employee_id).all()
    business_impact = [
        {
            "id": bi.id, "metric_name": bi.metric_name,
            "improvement_pct": bi.improvement_percentage,
            "impact_level": bi.impact_level.value,
            "description": bi.description,
            "supporting_evidence": [bi.id, bi.project_id] if bi.project_id else [bi.id],
        }
        for bi in impacts
    ]

    # Trend (all cycles)
    all_reviews = db.query(PerformanceReview).filter(
        PerformanceReview.employee_id == employee_id
    ).order_by(PerformanceReview.review_cycle).all()
    trend = [
        {
            "cycle": r.review_cycle,
            "evidence_score": r.evidence_score,
            "manager_rating": r.manager_rating,
        }
        for r in all_reviews
        if r.evidence_score is not None
    ]

    # Current review
    current_review = db.query(PerformanceReview).filter(
        PerformanceReview.employee_id == employee_id,
        PerformanceReview.review_cycle == review_cycle,
    ).first()

    return {
        "employee_id": employee_id,
        "employee_name": emp.name,
        "department": emp.department,
        "review_cycle": review_cycle,
        "evidence_score": scores["total_score"],
        "evidence_components": {k: v for k, v in scores.items() if k != "total_score"},
        "manager_rating": current_review.manager_rating if current_review else None,
        "review_status": current_review.status.value if current_review else None,
        "goal_performance": goal_performance,
        "project_outcomes": project_outcomes,
        "deliverables": deliverable_data,
        "feedback_themes": feedback_themes,
        "skill_growth": skill_growth,
        "training_summary": training_summary,
        "business_impact": business_impact,
        "performance_trend": trend,
        "insights": _build_insights(scores, goals, projects, impacts),
    }


def _build_insights(scores: Dict, goals: list, projects: list, impacts: list) -> List[Dict]:
    """Generate human-readable insights with supporting evidence IDs."""
    insights = []

    if scores.get("goal_achievement", 0) >= 85:
        insights.append({
            "insight": "Strong goal achievement — consistently meets or exceeds targets.",
            "supporting_evidence": [g.id for g in goals if g.achievement_percentage >= 100],
        })
    elif scores.get("goal_achievement", 0) < 60:
        insights.append({
            "insight": "Goal completion below expectations — review priority alignment.",
            "supporting_evidence": [g.id for g in goals if g.achievement_percentage < 80],
        })

    high_impact = [p for p in projects if p.impact_level.value in ("HIGH", "CRITICAL")]
    if high_impact:
        insights.append({
            "insight": f"Delivered {len(high_impact)} high-impact project(s) this cycle.",
            "supporting_evidence": [p.id for p in high_impact],
        })

    if scores.get("business_impact", 0) >= 80:
        insights.append({
            "insight": "Measurable business impact demonstrated across projects.",
            "supporting_evidence": [bi.id for bi in impacts],
        })

    return insights


def update_review_rating(
    db: Session, review_id: str, new_rating: float, comments: Optional[str], actor_id: str
) -> PerformanceReview:
    review = get_review_or_404(db, review_id)
    old_rating = review.manager_rating

    review.manager_rating = new_rating
    if comments is not None:
        review.manager_comments = comments

    db.commit()
    db.refresh(review)

    # Audit
    audit = AuditLog(
        user_id=actor_id,
        action="UPDATE_RATING",
        entity_type="PERFORMANCE_REVIEW",
        entity_id=review_id,
        old_value={"manager_rating": old_rating},
        new_value={"manager_rating": new_rating},
    )
    db.add(audit)
    db.commit()
    return review
