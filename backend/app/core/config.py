"""
Application configuration using Pydantic settings.
"""
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "HRM Performance Intelligence Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./hrm_dev.db"

    # Security
    SECRET_KEY: str = "change-me-in-production-use-32-chars-min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # AI - Nova API (OpenAI-compatible)
    NOVA_API_KEY: str = ""
    NOVA_BASE_URL: str = "https://nova-lite-beta.us-east-1.aws.ai.meta.com/v1"
    NOVA_MODEL: str = "us.meta.llama3-2-90b-instruct-v1:0"
    NOVA_TIMEOUT: int = 60
    
    # Legacy Gemini support (fallback for migration)
    GEMINI_API_KEY: str = "dummy-key"

    # CORS — stored as a list; accepts comma-separated string from env
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://localhost:3000"]

    # Performance Scoring Weights (must sum to 1.0)
    WEIGHT_GOAL_ACHIEVEMENT:  float = 0.25
    WEIGHT_PROJECT_OUTCOMES:  float = 0.20
    WEIGHT_DELIVERABLES:      float = 0.15
    WEIGHT_BUSINESS_IMPACT:   float = 0.15
    WEIGHT_SKILL_DEVELOPMENT: float = 0.10
    WEIGHT_FEEDBACK:          float = 0.10
    WEIGHT_TRAINING:          float = 0.05

    # Calibration thresholds
    CALIBRATION_THRESHOLD_HIGH:   float = 25.0
    CALIBRATION_THRESHOLD_MEDIUM: float = 15.0

    # Manager outlier detection
    MANAGER_RATING_OUTLIER_SIGMA: float = 2.0

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
