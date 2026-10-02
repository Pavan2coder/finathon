"""
Performance scoring engine - deterministic evidence-based scoring.
"""
from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.core.config import settings
from app.models import (
    Goal, Project, Deliverable, Feedback, Training,
    BusinessImpact, EmployeeSkill, ImpactLevel, DeliverableStatus
)


def calculate_goal_achievement_score(db: Session, employee_id: str, review_cycle: str) -> float:
    """
    Calculate goal achievement score for an employee in a review cycle.
    
    Args:
        db: Database session
        employee_id: Employee ID
        review_cycle: Review cycle (e.g., "2026-H1")
        
    Returns:
        Goal achievement score (0-100)
    """
    goals = db.query(Goal).filter(
        Goal.employee_id == employee_id,
        Goal.review_cycle == review_cycle
    ).all()
    
    if not goals:
        return 0.0
    
    total_weight = sum(g.weight for g in goals)
    if total_weight == 0:
        return 0.0
    
    weighted_achievement = sum(
        (g.achievement_percentage / 100.0) * g.weight
        for g in goals
    )
    
    # Normalize to 0-100 scale
    score = (weighted_achievement / total_weight) * 100
    return min(score, 100.0)  # Cap at 100


def calculate_project_outcomes_score(db: Session, employee_id: str) -> float:
    """
    Calculate project outcomes score based on project completion and impact.
    
    Args:
        db: Database session
        employee_id: Employee ID
        
    Returns:
        Project outcomes score (0-100)
    """
    projects = db.query(Project).filter(
        Project.employee_id == employee_id
    ).all()
    
    if not projects:
        return 0.0
    
    # Weight by impact level
    impact_weights = {
        ImpactLevel.LOW: 1.0,
        ImpactLevel.MEDIUM: 1.5,
        ImpactLevel.HIGH: 2.0,
        ImpactLevel.CRITICAL: 2.5
    }
    
    total_weight = 0
    weighted_score = 0
    
    for project in projects:
        weight = impact_weights.get(project.impact_level, 1.0)
        total_weight += weight
        weighted_score += project.completion_percentage * weight
    
    if total_weight == 0:
        return 0.0
    
    return weighted_score / total_weight


def calculate_deliverables_score(db: Session, employee_id: str) -> float:
    """
    Calculate deliverables score based on completion and quality.
    
    Args:
        db: Database session
        employee_id: Employee ID
        
    Returns:
        Deliverables score (0-100)
    """
    deliverables = db.query(Deliverable).filter(
        Deliverable.employee_id == employee_id
    ).all()
    
    if not deliverables:
        return 0.0
    
    completed = [d for d in deliverables if d.status == DeliverableStatus.COMPLETED]
    
    if not completed:
        return 0.0
    
    # Completion rate
    completion_rate = len(completed) / len(deliverables)
    
    # Average quality score
    quality_scores = [d.quality_score for d in completed if d.quality_score]
    avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 3.0
    
    # Normalize quality to 0-1 (assuming 1-5 scale)
    quality_normalized = avg_quality / 5.0
    
    # Combined score
    score = (completion_rate * 0.6 + quality_normalized * 0.4) * 100
    return score


def calculate_business_impact_score(db: Session, employee_id: str) -> float:
    """
    Calculate business impact score based on measurable outcomes.
    
    Args:
        db: Database session
        employee_id: Employee ID
        
    Returns:
        Business impact score (0-100)
    """
    impacts = db.query(BusinessImpact).filter(
        BusinessImpact.employee_id == employee_id
    ).all()
    
    if not impacts:
        return 0.0
    
    impact_weights = {
        ImpactLevel.LOW: 1.0,
        ImpactLevel.MEDIUM: 1.5,
        ImpactLevel.HIGH: 2.0,
        ImpactLevel.CRITICAL: 2.5
    }
    
    total_weight = 0
    weighted_score = 0
    
    for impact in impacts:
        weight = impact_weights.get(impact.impact_level, 1.0)
        total_weight += weight
        
        # Normalize improvement percentage to 0-100 scale
        # Assume 50% improvement = excellent
        normalized_improvement = min(impact.improvement_percentage / 50.0, 1.0) * 100
        weighted_score += normalized_improvement * weight
    
    if total_weight == 0:
        return 0.0
    
    return weighted_score / total_weight


