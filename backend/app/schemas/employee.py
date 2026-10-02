"""
Employee schemas.
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.employee import EmployeeRole, EmployeeStatus


class EmployeeBase(BaseModel):
    """Base employee schema."""
    employee_code: str
    name: str
    email: EmailStr
    department: str
    role: EmployeeRole = EmployeeRole.EMPLOYEE
    role_id: Optional[str] = None
    manager_id: Optional[str] = None
    status: EmployeeStatus = EmployeeStatus.ACTIVE


class EmployeeCreate(EmployeeBase):
    """Schema for creating an employee."""
    password: str
    joining_date: datetime


class EmployeeUpdate(BaseModel):
    """Schema for updating an employee."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    role: Optional[EmployeeRole] = None
    role_id: Optional[str] = None
    manager_id: Optional[str] = None
    status: Optional[EmployeeStatus] = None


class EmployeeResponse(EmployeeBase):
    """Schema for employee response."""
    id: str
    joining_date: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    """Schema for paginated employee list."""
    employees: list[EmployeeResponse]
    total: int
    page: int
    page_size: int
