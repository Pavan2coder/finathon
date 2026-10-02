"""
AI API — Nova-powered insights and explanations.

All endpoints provide AI-generated insights while keeping
numerical calculations deterministic in the analytics layer.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models import Employee
from app.ai import nova_service

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class FeedbackAnalysisRequest(BaseModel):
    feedback_id: str


class PerformanceSummaryRequest(BaseModel):
    employee_id: str
    review_cycle: str


class SkillInsightsRequest(BaseModel):
    employee_id: str
    skill_id: str


class DevelopmentPlanRequest(BaseModel):
    employee_id: str
    target_role_id: Optional[str] = None


class CareerExplanationRequest(BaseModel):
    employee_id: str
    target_role_id: str


class PromotionExplanationRequest(BaseModel):
    employee_id: str


class CalibrationExplanationRequest(BaseModel):
    alert_id: str


class HRQueryRequest(BaseModel):
    question: str
    employee_id: Optional[str] = None
    alert_id: Optional[str] = None
    review_id: Optional[str] = None


class ReportSummaryRequest(BaseModel):
    report_type: str
    report_data: dict


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/ai/feedback/analyze")
async def analyze_feedback_endpoint(
    request: FeedbackAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """
    Analyze feedback using Nova AI.
    
    Extracts themes, skills, sentiment, and evidence strength.
    Falls back to deterministic analysis if Nova is unavailable.
    """
    from app.models import Feedback
    
    feedback = db.query(Feedback).filter(Feedback.id == request.feedback_id).first()
    if not feedback:
        raise HTTPException(404, detail={"code": "FEEDBACK_NOT_FOUND", "message": "Feedback not found"})
    
    # Check access
    if current_user.role.value == "EMPLOYEE" and current_user.id != feedback.employee_id:
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied"})
    
    analysis = await nova_service.analyze_feedback(feedback.text)
    
    return {
        "success": True,
        "data": {
            "feedback_id": request.feedback_id,
            "analysis": analysis
        },
        "message": "Feedback analyzed successfully"
    }


@router.post("/ai/employees/{employee_id}/performance-summary")
async def generate_performance_summary_endpoint(
    employee_id: str,
    review_cycle: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """
    Generate AI-powered performance summary.
    
    Combines all performance evidence into a narrative summary
    with strengths, development areas, and key supporting evidence.
    """
    # Check access
    if current_user.role.value == "EMPLOYEE" and current_user.id != employee_id:
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied"})
    
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(404, detail={"code": "EMPLOYEE_NOT_FOUND", "message": "Employee not found"})
    
    summary = await nova_service.generate_performance_summary(db, employee_id, review_cycle)
    
    return {
        "success": True,
        "data": {
            "employee_id": employee_id,
            "review_cycle": review_cycle,
            "summary": summary
        },
        "message": "Performance summary generated successfully"
    }


@router.post("/ai/employees/{employee_id}/skill-insights")
async def generate_skill_insights_endpoint(
    employee_id: str,
    skill_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """
    Generate AI insights for a specific skill gap.
    
    Explains the skill level, gap, and provides specific
    recommendations for improvement.
    """
    # Check access
    if current_user.role.value == "EMPLOYEE" and current_user.id != employee_id:
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied"})
    
    insights = await nova_service.generate_skill_insights(db, employee_id, skill_id)
    
    return {
        "success": True,
        "data": {
            "employee_id": employee_id,
            "skill_id": skill_id,
            "insights": insights
        },
        "message": "Skill insights generated successfully"
    }


@router.post("/ai/employees/{employee_id}/development-plan")
async def generate_development_plan_endpoint(
    employee_id: str,
    target_role_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """
    Generate AI-powered development plan.
    
    Creates a structured development plan with goals,
    actions, timelines, and priorities based on skill gaps.
    """
    # Check access
    if current_user.role.value == "EMPLOYEE" and current_user.id != employee_id:
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied"})
    
    plan = await nova_service.generate_development_plan(db, employee_id, target_role_id)
    
    return {
        "success": True,
        "data": {
            "employee_id": employee_id,
            "target_role_id": target_role_id,
            "plan": plan
        },
        "message": "Development plan generated successfully"
    }


@router.post("/ai/employees/{employee_id}/promotion-explanation")
async def explain_promotion_readiness_endpoint(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """
    Generate human-readable promotion readiness explanation.
    
    Explains strengths, gaps, and next steps in clear language.
    Does NOT make promotion recommendations.
    """
    # Check access (managers and HR can access)
    if current_user.role.value == "EMPLOYEE" and current_user.id != employee_id:
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied"})
    
    explanation = await nova_service.explain_promotion_readiness(db, employee_id)
    
    return {
        "success": True,
        "data": {
            "employee_id": employee_id,
            "explanation": explanation
        },
        "message": "Promotion readiness explained successfully"
    }


@router.post("/ai/calibration/{alert_id}/explain")
async def explain_calibration_alert_endpoint(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """
    Generate AI explanation for a calibration alert.
    
    CRITICAL: Uses neutral statistical language only.
    Explains the inconsistency detected and provides context
    for HR review without assigning blame.
    """
    # Only HR and managers can access calibration explanations
    if current_user.role.value == "EMPLOYEE":
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied"})
    
    from app.models import CalibrationAlert
    alert = db.query(CalibrationAlert).filter(CalibrationAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(404, detail={"code": "ALERT_NOT_FOUND", "message": "Calibration alert not found"})
    
    explanation = await nova_service.explain_calibration_alert(db, alert_id)
    
    return {
        "success": True,
        "data": {
            "alert_id": alert_id,
            "explanation": explanation
        },
        "message": "Calibration alert explained successfully"
    }


@router.post("/ai/hr/query")
async def answer_hr_question_endpoint(
    request: HRQueryRequest,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """
    Answer an HR question using Nova AI.
    
    Provides contextual answers based on available data.
    Useful for exploratory queries about employees,
    calibration issues, or performance patterns.
    """
    # Only HR and managers can use HR query
    if current_user.role.value == "EMPLOYEE":
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied"})
    
    context_ids = {}
    if request.employee_id:
        context_ids["employee_id"] = request.employee_id
    if request.alert_id:
        context_ids["alert_id"] = request.alert_id
    if request.review_id:
        context_ids["review_id"] = request.review_id
    
    answer = await nova_service.answer_hr_question(db, request.question, context_ids if context_ids else None)
    
    return {
        "success": True,
        "data": {
            "question": request.question,
            "answer": answer
        },
        "message": "Query answered successfully"
    }


@router.post("/ai/reports/summary")
async def generate_report_summary_endpoint(
    request: ReportSummaryRequest,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """
    Generate AI summary for a report.
    
    Creates executive summary, key findings, and
    recommendations based on structured report data.
    """
    # Only HR and managers can generate report summaries
    if current_user.role.value == "EMPLOYEE":
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied"})
    
    summary = await nova_service.generate_report_summary(request.report_type, request.report_data)
    
    return {
        "success": True,
        "data": {
            "report_type": request.report_type,
            "summary": summary
        },
        "message": "Report summary generated successfully"
    }


@router.get("/ai/status")
async def get_ai_status():
    """
    Check Nova AI availability status.
    
    Returns whether Nova API is configured and available.
    Useful for frontend to show AI feature availability.
    Public endpoint - no authentication required.
    """
    from app.ai.nova_client import nova_client
    from app.core.config import settings
    
    return {
        "success": True,
        "data": {
            "available": nova_client.is_available,
            "provider": "Nova API" if nova_client.is_available else "Fallback mode",
            "model": settings.NOVA_MODEL if nova_client.is_available else "N/A"
        }
    }
