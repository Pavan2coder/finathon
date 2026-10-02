"""
Skill schemas.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class SkillResponse(BaseModel):
    """Schema for skill response."""
    id: str
    name: str
    category: str
    description: Optional[str]
    
    class Config:
        from_attributes = True


class EmployeeSkillResponse(BaseModel):
    """Schema for employee skill response."""
    id: str
    skill_id: str
    skill_name: str
    skill_category: str
    current_level: float
    last_assessed: datetime
    evidence_count: int
    
    class Config:
        from_attributes = True


class SkillGap(BaseModel):
    """Schema for skill gap analysis."""
    skill_id: str
    skill_name: str
    current_level: float
    required_level: float
    gap: float
    importance: str
    evidence_count: int


class SkillGapResponse(BaseModel):
    """Schema for skill gap response."""
    employee_id: str
    target_role_id: str
    target_role_name: str
    skill_gaps: List[SkillGap]
    total_gaps: int
    average_gap: float
