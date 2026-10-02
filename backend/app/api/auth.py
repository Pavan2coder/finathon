"""
Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.dependencies import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.models import Employee

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    # Check if email already exists
    existing_user = db.query(Employee).filter(Employee.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if employee code already exists
    existing_code = db.query(Employee).filter(
        Employee.employee_code == user_data.employee_code
    ).first()
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee code already exists"
        )
    
    # Create new employee
    employee = Employee(
        employee_code=user_data.employee_code,
        name=user_data.name,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        department=user_data.department,
        joining_date=datetime.utcnow()
    )
    
    db.add(employee)
    db.commit()
    db.refresh(employee)
    
    return employee


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login and receive access token.
    """
    # Find user by email
    employee = db.query(Employee).filter(Employee.email == credentials.email).first()
    
    if not employee or not verify_password(credentials.password, employee.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": employee.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: Employee = Depends(get_current_user)):
    """
    Get current authenticated user information.
    """
    return current_user
