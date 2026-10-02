"""
AI-powered career path analysis.

Generates narrative guidance for career development.
Numerical readiness calculations remain deterministic in career_service.py.
"""
from typing import Dict, List, Optional
from app.ai.llm_client import llm_client


def generate_career_guidance(
    employee_name: str,
    current_role: str,
    target_role: str,
    readiness_percentage: float,
    met_criteria: List[str],
    missing_criteria: List[str],
    skill_gaps: List[Dict],
) -> Dict:
    """
    Generate AI narrative guidance for a career transition.

    Args:
        employee_name: Employee name
        current_role: Current job title
        target_role: Target job title
        readiness_percentage: Calculated readiness score
        met_criteria: List of criteria already met
        missing_criteria: List of criteria not yet met
        skill_gaps: List of skill gap dicts from skill_service

    Returns:
        Dict with narrative, recommended_focus_areas, and timeline_suggestion
    """
    met_text = "\n".join(f"  ✓ {c}" for c in met_criteria) or "  None met yet"
    missing_text = "\n".join(f"  ✗ {c}" for c in missing_criteria) or "  All criteria met"
    gaps_text = "\n".join(
        f"  - {g['skill_name']}: current {g['current_level']:.1f}, required {g['required_level']:.1f} (gap {g['gap']:.1f})"
        for g in skill_gaps[:5]
        if g["gap"] > 0
    ) or "  No significant skill gaps"

    prompt = f"""You are an HR career development advisor. Provide factual guidance based on the data below.

Employee: {employee_name}
Current Role: {current_role}
Target Role: {target_role}
Readiness: {readiness_percentage:.1f}%

Criteria Met:
{met_text}

Criteria Not Yet Met:
{missing_text}

Top Skill Gaps:
{gaps_text}

Return JSON with these exact keys:
{{
    "narrative": "2-3 sentence factual narrative about the transition pathway",
    "recommended_focus_areas": ["area 1", "area 2", "area 3"],
    "timeline_suggestion": "Realistic timeframe based on gaps (e.g. '6-12 months with focused development')",
    "key_development_actions": [
        {{"action": "description", "priority": "HIGH|MEDIUM|LOW", "skill": "skill name"}}
    ],
    "note": "This guidance is based on structured data. Career decisions are made by HR and management."
}}

Rules:
- Base everything on the data provided
- Do NOT state the employee will or won't get promoted
- Be specific about skill gaps and development actions
- Keep tone professional and encouraging but factual
"""

    try:
        result = llm_client.generate_structured_response(prompt)
        if "fallback" in result or "error" in result:
            return _fallback_guidance(target_role, readiness_percentage, missing_criteria, skill_gaps)
        required = ["narrative", "recommended_focus_areas", "key_development_actions"]
        if not all(k in result for k in required):
            return _fallback_guidance(target_role, readiness_percentage, missing_criteria, skill_gaps)
        return result
    except Exception as e:
        print(f"AI career guidance error: {e}")
        return _fallback_guidance(target_role, readiness_percentage, missing_criteria, skill_gaps)


def _fallback_guidance(
    target_role: str,
    readiness_pct: float,
    missing_criteria: List[str],
    skill_gaps: List[Dict],
) -> Dict:
    """Deterministic fallback career guidance."""
    top_gaps = [g for g in skill_gaps if g["gap"] > 0][:3]
    focus_areas = [g["skill_name"] for g in top_gaps] + missing_criteria[:2]

    return {
        "narrative": (
            f"The employee meets {readiness_pct:.1f}% of the criteria for {target_role}. "
            f"{'Focused development in key areas could close remaining gaps.' if readiness_pct < 100 else 'All tracked criteria are met.'}"
        ),
        "recommended_focus_areas": focus_areas[:3] or ["Continue current performance"],
        "timeline_suggestion": (
            "3-6 months" if readiness_pct >= 75 else
            "6-12 months" if readiness_pct >= 50 else
            "12-18 months with structured development"
        ),
        "key_development_actions": [
            {
                "action": f"Improve {g['skill_name']} from {g['current_level']:.1f} to {g['required_level']:.1f}",
                "priority": "HIGH" if g["gap"] >= 1.5 else "MEDIUM",
                "skill": g["skill_name"],
            }
            for g in top_gaps
        ],
        "note": "AI service unavailable — deterministic guidance. Career decisions rest with HR and management.",
        "fallback": True,
    }
