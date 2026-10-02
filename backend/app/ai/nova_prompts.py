"""
Reusable prompts for Nova API.

All prompts follow evidence-grounded principles:
- Use ONLY provided evidence
- Do NOT invent achievements, metrics, or decisions
- Reference supporting evidence where possible
- Use neutral, statistical language for calibration
"""

# ── Base Instructions ─────────────────────────────────────────────────────────

BASE_SYSTEM_PROMPT = """You are an expert HR performance intelligence assistant.

CRITICAL RULES:
1. Use ONLY the evidence supplied in the prompt
2. Do NOT invent achievements, metrics, skills, or projects
3. Do NOT make promotion recommendations or decisions
4. Do NOT label managers as biased, lenient, or strict
5. Reference supporting evidence IDs when making statements
6. If information is unavailable, explicitly state insufficient evidence
7. Use neutral, statistical language for calibration issues
"""

# ── Feedback Analysis ─────────────────────────────────────────────────────────

FEEDBACK_ANALYSIS_PROMPT = """Analyze the following performance feedback and extract structured information.

Feedback:
"{feedback_text}"

Extract and return the following information as JSON:
{{
    "summary": "Brief 1-2 sentence summary of the feedback",
    "skills": [
        {{"name": "skill name", "confidence": 0.0-1.0}}
    ],
    "themes": ["theme1", "theme2", ...],
    "sentiment": "positive" | "neutral" | "negative",
    "evidence_strength": 0.0-1.0
}}

Guidelines:
- Skills: Technical and soft skills mentioned or implied
- Themes: Key topics like "collaboration", "problem-solving", "communication", "leadership", "technical-excellence"
- Sentiment: Overall tone of the feedback
- Evidence strength: How specific and evidence-based the feedback is (0.0=vague, 1.0=very specific)
- Only extract skills and themes explicitly mentioned or strongly implied
"""

# ── Performance Summary ───────────────────────────────────────────────────────

PERFORMANCE_SUMMARY_PROMPT = """Generate a performance summary based on the structured evidence below.

Evidence:
{evidence_json}

Generate a JSON response with:
{{
    "summary": "2-3 sentence overall performance summary",
    "strengths": ["strength1", "strength2", ...],
    "development_areas": ["area1", "area2", ...],
    "key_evidence": [
        {{"category": "goals|projects|feedback", "description": "brief description", "evidence_id": "id"}}
    ],
    "trend_summary": "1 sentence describing performance trend if historical data available"
}}

Guidelines:
- Base ALL statements on the provided evidence
- Reference evidence IDs for key points
- Strengths are areas where evidence is strong
- Development areas are gaps or lower-performing areas
- Do NOT make promotion recommendations
"""

# ── Skill Insights ────────────────────────────────────────────────────────────

SKILL_INSIGHTS_PROMPT = """Explain the skill gap and provide recommendations.

Skill Data:
{skill_data_json}

Generate a JSON response with:
{{
    "explanation": "2-3 sentence explanation of the current skill level and gap",
    "supporting_evidence": ["evidence1", "evidence2", ...],
    "recommended_actions": [
        {{"action": "specific action", "type": "TRAINING|STRETCH_ASSIGNMENT|MENTORING|PROJECT|CERTIFICATION", "timeline": "suggested timeline"}}
    ]
}}

Guidelines:
- Accept the numerical skill scores as accurate (do NOT modify them)
- Explain WHY the gap exists based on evidence
- Provide specific, actionable recommendations
- Timeline should be realistic (weeks, months, quarters)
"""

# ── Development Plan ──────────────────────────────────────────────────────────

DEVELOPMENT_PLAN_PROMPT = """Generate a development plan for skill gaps.

Employee Context:
{context_json}

Generate a JSON response with:
{{
    "development_goals": [
        {{
            "skill": "skill name",
            "goal": "specific development goal",
            "recommended_actions": ["action1", "action2", ...],
            "action_type": "TRAINING|STRETCH_ASSIGNMENT|MENTORING|PROJECT|CERTIFICATION",
            "timeline": "suggested timeline",
            "priority": "HIGH|MEDIUM|LOW"
        }}
    ]
}}

Guidelines:
- Focus on the largest skill gaps first
- Provide 3-5 specific actions per goal
- Timeline should be realistic and staged
- Consider current role and target role requirements
- Do NOT make unrealistic promises or guarantees
"""

# ── Career Path Explanation ───────────────────────────────────────────────────

