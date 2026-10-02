"""
Nova AI service — high-level business operations using Nova API.

This service provides AI-powered insights and explanations while
keeping all numerical calculations deterministic in the analytics layer.
"""
import logging
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app.ai.nova_client import nova_client
from app.ai.nova_prompts import (
    FEEDBACK_ANALYSIS_PROMPT,
    PERFORMANCE_SUMMARY_PROMPT,
    SKILL_INSIGHTS_PROMPT,
    DEVELOPMENT_PLAN_PROMPT,
    CAREER_PATH_EXPLANATION_PROMPT,
    PROMOTION_READINESS_EXPLANATION_PROMPT,
    CALIBRATION_EXPLANATION_PROMPT,
    HR_QUERY_PROMPT,
    REPORT_SUMMARY_PROMPT,
    format_evidence_for_prompt,
)
from app.ai.context_builder import (
    build_feedback_context,
    build_employee_performance_context,
    build_skill_context,
    build_career_context,
    build_calibration_context,
    build_hr_query_context,
)

logger = logging.getLogger(__name__)


# ── Feedback Analysis ─────────────────────────────────────────────────────────

async def analyze_feedback(feedback_text: str) -> Dict:
    """
    Analyze feedback text using Nova AI.
    
    Args:
        feedback_text: Raw feedback text
        
    Returns:
        Structured analysis or fallback
    """
    prompt = FEEDBACK_ANALYSIS_PROMPT.format(feedback_text=feedback_text)
    
    result = await nova_client.generate_structured_response(prompt)
    
    if result.get("fallback"):
        logger.warning(f"Nova feedback analysis failed: {result.get('error')}")
        return get_fallback_feedback_analysis(feedback_text)
    
    # Validate required fields
    required_fields = ["summary", "skills", "themes", "sentiment", "evidence_strength"]
    if not all(field in result for field in required_fields):
        logger.warning("Nova response missing required fields")
        return get_fallback_feedback_analysis(feedback_text)
    
    return result


def get_fallback_feedback_analysis(feedback_text: str) -> Dict:
    """Deterministic fallback for feedback analysis."""
    text_lower = feedback_text.lower()
    
    positive_words = ["excellent", "great", "outstanding", "strong", "impressive", "good"]
    negative_words = ["poor", "weak", "lacking", "needs improvement", "below"]
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        sentiment = "positive"
    elif negative_count > positive_count:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    return {
        "summary": feedback_text[:200] + "..." if len(feedback_text) > 200 else feedback_text,
        "skills": [],
        "themes": ["general-feedback"],
        "sentiment": sentiment,
        "evidence_strength": 0.5,
        "fallback": True
    }


# ── Performance Summary ───────────────────────────────────────────────────────

async def generate_performance_summary(db: Session, employee_id: str, review_cycle: str) -> Dict:
    """
    Generate AI-powered performance summary.
    
    Args:
        db: Database session
        employee_id: Employee ID
        review_cycle: Review cycle (e.g., "2026-H1")
        
    Returns:
        Performance summary with strengths and development areas
    """
    # Build structured evidence
    evidence = build_employee_performance_context(db, employee_id, review_cycle)
    evidence_json = format_evidence_for_prompt(evidence)
    
    prompt = PERFORMANCE_SUMMARY_PROMPT.format(evidence_json=evidence_json)
    
    result = await nova_client.generate_structured_response(prompt)
    
    if result.get("fallback"):
        logger.warning(f"Nova performance summary failed: {result.get('error')}")
        return {
            "summary": "Performance summary temporarily unavailable.",
            "strengths": [],
            "development_areas": [],
            "key_evidence": [],
            "trend_summary": "",
            "fallback": True
        }
    
    return result


# ── Skill Insights ────────────────────────────────────────────────────────────

async def generate_skill_insights(db: Session, employee_id: str, skill_id: str) -> Dict:
    """
    Generate AI insights for a specific skill gap.
    
    Args:
        db: Database session
        employee_id: Employee ID
        skill_id: Skill ID
        
    Returns:
        Skill insights with recommendations
    """
    skill_data = build_skill_context(db, employee_id, skill_id)
    skill_data_json = format_evidence_for_prompt(skill_data)
    
    prompt = SKILL_INSIGHTS_PROMPT.format(skill_data_json=skill_data_json)
    
    result = await nova_client.generate_structured_response(prompt)
    
    if result.get("fallback"):
        logger.warning(f"Nova skill insights failed: {result.get('error')}")
        return {
            "explanation": "Skill insights temporarily unavailable.",
            "supporting_evidence": [],
            "recommended_actions": [],
            "fallback": True
        }
    
    return result


# ── Development Plan ──────────────────────────────────────────────────────────

async def generate_development_plan(db: Session, employee_id: str, target_role_id: Optional[str] = None) -> Dict:
    """
    Generate AI-powered development plan.
    
    Args:
        db: Database session
        employee_id: Employee ID
        target_role_id: Optional target role ID
        
    Returns:
        Development plan with goals and actions
    """
    context = build_career_context(db, employee_id, target_role_id)
    context_json = format_evidence_for_prompt(context)
    
    prompt = DEVELOPMENT_PLAN_PROMPT.format(context_json=context_json)
    
    result = await nova_client.generate_structured_response(prompt)
    
    if result.get("fallback"):
        logger.warning(f"Nova development plan failed: {result.get('error')}")
        return {
            "development_goals": [],
            "fallback": True
        }
    
    return result


