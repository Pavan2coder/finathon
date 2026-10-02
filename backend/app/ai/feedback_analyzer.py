"""
AI-powered feedback analysis service.
"""
from typing import Dict, List
from app.ai.llm_client import llm_client


def analyze_feedback(feedback_text: str) -> Dict:
    """
    Analyze feedback text using AI to extract structured insights.
    
    Args:
        feedback_text: Raw feedback text
        
    Returns:
        Dictionary with analysis results
    """
    prompt = f"""Analyze the following performance feedback and extract structured information.

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
"""
    
    try:
        result = llm_client.generate_structured_response(prompt)
        
        # Validate required fields
        if not isinstance(result, dict) or "fallback" in result:
            return get_fallback_analysis(feedback_text)
        
        # Ensure required fields exist
        required_fields = ["summary", "skills", "themes", "sentiment", "evidence_strength"]
        for field in required_fields:
            if field not in result:
                return get_fallback_analysis(feedback_text)
        
        return result
        
    except Exception as e:
        print(f"Feedback analysis error: {e}")
        return get_fallback_analysis(feedback_text)


def get_fallback_analysis(feedback_text: str) -> Dict:
    """
    Provide fallback analysis when AI fails.
    
    Args:
        feedback_text: Raw feedback text
        
    Returns:
        Basic analysis
    """
    # Simple heuristic-based analysis
    text_lower = feedback_text.lower()
    
    # Determine sentiment
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
        "evidence_strength": 0.5
    }


def analyze_multiple_feedbacks(feedbacks: List[str]) -> Dict:
    """
    Analyze multiple feedback entries and provide aggregate insights.
    
    Args:
        feedbacks: List of feedback texts
        
    Returns:
        Aggregate analysis
    """
    if not feedbacks:
        return {
            "overall_sentiment": "neutral",
            "common_themes": [],
            "key_skills": [],
            "summary": "No feedback available"
        }
    
    # Analyze each feedback
    analyses = [analyze_feedback(f) for f in feedbacks]
    
    # Aggregate results
    sentiments = [a["sentiment"] for a in analyses]
    sentiment_counts = {
        "positive": sentiments.count("positive"),
        "neutral": sentiments.count("neutral"),
        "negative": sentiments.count("negative")
    }
    overall_sentiment = max(sentiment_counts, key=sentiment_counts.get)
    
    # Collect all themes
    all_themes = []
    for a in analyses:
        all_themes.extend(a.get("themes", []))
    
    # Count theme frequency
    theme_counts = {}
    for theme in all_themes:
        theme_counts[theme] = theme_counts.get(theme, 0) + 1
    
    common_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    common_themes = [t[0] for t in common_themes]
    
    # Collect all skills
    all_skills = []
    for a in analyses:
        all_skills.extend(a.get("skills", []))
    
    # Aggregate by skill name
    skill_aggregates = {}
    for skill in all_skills:
        name = skill["name"]
        if name in skill_aggregates:
            skill_aggregates[name]["count"] += 1
            skill_aggregates[name]["total_confidence"] += skill["confidence"]
        else:
            skill_aggregates[name] = {
                "count": 1,
                "total_confidence": skill["confidence"]
            }
    
    key_skills = [
        {
            "name": name,
            "mentions": data["count"],
            "avg_confidence": data["total_confidence"] / data["count"]
        }
        for name, data in skill_aggregates.items()
    ]
    key_skills.sort(key=lambda x: x["mentions"], reverse=True)
    
    return {
        "overall_sentiment": overall_sentiment,
        "common_themes": common_themes,
        "key_skills": key_skills[:10],
        "total_feedbacks": len(feedbacks)
    }
