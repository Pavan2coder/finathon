"""
Context builder for Nova AI prompts.

Collects relevant structured data from the database before calling Nova.
Keeps prompts clean and focused while limiting token usage.
"""
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models import (
    Employee, Goal, Project, Deliverable, Feedback,
    EmployeeSkill, Training, PerformanceReview,
    CalibrationAlert, Role, Skill, RoleSkill,
    PromotionReadiness, CareerPath
)

# Limits for context size
MAX_FEEDBACK_ITEMS = 20
MAX_PROJECTS = 20
MAX_GOALS = 20
MAX_DELIVERABLES = 20


def build_feedback_context(db: Session, feedback_id: str) -> Dict:
    """Build context for a single feedback item."""
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    
    if not feedback:
        return {"error": "Feedback not found"}
    
    employee = db.query(Employee).filter(Employee.id == feedback.employee_id).first()
    reviewer = db.query(Employee).filter(Employee.id == feedback.reviewer_id).first()
    
    return {
        "feedback_id": feedback.id,
        "employee_name": employee.name if employee else "Unknown",
        "employee_role": employee.role.value if employee and employee.role else "Unknown",
        "reviewer_name": reviewer.name if reviewer else "Unknown",
        "reviewer_type": feedback.reviewer_type.value,
        "review_cycle": feedback.review_cycle,
        "text": feedback.text,
        "created_at": str(feedback.created_at)
    }


def build_employee_performance_context(db: Session, employee_id: str, review_cycle: str) -> Dict:
    """Build comprehensive performance context for an employee."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    if not employee:
        return {"error": "Employee not found"}
    
    # Get performance review
    review = db.query(PerformanceReview).filter(
        PerformanceReview.employee_id == employee_id,
        PerformanceReview.review_cycle == review_cycle
    ).first()
    
    # Get goals
    goals = db.query(Goal).filter(
        Goal.employee_id == employee_id,
        Goal.review_cycle == review_cycle
    ).limit(MAX_GOALS).all()
    
    # Get projects
    projects = db.query(Project).filter(
        Project.employee_id == employee_id
    ).order_by(desc(Project.end_date)).limit(MAX_PROJECTS).all()
    
    # Get deliverables
    deliverables = db.query(Deliverable).filter(
        Deliverable.employee_id == employee_id
    ).order_by(desc(Deliverable.completed_at)).limit(MAX_DELIVERABLES).all()
    
    # Get feedback
    feedbacks = db.query(Feedback).filter(
        Feedback.employee_id == employee_id,
        Feedback.review_cycle == review_cycle
    ).limit(MAX_FEEDBACK_ITEMS).all()
    
    # Get skills
    skills = db.query(EmployeeSkill).filter(
        EmployeeSkill.employee_id == employee_id
    ).all()
    
    # Get training
    training = db.query(Training).filter(
        Training.employee_id == employee_id
    ).all()
    
    context = {
        "employee": {
            "id": employee.id,
            "name": employee.name,
            "code": employee.employee_code,
            "role": employee.role.value if employee.role else None,
            "department": employee.department
        },
        "review_cycle": review_cycle,
        "performance_review": {
            "evidence_score": review.evidence_score if review else None,
            "manager_rating": review.manager_rating if review else None,
            "evidence_components": review.evidence_components if review else {}
        } if review else None,
        "goals": [
            {
                "id": g.id,
                "title": g.title,
                "target_value": g.target_value,
                "actual_value": g.actual_value,
                "achievement_pct": (g.actual_value / g.target_value * 100) if g.target_value else 0,
                "status": g.status.value
            }
            for g in goals
        ],
        "projects": [
            {
                "id": p.id,
                "name": p.name,
                "role": p.role,
                "completion": p.completion_percentage,
                "impact_level": p.impact_level.value if p.impact_level else None,
                "outcome": p.outcome
            }
            for p in projects
        ],
        "deliverables": [
            {
                "id": d.id,
                "title": d.title,
                "quality_score": d.quality_score,
                "status": d.status.value
            }
            for d in deliverables
        ],
        "feedback": [
            {
                "id": f.id,
                "reviewer_type": f.reviewer_type.value,
                "sentiment": f.ai_sentiment,
                "evidence_strength": f.ai_evidence_strength,
                "text_excerpt": f.text[:200]
            }
            for f in feedbacks
        ],
        "skills": [
            {
                "name": db.query(Skill).filter(Skill.id == s.skill_id).first().name if s.skill_id else "Unknown",
                "current_level": s.current_level,
                "evidence_count": s.evidence_count
            }
            for s in skills
        ],
        "training": [
            {
                "name": t.name,
                "status": t.status.value,
                "score": t.score
            }
            for t in training
        ]
    }
    
    return context


def build_skill_context(db: Session, employee_id: str, skill_id: str) -> Dict:
    """Build context for skill gap analysis."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    if not employee:
        return {"error": "Employee not found"}
    
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    employee_skill = db.query(EmployeeSkill).filter(
        EmployeeSkill.employee_id == employee_id,
        EmployeeSkill.skill_id == skill_id
    ).first()
    
    # Get required level for current role
    role_skill = None
    if employee.role_id:
        role_skill = db.query(RoleSkill).filter(
            RoleSkill.role_id == employee.role_id,
            RoleSkill.skill_id == skill_id
        ).first()
    
    return {
        "employee": {
            "id": employee.id,
            "name": employee.name,
            "role": employee.role.value if employee.role else None
        },
        "skill": {
            "id": skill.id if skill else None,
            "name": skill.name if skill else "Unknown",
            "category": skill.category if skill else None
        },
        "current_level": employee_skill.current_level if employee_skill else 0,
        "required_level": role_skill.required_level if role_skill else 0,
        "gap": (role_skill.required_level if role_skill else 0) - (employee_skill.current_level if employee_skill else 0),
        "evidence_count": employee_skill.evidence_count if employee_skill else 0,
        "last_assessed": str(employee_skill.last_assessed) if employee_skill and employee_skill.last_assessed else None
    }


