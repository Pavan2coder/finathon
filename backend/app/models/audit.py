"""
Audit log database model.
"""
from sqlalchemy import Column, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database.database import Base


class AuditLog(Base):
    """Audit log model for tracking important system changes."""
    
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("employees.id"), nullable=False)
    action = Column(String, nullable=False)  # e.g., "UPDATE_RATING", "RESOLVE_ALERT", "UPDATE_PLAN"
    entity_type = Column(String, nullable=False)  # e.g., "PERFORMANCE_REVIEW", "CALIBRATION_ALERT"
    entity_id = Column(String, nullable=False)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    timestamp = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("Employee")
    
    def __repr__(self):
        return f"<AuditLog {self.action} on {self.entity_type} by {self.user_id}>"
