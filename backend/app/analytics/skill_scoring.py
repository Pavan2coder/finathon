"""
Skill scoring analytics — evidence-backed skill level calculation.

Combines project outcomes, deliverable quality, feedback mentions,
training completion, and manual assessments to derive a composite
skill level for each employee.
"""
from typing import Dict, List
from sqlalchemy.orm import Session
import json

from app.models import (
    EmployeeSkill, Skill, Feedback, Training, Deliverable,
    Project, ImpactLevel, DeliverableStatus,
)


# Weights for each evidence source when computing composite skill level
_SOURCE_WEIGHTS = {
    "manual_assessment": 0.40,   # Explicitly assessed by manager
    "feedback_mentions":  0.25,   # Skills mentioned in AI-analysed feedback
    "deliverable_quality": 0.20,  # Quality scores on completed deliverables
    "training":           0.15,   # Completed training in skill category
}


def compute_skill_evidence(
    db: Session,
    employee_id: str,
    skill_id: str,
) -> Dict:
    """
    Compute evidence-backed skill level for a single skill.

    Returns:
        {
            "skill_id": ...,
            "current_level": float,      # Composite 1–5
            "required_level": float,     # From role, if available
            "gap": float,
            "evidence_count": int,
            "evidence_breakdown": { source: contribution }
        }
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        return {}

    scores: Dict[str, float] = {}
    evidence_count = 0

    # ── 1. Manual assessment ────────────────────────────────────────────────
    manual = db.query(EmployeeSkill).filter(
        EmployeeSkill.employee_id == employee_id,
        EmployeeSkill.skill_id == skill_id,
    ).first()
    if manual:
        scores["manual_assessment"] = manual.current_level
        evidence_count += manual.evidence_count

    # ── 2. Feedback mentions ────────────────────────────────────────────────
    feedbacks = db.query(Feedback).filter(
        Feedback.employee_id == employee_id,
        Feedback.ai_skills.isnot(None),
    ).all()

    skill_confidences = []
    for f in feedbacks:
        try:
            ai_skills = json.loads(f.ai_skills)
            for s in ai_skills:
                if isinstance(s, dict) and skill.name.lower() in s.get("name", "").lower():
                    skill_confidences.append(float(s.get("confidence", 0.5)))
                    evidence_count += 1
        except Exception:
            pass

    if skill_confidences:
        # Map average confidence (0–1) to a skill level (1–5)
        avg_conf = sum(skill_confidences) / len(skill_confidences)
        scores["feedback_mentions"] = 1.0 + avg_conf * 4.0

    # ── 3. Deliverable quality ───────────────────────────────────────────────
    deliverables = db.query(Deliverable).filter(
        Deliverable.employee_id == employee_id,
        Deliverable.status == DeliverableStatus.COMPLETED,
        Deliverable.quality_score.isnot(None),
    ).all()
    if deliverables:
        avg_quality = sum(d.quality_score for d in deliverables) / len(deliverables)
        scores["deliverable_quality"] = avg_quality  # already 1–5
        evidence_count += len(deliverables)

    # ── 4. Training ─────────────────────────────────────────────────────────
    trainings = db.query(Training).filter(
        Training.employee_id == employee_id,
        Training.status.in_(["COMPLETED"]),
        Training.category.ilike(f"%{skill.category}%"),
    ).all()
    if trainings:
        scored = [t for t in trainings if t.score is not None]
        if scored:
            avg_score = sum(t.score for t in scored) / len(scored)
            # Training scores 0–100 → 1–5
            scores["training"] = 1.0 + (avg_score / 100.0) * 4.0
        else:
            # Completion without score → mid level
            scores["training"] = 3.0
        evidence_count += len(trainings)

    if not scores:
        return {
            "skill_id": skill_id,
            "skill_name": skill.name,
            "current_level": 0.0,
            "evidence_count": 0,
            "evidence_breakdown": {},
        }

    # ── Weighted composite ───────────────────────────────────────────────────
    total_weight = 0.0
    weighted_sum = 0.0
    for source, level in scores.items():
        w = _SOURCE_WEIGHTS.get(source, 0.10)
        weighted_sum += level * w
        total_weight += w

    composite = weighted_sum / total_weight if total_weight > 0 else 0.0
    composite = max(1.0, min(5.0, composite))

    return {
        "skill_id": skill_id,
        "skill_name": skill.name,
        "current_level": round(composite, 2),
        "evidence_count": evidence_count,
        "evidence_breakdown": {k: round(v, 2) for k, v in scores.items()},
    }


def compute_all_skill_evidence(db: Session, employee_id: str) -> List[Dict]:
    """
    Compute evidence-backed skill levels for all skills the employee has any record for.
    """
    skill_ids = {
        es.skill_id
        for es in db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee_id).all()
    }
    return [compute_skill_evidence(db, employee_id, sid) for sid in skill_ids]


def refresh_employee_skill_levels(db: Session, employee_id: str) -> int:
    """
    Recompute and persist composite skill levels for all employee skills.
    Returns number of skills updated.
    """
    results = compute_all_skill_evidence(db, employee_id)
    updated = 0
    for r in results:
        if not r or r["current_level"] == 0.0:
            continue
        record = db.query(EmployeeSkill).filter(
            EmployeeSkill.employee_id == employee_id,
            EmployeeSkill.skill_id == r["skill_id"],
        ).first()
        if record:
            record.current_level = r["current_level"]
            record.evidence_count = r["evidence_count"]
            updated += 1
    db.commit()
    return updated
