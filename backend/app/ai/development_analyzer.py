"""
AI-powered development plan enrichment.

Takes deterministic skill gap data and enriches plan descriptions
with specific, actionable recommendations.
"""
from typing import Dict, List, Optional
from app.ai.llm_client import llm_client


def enrich_development_plan(
    skill_name: str,
    current_level: float,
    required_level: float,
    action_type: str,
    employee_role: str,
    target_role: str,
) -> Dict:
    """
    Generate a specific, actionable development plan recommendation.

    Args:
        skill_name: Name of the skill to develop
        current_level: Current assessed level (1–5)
        required_level: Required level for target role (1–5)
        action_type: Type of action (TRAINING, STRETCH_ASSIGNMENT, etc.)
        employee_role: Current role name
        target_role: Target role name

    Returns:
        Dict with enriched recommendation details
    """
    gap = required_level - current_level

    prompt = f"""You are an HR development advisor. Create a specific development plan entry.

Skill: {skill_name}
Current Level: {current_level:.1f}/5.0
Required Level: {required_level:.1f}/5.0
Gap: {gap:.1f}
Recommended Action Type: {action_type}
Employee Current Role: {employee_role}
Target Role: {target_role}

Return JSON with these exact keys:
{{
    "title": "Short descriptive title for this development action",
    "description": "2-3 sentence specific description of what to do and why",
    "success_criteria": "How to know this action has achieved its goal",
    "resources": ["resource 1", "resource 2"],
    "estimated_duration": "e.g. '3 months', '1 quarter'"
}}

Rules:
- Be specific and actionable, not generic
- Tailor recommendations to the exact skill and gap size
- For TRAINING: suggest specific types of courses or certifications
- For STRETCH_ASSIGNMENT: suggest a type of project or responsibility
- For MENTORING: describe what kind of mentor and what to learn
"""

    try:
        result = llm_client.generate_structured_response(prompt)
        if "fallback" in result or "error" in result:
            return _fallback_plan(skill_name, current_level, required_level, action_type)
        required_keys = ["title", "description", "success_criteria"]
        if not all(k in result for k in required_keys):
            return _fallback_plan(skill_name, current_level, required_level, action_type)
        return result
    except Exception as e:
        print(f"AI development plan error: {e}")
        return _fallback_plan(skill_name, current_level, required_level, action_type)


def _fallback_plan(
    skill_name: str,
    current_level: float,
    required_level: float,
    action_type: str,
) -> Dict:
    """Deterministic fallback development plan."""
    action_descriptions = {
        "TRAINING": f"Complete structured training in {skill_name} to progress from level {current_level:.1f} to {required_level:.1f}.",
        "STRETCH_ASSIGNMENT": f"Take on a project with significant {skill_name} requirements to build practical experience.",
        "MENTORING": f"Work with a senior colleague to develop {skill_name} through guided practice and feedback.",
        "PROJECT": f"Lead or significantly contribute to a project requiring advanced {skill_name} skills.",
        "CERTIFICATION": f"Obtain a recognized certification in {skill_name} to validate and formalize skills.",
    }

    return {
        "title": f"Develop {skill_name} — {action_type.replace('_', ' ').title()}",
        "description": action_descriptions.get(action_type, f"Develop {skill_name} through {action_type}."),
        "success_criteria": f"Achieve level {required_level:.1f} in {skill_name} as assessed in next review.",
        "resources": [f"{skill_name} resources", "Team lead guidance"],
        "estimated_duration": "3-6 months",
        "fallback": True,
    }


def generate_batch_recommendations(skill_gaps: List[Dict], employee_role: str, target_role: str) -> List[Dict]:
    """
    Generate enriched recommendations for a list of skill gaps.
    Used when auto-generating development plans for a target role.
    """
    results = []
    for gap in skill_gaps:
        if gap["gap"] <= 0:
            continue

        # Pick action type based on gap size
        if gap["gap"] >= 2.0:
            action_type = "TRAINING"
        elif gap["gap"] >= 1.0:
            action_type = "STRETCH_ASSIGNMENT"
        else:
            action_type = "MENTORING"

        enriched = enrich_development_plan(
            skill_name=gap["skill_name"],
            current_level=gap["current_level"],
            required_level=gap["required_level"],
            action_type=action_type,
            employee_role=employee_role,
            target_role=target_role,
        )
        results.append({
            "skill_id": gap["skill_id"],
            "skill_name": gap["skill_name"],
            "gap": gap["gap"],
            "action_type": action_type,
            "recommendation": enriched,
        })

    return results
