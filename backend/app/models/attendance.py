"""
Attendance database model.
"""
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from app.database.database import Base


class Attendance(Base):
    """Attendance model representing employee attendance records."""
    
    __tablename__ = "attendance"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    period = Column(String, nullable=False)  # e.g., "2026-01", "2026-Q1"
    working_days = Column(Integer, nullable=False)
    days_present = Column(Integer, nullable=False)
    days_absent = Column(Integer, default=0)
    leave_days = Column(Integer, default=0)
    
    # Relationships
    employee = relationship("Employee", back_populates="attendance")
    
    @property
    def attendance_percentage(self) -> float:
        """Calculate attendance percentage."""
        if self.working_days == 0:
            return 0.0
        return (self.days_present / self.working_days) * 100
    
    def __repr__(self):
        return f"<Attendance {self.employee_id} - {self.period}: {self.attendance_percentage:.1f}%>"