def build_career_context(db: Session, employee_id: str, target_role_id: Optional[str] = None) -> Dict:
    """Build context for career path and promotion readiness."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    if not employee:
        return {"error": "Employee not found"}
    
    # Get promotion readiness if exists
    promotion = None
    if target_role_id:
        promotion = db.query(PromotionReadiness).filter(
            PromotionReadiness.employee_id == employee_id,
            PromotionReadiness.target_role_id == target_role_id
        ).order_by(desc(PromotionReadiness.calculated_at)).first()
    
    # Get possible career paths
    career_paths = []
    if employee.role_id:
        paths = db.query(CareerPath).filter(
            CareerPath.from_role_id == employee.role_id
        ).all()
        
        for path in paths:
            target_role = db.query(Role).filter(Role.id == path.to_role_id).first()
            career_paths.append({
                "target_role_id": path.to_role_id,
                "target_role_name": target_role.name if target_role else "Unknown",
                "description": path.description
            })
    
    # Get skill gaps for target role
    skill_gaps = []
    if target_role_id:
        required_skills = db.query(RoleSkill).filter(
            RoleSkill.role_id == target_role_id
        ).all()
        
        for rs in required_skills:
            emp_skill = db.query(EmployeeSkill).filter(
                EmployeeSkill.employee_id == employee_id,
                EmployeeSkill.skill_id == rs.skill_id
            ).first()
            
            skill = db.query(Skill).filter(Skill.id == rs.skill_id).first()
            
            current_level = emp_skill.current_level if emp_skill else 0
            gap = rs.required_level - current_level
            
            if gap > 0:
                skill_gaps.append({
                    "skill_name": skill.name if skill else "Unknown",
                    "current_level": current_level,
                    "required_level": rs.required_level,
                    "gap": gap,
                    "importance": rs.importance
                })
    
    context = {
        "employee": {
            "id": employee.id,
            "name": employee.name,
            "current_role": employee.role.value if employee.role else None,
            "department": employee.department
        },
        "career_paths": career_paths,
        "promotion_readiness": {
            "target_role_id": promotion.target_role_id if promotion else None,
            "readiness_percentage": promotion.readiness_percentage if promotion else None,
            "criteria_met": promotion.criteria_met if promotion else 0,
            "criteria_total": promotion.criteria_total if promotion else 0,
            "missing_criteria": promotion.missing_criteria if promotion else []
        } if promotion else None,
        "skill_gaps": skill_gaps
    }
    
    return context


def build_calibration_context(db: Session, alert_id: str) -> Dict:
    """Build context for calibration alert explanation."""
    alert = db.query(CalibrationAlert).filter(CalibrationAlert.id == alert_id).first()
    
    if not alert:
        return {"error": "Calibration alert not found"}
    
    employee = db.query(Employee).filter(Employee.id == alert.employee_id).first()
    manager = db.query(Employee).filter(Employee.id == alert.manager_id).first()
    review = db.query(PerformanceReview).filter(PerformanceReview.id == alert.review_id).first()
    
    # Get supporting evidence
    goals = db.query(Goal).filter(
        Goal.employee_id == alert.employee_id,
        Goal.review_cycle == review.review_cycle if review else None
    ).limit(5).all()
    
    projects = db.query(Project).filter(
        Project.employee_id == alert.employee_id
    ).limit(5).all()
    
    feedbacks = db.query(Feedback).filter(
        Feedback.employee_id == alert.employee_id,
        Feedback.review_cycle == review.review_cycle if review else None
    ).limit(5).all()
    
    context = {
        "alert": {
            "id": alert.id,
            "evidence_score": alert.evidence_score,
            "manager_rating": alert.manager_rating,
            "expected_min": alert.expected_rating_min,
            "expected_max": alert.expected_rating_max,
            "deviation": alert.deviation,
            "severity": alert.severity.value,
            "status": alert.status.value
        },
        "employee": {
            "id": employee.id if employee else None,
            "name": employee.name if employee else "Unknown",
            "role": employee.role.value if employee and employee.role else None
        },
        "manager": {
            "id": manager.id if manager else None,
            "name": manager.name if manager else "Unknown"
        },
        "review_cycle": review.review_cycle if review else None,
        "supporting_evidence": {
            "goals": [
                {
                    "id": g.id,
                    "title": g.title,
                    "achievement": (g.actual_value / g.target_value * 100) if g.target_value else 0
                }
                for g in goals
            ],
            "projects": [
                {
                    "id": p.id,
                    "name": p.name,
                    "completion": p.completion_percentage,
                    "impact": p.impact_level.value if p.impact_level else None
                }
                for p in projects
            ],
            "feedback": [
                {
                    "id": f.id,
                    "reviewer_type": f.reviewer_type.value,
                    "sentiment": f.ai_sentiment
                }
                for f in feedbacks
            ]
        },
        "evidence_components": review.evidence_components if review else {}
    }
    
    return context


def build_hr_query_context(db: Session, question: str, context_ids: Optional[Dict] = None) -> Dict:
    """Build context for HR question answering."""
    context = {
        "question": question,
        "relevant_data": {}
    }
    
    if not context_ids:
        return context
    
    # Add employee context if provided
    if "employee_id" in context_ids:
        employee = db.query(Employee).filter(Employee.id == context_ids["employee_id"]).first()
        if employee:
            context["relevant_data"]["employee"] = {
                "id": employee.id,
                "name": employee.name,
                "role": employee.role.value if employee.role else None,
                "department": employee.department
            }
    
    # Add calibration alert context if provided
    if "alert_id" in context_ids:
        alert_context = build_calibration_context(db, context_ids["alert_id"])
        context["relevant_data"]["calibration_alert"] = alert_context
    
    # Add performance review context if provided
    if "review_id" in context_ids:
        review = db.query(PerformanceReview).filter(
            PerformanceReview.id == context_ids["review_id"]
        ).first()
        if review:
            context["relevant_data"]["performance_review"] = {
                "evidence_score": review.evidence_score,
                "manager_rating": review.manager_rating,
                "status": review.status.value
            }
    
    return context