def calculate_skill_development_score(db: Session, employee_id: str) -> float:
    """
    Calculate skill development score based on skill growth.
    
    Args:
        db: Database session
        employee_id: Employee ID
        
    Returns:
        Skill development score (0-100)
    """
    skills = db.query(EmployeeSkill).filter(
        EmployeeSkill.employee_id == employee_id
    ).all()
    
    if not skills:
        return 0.0
    
    # Average skill level (1-5 scale)
    avg_level = sum(s.current_level for s in skills) / len(skills)
    
    # Normalize to 0-100 scale
    # Assuming 4.0 average = excellent
    score = (avg_level / 4.0) * 100
    return min(score, 100.0)


def calculate_feedback_score(db: Session, employee_id: str, review_cycle: str) -> float:
    """
    Calculate feedback score based on AI analysis of feedback.
    
    Args:
        db: Database session
        employee_id: Employee ID
        review_cycle: Review cycle
        
    Returns:
        Feedback score (0-100)
    """
    feedbacks = db.query(Feedback).filter(
        Feedback.employee_id == employee_id,
        Feedback.review_cycle == review_cycle
    ).all()
    
    if not feedbacks:
        return 0.0
    
    # Use AI evidence strength and sentiment
    scored_feedbacks = [
        f for f in feedbacks
        if f.ai_evidence_strength is not None and f.ai_sentiment is not None
    ]
    
    if not scored_feedbacks:
        # Fallback: assume neutral
        return 75.0
    
    sentiment_scores = {
        "positive": 90.0,
        "neutral": 75.0,
        "negative": 50.0
    }
    
    scores = []
    for f in scored_feedbacks:
        sentiment_score = sentiment_scores.get(f.ai_sentiment, 75.0)
        evidence_weight = f.ai_evidence_strength
        scores.append(sentiment_score * evidence_weight)
    
    if not scores:
        return 75.0
    
    return sum(scores) / len(scores)


def calculate_training_score(db: Session, employee_id: str) -> float:
    """
    Calculate training score based on training completion.
    
    Args:
        db: Database session
        employee_id: Employee ID
        
    Returns:
        Training score (0-100)
    """
    trainings = db.query(Training).filter(
        Training.employee_id == employee_id
    ).all()
    
    if not trainings:
        return 0.0
    
    completed = [t for t in trainings if t.status.value == "COMPLETED"]
    
    if not completed:
        return 0.0
    
    # Completion rate
    completion_rate = len(completed) / len(trainings)
    
    # Average score
    scores = [t.score for t in completed if t.score is not None]
    avg_score = sum(scores) / len(scores) if scores else 75.0
    
    # Combined (assume scores are 0-100)
    return (completion_rate * 0.5 + avg_score / 100.0 * 0.5) * 100


def calculate_evidence_score(
    db: Session,
    employee_id: str,
    review_cycle: str
) -> Dict[str, float]:
    """
    Calculate complete evidence-based performance score.
    
    Args:
        db: Database session
        employee_id: Employee ID
        review_cycle: Review cycle
        
    Returns:
        Dictionary with total score and component breakdown
    """
    # Calculate individual components
    goal_score = calculate_goal_achievement_score(db, employee_id, review_cycle)
    project_score = calculate_project_outcomes_score(db, employee_id)
    deliverable_score = calculate_deliverables_score(db, employee_id)
    impact_score = calculate_business_impact_score(db, employee_id)
    skill_score = calculate_skill_development_score(db, employee_id)
    feedback_score = calculate_feedback_score(db, employee_id, review_cycle)
    training_score = calculate_training_score(db, employee_id)
    
    # Weighted total
    total_score = (
        goal_score * settings.WEIGHT_GOAL_ACHIEVEMENT +
        project_score * settings.WEIGHT_PROJECT_OUTCOMES +
        deliverable_score * settings.WEIGHT_DELIVERABLES +
        impact_score * settings.WEIGHT_BUSINESS_IMPACT +
        skill_score * settings.WEIGHT_SKILL_DEVELOPMENT +
        feedback_score * settings.WEIGHT_FEEDBACK +
        training_score * settings.WEIGHT_TRAINING
    )
    
    return {
        "total_score": round(total_score, 2),
        "goal_achievement": round(goal_score, 2),
        "project_outcomes": round(project_score, 2),
        "deliverables": round(deliverable_score, 2),
        "business_impact": round(impact_score, 2),
        "skill_development": round(skill_score, 2),
        "feedback": round(feedback_score, 2),
        "training": round(training_score, 2)
    }
