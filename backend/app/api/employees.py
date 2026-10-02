"""
Employees API — full CRUD with search, filtering, and pagination.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user, get_current_hr_admin, get_current_manager
from app.models import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.services.employee_service import (
    list_employees, create_employee, update_employee,
    delete_employee, get_employee_or_404,
)

router = APIRouter()


@router.get("/")
def get_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    department: Optional[str] = None,
    manager_id: Optional[str] = None,
    role_id: Optional[str] = None,
    emp_status: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """
    List employees with optional search/filter/pagination.

    - HR_ADMIN: sees all employees
    - MANAGER: sees only their direct reports
    - EMPLOYEE: sees only themselves
    """
    if current_user.role.value == "EMPLOYEE":
        return {
            "success": True,
            "data": [current_user],
            "pagination": {"page": 1, "page_size": 1, "total": 1},
        }

    effective_manager_id = manager_id
    if current_user.role.value == "MANAGER":
        effective_manager_id = current_user.id

    employees, total = list_employees(
        db, page, page_size, search, department,
        effective_manager_id, role_id, emp_status,
    )
    return {
        "success": True,
        "data": [EmployeeResponse.model_validate(e) for e in employees],
        "pagination": {"page": page, "page_size": page_size, "total": total},
    }


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Get a single employee by ID."""
    # Employees can only see themselves unless manager/admin
    if current_user.role.value == "EMPLOYEE" and current_user.id != employee_id:
        from fastapi import HTTPException
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied."})
    return get_employee_or_404(db, employee_id)


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_new_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_hr_admin),
):
    """Create a new employee. Requires HR_ADMIN."""
    return create_employee(db, data)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_existing_employee(
    employee_id: str,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Update employee details. Requires MANAGER or HR_ADMIN."""
    return update_employee(db, employee_id, data, current_user.id)


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_hr_admin),
):
    """Soft-delete (deactivate) an employee. Requires HR_ADMIN."""
    delete_employee(db, employee_id, current_user.id)
