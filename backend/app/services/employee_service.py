"""
Employee service — business logic for employee operations.
"""
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models import Employee, EmployeeStatus
from app.core.security import get_password_hash
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


def get_employee_or_404(db: Session, employee_id: str) -> Employee:
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "EMPLOYEE_NOT_FOUND", "message": "Employee does not exist."},
        )
    return emp


def list_employees(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    department: Optional[str] = None,
    manager_id: Optional[str] = None,
    role_id: Optional[str] = None,
    status: Optional[str] = None,
):
    query = db.query(Employee)

    if search:
        query = query.filter(
            or_(
                Employee.name.ilike(f"%{search}%"),
                Employee.email.ilike(f"%{search}%"),
                Employee.employee_code.ilike(f"%{search}%"),
            )
        )
    if department:
        query = query.filter(Employee.department == department)
    if manager_id:
        query = query.filter(Employee.manager_id == manager_id)
    if role_id:
        query = query.filter(Employee.role_id == role_id)
    if status:
        query = query.filter(Employee.status == status)

    total = query.count()
    employees = query.offset((page - 1) * page_size).limit(page_size).all()
    return employees, total


def create_employee(db: Session, data: EmployeeCreate) -> Employee:
    if db.query(Employee).filter(Employee.email == data.email).first():
        raise HTTPException(400, detail={"code": "EMAIL_EXISTS", "message": "Email already registered."})
    if db.query(Employee).filter(Employee.employee_code == data.employee_code).first():
        raise HTTPException(400, detail={"code": "CODE_EXISTS", "message": "Employee code already exists."})

    emp = Employee(
        employee_code=data.employee_code,
        name=data.name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=data.role,
        role_id=data.role_id,
        department=data.department,
        manager_id=data.manager_id,
        joining_date=data.joining_date,
        status=data.status,
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp


def update_employee(db: Session, employee_id: str, data: EmployeeUpdate, actor_id: str) -> Employee:
    emp = get_employee_or_404(db, employee_id)
    update_data = data.model_dump(exclude_unset=True)

    if "email" in update_data:
        conflict = db.query(Employee).filter(
            Employee.email == update_data["email"], Employee.id != employee_id
        ).first()
        if conflict:
            raise HTTPException(400, detail={"code": "EMAIL_EXISTS", "message": "Email already in use."})

    old_values = {k: getattr(emp, k) for k in update_data}
    for k, v in update_data.items():
        setattr(emp, k, v)

    db.commit()
    db.refresh(emp)

    # Audit log
    from app.models import AuditLog
    audit = AuditLog(
        user_id=actor_id,
        action="UPDATE_EMPLOYEE",
        entity_type="EMPLOYEE",
        entity_id=employee_id,
        old_value={k: str(v) for k, v in old_values.items()},
        new_value={k: str(v) for k, v in update_data.items()},
    )
    db.add(audit)
    db.commit()
    return emp


def delete_employee(db: Session, employee_id: str, actor_id: str) -> None:
    emp = get_employee_or_404(db, employee_id)
    emp.status = EmployeeStatus.INACTIVE
    db.commit()

    from app.models import AuditLog
    audit = AuditLog(
        user_id=actor_id,
        action="DEACTIVATE_EMPLOYEE",
        entity_type="EMPLOYEE",
        entity_id=employee_id,
        old_value={"status": "ACTIVE"},
        new_value={"status": "INACTIVE"},
    )
    db.add(audit)
    db.commit()
