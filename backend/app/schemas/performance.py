"""
Performance schemas.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List, Any


class EvidenceComponent(BaseModel):
    """Individual evidence component."""
    name: str
    score: float
    weight: float
    contribution: float


class EvidenceScore(BaseModel):
    """Evidence-based performance score."""
    employee_id: str
    review_cycle: str
    evidence_score: float
    components: Dict[str, float]
    calculated_at: datetime


class PerformanceProfileRequest(BaseModel):
    """Request schema for performance profile."""
    review_cycle: str


class PerformanceInsight(BaseModel):
    """Individual performance insight with supporting evidence."""
    insight: str
    supporting_evidence: List[str]  # List of evidence IDs


class PerformanceTrend(BaseModel):
    """Performance trend data point."""
    cycle: str
    evidence_score: float
    manager_rating: Optional[float] = None


class PerformanceProfile(BaseModel):
    """Comprehensive performance profile."""
    employee_id: str
    employee_name: str
    review_cycle: str
    evidence_score: float
    evidence_components: Dict[str, float]
    manager_rating: Optional[float] = None
    goal_performance: Dict[str, Any]
    project_outcomes: List[Dict[str, Any]]
    deliverables: List[Dict[str, Any]]
    feedback_themes: List[str]
    skill_growth: Dict[str, Any]
    training_summary: Dict[str, Any]
    business_impact: List[Dict[str, Any]]
    performance_trend: List[PerformanceTrend]
    insights: List[PerformanceInsight]


class PerformanceReviewCreate(BaseModel):
    """Schema for creating a performance review."""
    employee_id: str
    manager_id: str
    review_cycle: str
    manager_rating: float
    manager_comments: Optional[str] = None


class PerformanceReviewUpdate(BaseModel):
    """Schema for updating a performance review."""
    manager_rating: Optional[float] = None
    manager_comments: Optional[str] = None
    status: Optional[str] = None


class PerformanceReviewResponse(BaseModel):
    """Schema for performance review response."""
    id: str
    employee_id: str
    manager_id: str
    review_cycle: str
    manager_rating: float
    manager_comments: Optional[str]
    evidence_score: Optional[float]
    evidence_components: Optional[Dict[str, float]]
    status: str
    calculated_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
