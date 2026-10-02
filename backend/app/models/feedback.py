"""
Feedback database model.
"""
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database.database import Base


class ReviewerType(str, enum.Enum):
    """Reviewer type enumeration."""
    PEER = "PEER"
    MANAGER = "MANAGER"
    SELF = "SELF"
    STAKEHOLDER = "STAKEHOLDER"


class Feedback(Base):
    """Feedback model representing feedback given to employees."""
    
    __tablename__ = "feedback"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    reviewer_id = Column(String, ForeignKey("employees.id"), nullable=False)
    reviewer_type = Column(SQLEnum(ReviewerType), nullable=False)
    review_cycle = Column(String, nullable=False)  # e.g., "2026-H1"
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # AI Analysis Results (populated by AI service)
    ai_summary = Column(Text, nullable=True)
    ai_themes = Column(Text, nullable=True)  # JSON string of themes
    ai_skills = Column(Text, nullable=True)  # JSON string of skills mentioned
    ai_sentiment = Column(String, nullable=True)  # positive, neutral, negative
    ai_evidence_strength = Column(Float, nullable=True)  # 0.0 - 1.0
    
    # Relationships
    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="feedback_received")
    reviewer = relationship("Employee", foreign_keys=[reviewer_id], back_populates="feedback_given")
    
    def __repr__(self):
        return f"<Feedback for {self.employee_id} by {self.reviewer_type.value}>"