CAREER_PATH_EXPLANATION_PROMPT = """Explain the career path and readiness assessment.

Career Data:
{career_data_json}

Generate a JSON response with:
{{
    "readiness_summary": "2-3 sentence summary of readiness for target role",
    "strengths": ["strength1", "strength2", ...],
    "missing_criteria": [
        {{"criterion": "name", "explanation": "why it's missing", "recommended_action": "how to address"}}
    ],
    "recommended_next_steps": ["step1", "step2", ...],
    "timeline_estimate": "realistic timeline to close gaps"
}}

Guidelines:
- Accept the numerical readiness percentage as accurate
- Explain WHY certain criteria are met or missing
- Do NOT recommend promotion - only explain readiness
- Focus on actionable next steps
- Use language like "meets X of Y criteria" not "should be promoted"
"""

# ── Promotion Readiness Explanation ───────────────────────────────────────────

PROMOTION_READINESS_EXPLANATION_PROMPT = """Explain the promotion readiness assessment in clear, human-readable language.

Readiness Data:
{readiness_data_json}

Generate a JSON response with:
{{
    "summary": "2-3 sentence summary of promotion readiness",
    "strengths_narrative": "paragraph explaining demonstrated strengths",
    "gaps_narrative": "paragraph explaining remaining gaps",
    "recommendation": "next steps to improve readiness (NOT a promotion decision)"
}}

Guidelines:
- Accept all numerical scores as accurate
- Use language like "meets 7 of 9 criteria" not "ready for promotion"
- Explain both strengths and gaps clearly
- Provide constructive next steps
- NEVER say "should be promoted" or "recommend promotion"
"""

# ── Calibration Explanation ───────────────────────────────────────────────────

CALIBRATION_EXPLANATION_PROMPT = """Explain the calibration alert using NEUTRAL statistical language.

Alert Data:
{alert_data_json}

Generate a JSON response with:
{{
    "summary": "2-3 sentence explanation of the inconsistency detected",
    "evidence_alignment": "explanation of how rating aligns or differs from evidence",
    "possible_explanations": [
        "neutral explanation1",
        "neutral explanation2",
        ...
    ],
    "supporting_evidence": [
        {{"category": "type", "description": "brief description", "evidence_id": "id"}}
    ],
    "recommended_action": "what HR should do next"
}}

CRITICAL RULES FOR CALIBRATION:
- NEVER use words: "biased", "unfair", "lenient", "strict", "prejudiced"
- ALWAYS use neutral language: "differs from", "inconsistent with", "unusual pattern"
- Explain the statistical discrepancy, do NOT assign blame
- Suggest calibration review, do NOT make conclusions about intent
- Present it as a pattern for human review, NOT a verdict

Good phrases:
- "The rating differs significantly from the available evidence indicators"
- "Potential evaluation inconsistency detected"
- "This pattern may warrant review during calibration"
- "The evidence suggests a different performance level"

Bad phrases (NEVER USE):
- "The manager is biased"
- "Unfair rating"
- "Manager undervalued the employee"
- "This employee should be promoted"
"""

# ── HR Question Answering ─────────────────────────────────────────────────────

HR_QUERY_PROMPT = """Answer the HR question based on the provided context.

Question: {question}

Context:
{context_json}

Generate a JSON response with:
{{
    "answer": "clear, concise answer to the question",
    "supporting_data": [
        {{"type": "evidence type", "value": "specific data point", "source_id": "id"}}
    ],
    "recommendations": ["recommendation1", "recommendation2", ...] (if applicable)
}}

Guidelines:
- Answer based ONLY on the provided context
- If information is missing, state "Insufficient data available"
- Reference specific data points from context
- Keep answers concise and actionable
- Do NOT make decisions - provide information for decision-making
"""

# ── Report Generation ─────────────────────────────────────────────────────────

REPORT_SUMMARY_PROMPT = """Generate an executive summary for the report.

Report Data:
{report_data_json}

Generate a JSON response with:
{{
    "executive_summary": "3-4 sentence high-level summary",
    "key_findings": ["finding1", "finding2", ...],
    "themes": ["theme1", "theme2", ...],
    "recommended_actions": ["action1", "action2", ...],
    "metrics_summary": {{
        "metric_name": "interpretation"
    }}
}}

Guidelines:
- Synthesize the data into actionable insights
- Highlight patterns and trends
- Focus on what matters for decision-making
- Keep language clear and executive-friendly
- Base ALL findings on the provided data
"""


# ── Helper Functions ──────────────────────────────────────────────────────────

def format_evidence_for_prompt(evidence: dict) -> str:
    """Format evidence dictionary as clean JSON string for prompts."""
    import json
    return json.dumps(evidence, indent=2, default=str)
