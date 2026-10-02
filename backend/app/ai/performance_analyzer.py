"""
AI-powered performance analysis.

Uses Gemini to generate narrative summaries and insights from structured
evidence data. Numerical scores are ALWAYS deterministic — AI only
produces human-readable explanations and suggestions.
"""
from typing import Dict, List, Optional
from app.ai.llm_client import llm_client


def generate_performance_summary(
    employee_name: str,
    review_cycle: str,
    evidence_score: float,
    components: Dict[str, float],
    manager_rating: Optional[float],
    feedback_themes: List[str],
) -> Dict:
    """
    Generate a narrative performance summary using AI.

    Args:
        employee_name: Employee's full name
        review_cycle: Review cycle identifier (e.g. "2026-H1")
        evidence_score: Overall evidence-based score (0–100)
        components: Score breakdown by component
        manager_rating: Manager's rating (1–5), if available
        feedback_themes: Key themes extracted from feedback

    Returns:
        Dict with summary, strengths, areas_for_growth, and overall_assessment
    """
    components_text = "\n".join(
        f"  - {k.replace('_', ' ').title()}: {v:.1f}/100"
        for k, v in components.items()
    )

    rating_text = f"{manager_rating:.1f}/5.0" if manager_rating else "Not yet provided"
    themes_text = ", ".join(feedback_themes) if feedback_themes else "No themes extracted"

    prompt = f"""You are an HR analytics assistant. Generate a factual, evidence-based performance summary.

Employee: {employee_name}
Review Cycle: {review_cycle}
Evidence Score: {evidence_score:.1f}/100
Manager Rating: {rating_text}

Evidence Breakdown:
{components_text}

Key Feedback Themes: {themes_text}

Generate a JSON response with these exact keys:
{{
    "summary": "2-3 sentence factual summary of performance evidence",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "areas_for_growth": ["area 1", "area 2"],
    "overall_assessment": "One sentence assessment based purely on evidence indicators",
    "note": "This is an AI-generated summary based on structured evidence data. Final performance decisions rest with HR and management."
}}

Rules:
- Base everything on the evidence scores provided
- Do NOT state the employee should or should not be promoted
- Do NOT state the employee is good or bad
- Use factual, objective language
- Highlight specific evidence components that stand out
"""

    try:
        result = llm_client.generate_structured_response(prompt)
        if "fallback" in result or "error" in result:
            return _fallback_summary(employee_name, evidence_score, components)
        # Validate required keys
        required = ["summary", "strengths", "areas_for_growth", "overall_assessment"]
        if not all(k in result for k in required):
            return _fallback_summary(employee_name, evidence_score, components)
        return result
    except Exception as e:
        print(f"AI performance summary error: {e}")
        return _fallback_summary(employee_name, evidence_score, components)


def _fallback_summary(name: str, score: float, components: Dict[str, float]) -> Dict:
    """Deterministic fallback when AI is unavailable."""
    top_components = sorted(components.items(), key=lambda x: x[1], reverse=True)[:2]
    top_names = [k.replace("_", " ").title() for k, _ in top_components]

    weak_components = sorted(components.items(), key=lambda x: x[1])[:1]
    weak_names = [k.replace("_", " ").title() for k, _ in weak_components]

    return {
        "summary": (
            f"Evidence analysis for {name} shows an overall score of {score:.1f}/100. "
            f"Strongest indicators are {' and '.join(top_names)}."
        ),
        "strengths": top_names,
        "areas_for_growth": weak_names,
        "overall_assessment": f"Evidence score of {score:.1f} indicates {'above-average' if score >= 75 else 'developing'} performance.",
        "note": "AI service unavailable — this is a deterministic summary. Final decisions rest with HR and management.",
        "fallback": True,
    }


def generate_calibration_explanation(
    employee_name: str,
    evidence_score: float,
    manager_rating: float,
    deviation: float,
    reason: str,
) -> str:
    """
    Generate a plain-language explanation of a calibration alert for HR reviewers.

    Returns a short narrative — never a verdict on the manager or employee.
    """
    direction = "lower than" if deviation > 0 else "higher than"
    magnitude = "significantly" if abs(deviation) >= 25 else "moderately"

    prompt = f"""You are an HR calibration assistant. Explain this calibration alert to an HR reviewer.

Employee: {employee_name}
Evidence Score: {evidence_score:.1f}/100
Manager Rating: {manager_rating:.1f}/5.0 (equivalent to {((manager_rating - 1) / 4 * 100):.1f}/100)
Deviation: {deviation:.1f} points
System Reason: {reason}

Write 2-3 sentences explaining what this alert means and what the HR reviewer should consider.

Rules:
- Do NOT say the manager is biased, lenient, or strict
- Do NOT say the employee deserves a higher/lower rating
- Use neutral language: "the data suggests", "the rating differs from", "worth reviewing"
- Frame this as evidence for human review, not a conclusion
"""

    try:
        return llm_client.generate_text(prompt).strip()
    except Exception:
        return (
            f"The manager rating of {manager_rating:.1f} is {magnitude} {direction} what the evidence "
            f"score of {evidence_score:.1f} would suggest. A deviation of {abs(deviation):.1f} points "
            f"warrants review during the calibration session."
        )
