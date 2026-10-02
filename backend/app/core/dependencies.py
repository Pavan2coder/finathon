"""
FastAPI dependencies for authentication and database sessions.
"""
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.core.security import decode_access_token
from app.models.employee import Employee


from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency to provide database session.
    
    Yields:
        SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Employee:
    """
    Dependency to get the current authenticated user.
    
    Args:
        credentials: HTTP Bearer token credentials
        db: Database session
        
    Returns:
        Current authenticated employee
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    employee_id: str = payload.get("sub")
    if employee_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return employee


def get_current_hr_admin(
    current_user: Employee = Depends(get_current_user)
) -> Employee:
    """
    Dependency to ensure current user has HR_ADMIN role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user if they are HR admin
        
    Raises:
        HTTPException: If user is not HR admin
    """
    if current_user.role != "HR_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def get_current_manager(
    current_user: Employee = Depends(get_current_user)
) -> Employee:
    """
    Dependency to ensure current user has MANAGER role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user if they are manager
        
    Raises:
        HTTPException: If user is not manager
    """
    if current_user.role not in ["MANAGER", "HR_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user
