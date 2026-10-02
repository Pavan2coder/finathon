"""
Authentication schemas.
"""
from pydantic import BaseModel, EmailStr
from app.models.employee import EmployeeRole


class UserRegister(BaseModel):
    """Schema for user registration."""
    employee_code: str
    name: str
    email: EmailStr
    password: str
    role: EmployeeRole = EmployeeRole.EMPLOYEE
    department: str


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded token data."""
    employee_id: str | None = None


class UserResponse(BaseModel):
    """Schema for user response."""
    id: str
    employee_code: str
    name: str
    email: str
    role: EmployeeRole
    department: str
    
    class Config:
        from_attributes = True
