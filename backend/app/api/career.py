"""
Career API — career path and promotion readiness.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user, get_current_manager
from app.models import Employee
from app.services.career_service import get_career_path, calculate_promotion_readiness

router = APIRouter()


class PromotionReadinessRequest(BaseModel):
    target_role_id: str


@router.get("/employees/{employee_id}/career-path")
def career_path(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Return the employee's current role and possible next career steps."""
    _assert_access(current_user, employee_id, db)
    path = get_career_path(db, employee_id)
    return {"success": True, "data": path, "message": "Career path retrieved."}


@router.get("/employees/{employee_id}/promotion-readiness")
def get_promotion_readiness(
    employee_id: str,
    target_role_id: str = Query(..., description="Target role ID"),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Return criteria-based promotion readiness. Does NOT recommend promotion."""
    _assert_access(current_user, employee_id, db)
    result = calculate_promotion_readiness(db, employee_id, target_role_id)
    return {"success": True, "data": result, "message": "Promotion readiness calculated."}


@router.post("/employees/{employee_id}/promotion-readiness/calculate")
def recalculate_promotion_readiness(
    employee_id: str,
    data: PromotionReadinessRequest,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_manager),
):
    """Force-recalculate promotion readiness. Requires MANAGER+."""
    result = calculate_promotion_readiness(db, employee_id, data.target_role_id)
    return {"success": True, "data": result, "message": "Promotion readiness recalculated."}


def _assert_access(current_user: Employee, employee_id: str, db: Session):
    if current_user.role.value == "EMPLOYEE" and current_user.id != employee_id:
        raise HTTPException(403, detail={"code": "FORBIDDEN", "message": "Access denied."})