# ── Career Path Explanation ───────────────────────────────────────────────────

async def explain_career_path(db: Session, employee_id: str, target_role_id: str) -> Dict:
    """
    Generate AI explanation of career path and readiness.
    
    Args:
        db: Database session
        employee_id: Employee ID
        target_role_id: Target role ID
        
    Returns:
        Career path explanation
    """
    career_data = build_career_context(db, employee_id, target_role_id)
    career_data_json = format_evidence_for_prompt(career_data)
    
    prompt = CAREER_PATH_EXPLANATION_PROMPT.format(career_data_json=career_data_json)
    
    result = await nova_client.generate_structured_response(prompt)
    
    if result.get("fallback"):
        logger.warning(f"Nova career explanation failed: {result.get('error')}")
        return {
            "readiness_summary": "Career insights temporarily unavailable.",
            "strengths": [],
            "missing_criteria": [],
            "recommended_next_steps": [],
            "timeline_estimate": "",
            "fallback": True
        }
    
    return result


# ── Promotion Readiness Explanation ───────────────────────────────────────────

async def explain_promotion_readiness(db: Session, employee_id: str) -> Dict:
    """
    Generate human-readable promotion readiness explanation.
    
    Args:
        db: Database session
        employee_id: Employee ID
        
    Returns:
        Promotion readiness explanation
    """
    readiness_data = build_career_context(db, employee_id)
    readiness_data_json = format_evidence_for_prompt(readiness_data)
    
    prompt = PROMOTION_READINESS_EXPLANATION_PROMPT.format(readiness_data_json=readiness_data_json)
    
    result = await nova_client.generate_structured_response(prompt)
    
    if result.get("fallback"):
        logger.warning(f"Nova promotion explanation failed: {result.get('error')}")
        return {
            "summary": "Promotion readiness explanation temporarily unavailable.",
            "strengths_narrative": "",
            "gaps_narrative": "",
            "recommendation": "",
            "fallback": True
        }
    
    return result


# ── Calibration Explanation ───────────────────────────────────────────────────

async def explain_calibration_alert(db: Session, alert_id: str) -> Dict:
    """
    Generate AI explanation for a calibration alert.
    
    CRITICAL: Uses neutral statistical language only.
    
    Args:
        db: Database session
        alert_id: Calibration alert ID
        
    Returns:
        Calibration explanation
    """
    alert_data = build_calibration_context(db, alert_id)
    alert_data_json = format_evidence_for_prompt(alert_data)
    
    prompt = CALIBRATION_EXPLANATION_PROMPT.format(alert_data_json=alert_data_json)
    
    result = await nova_client.generate_structured_response(prompt)
    
    if result.get("fallback"):
        logger.warning(f"Nova calibration explanation failed: {result.get('error')}")
        return {
            "summary": "Calibration explanation temporarily unavailable.",
            "evidence_alignment": "",
            "possible_explanations": [],
            "supporting_evidence": [],
            "recommended_action": "Review during calibration session.",
            "fallback": True
        }
    
    return result


# ── HR Question Answering ─────────────────────────────────────────────────────

async def answer_hr_question(db: Session, question: str, context_ids: Optional[Dict] = None) -> Dict:
    """
    Answer an HR question using Nova AI.
    
    Args:
        db: Database session
        question: The question to answer
        context_ids: Optional dict with employee_id, alert_id, etc. for context
        
    Returns:
        Answer with supporting data
    """
    context = build_hr_query_context(db, question, context_ids)
    context_json = format_evidence_for_prompt(context)
    
    prompt = HR_QUERY_PROMPT.format(question=question, context_json=context_json)
    
    result = await nova_client.generate_structured_response(prompt)
    
    if result.get("fallback"):
        logger.warning(f"Nova HR query failed: {result.get('error')}")
        return {
            "answer": "Unable to process query at this time.",
            "supporting_data": [],
            "recommendations": [],
            "fallback": True
        }
    
    return result


# ── Report Generation ─────────────────────────────────────────────────────────

async def generate_report_summary(report_type: str, report_data: Dict) -> Dict:
    """
    Generate AI summary for a report.
    
    Args:
        report_type: Type of report (performance, calibration, skills, etc.)
        report_data: Structured report data from analytics
        
    Returns:
        Executive summary and key findings
    """
    report_data_json = format_evidence_for_prompt(report_data)
    
    prompt = REPORT_SUMMARY_PROMPT.format(report_data_json=report_data_json)
    
    result = await nova_client.generate_structured_response(prompt)
    
    if result.get("fallback"):
        logger.warning(f"Nova report summary failed: {result.get('error')}")
        return {
            "executive_summary": "Report summary temporarily unavailable.",
            "key_findings": [],
            "themes": [],
            "recommended_actions": [],
            "metrics_summary": {},
            "fallback": True
        }
    
    return result
