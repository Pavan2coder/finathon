"""
Career and promotion schemas.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any, Optional


class CareerPathRole(BaseModel):
    """Role information in career path."""
    id: str
    name: str
    level: int
    description: Optional[str]


class CareerPathResponse(BaseModel):
    """Schema for career path response."""
    current_role: CareerPathRole
    possible_next_roles: List[CareerPathRole]
    paths: List[Dict[str, Any]]


class PromotionCriterion(BaseModel):
    """Individual promotion criterion."""
    name: str
    met: bool
    current_value: Optional[Any] = None
    required_value: Optional[Any] = None
    details: Optional[str] = None


class PromotionReadinessResponse(BaseModel):
    """Schema for promotion readiness response."""
    id: str
    employee_id: str
    employee_name: str
    current_role: str
    target_role_id: str
    target_role_name: str
    readiness_percentage: float
    criteria_met: int
    criteria_total: int
    criteria: List[PromotionCriterion]
    missing_criteria: List[str]
    recommended_actions: List[Dict[str, Any]]
    calculated_at: datetime
    
    class Config:
        from_attributes = True


class PromotionReadinessRequest(BaseModel):
    """Request schema for calculating promotion readiness."""
    target_role_id: str
