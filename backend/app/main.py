"""
FastAPI main application.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.database import Base, engine

# Import API routers
from app.api import (
    auth, employees, performance, skills, career,
    calibration, feedback, goals, development, reports, ai
)

# Create database tables — skipped when TESTING=1 (tests supply their own engine)
import os as _os
if _os.environ.get("TESTING") != "1":
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass  # Startup proceeds; migrations handle schema in production

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered performance intelligence and calibration platform for HRM",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
# NOTE: goals, skills, performance, career, feedback, development use /api as prefix
# because their routes already include /employees/{id}/... sub-paths.
app.include_router(auth.router,        prefix="/api/auth",        tags=["Authentication"])
app.include_router(employees.router,   prefix="/api/employees",   tags=["Employees"])
app.include_router(performance.router, prefix="/api",             tags=["Performance"])
app.include_router(skills.router,      prefix="/api",             tags=["Skills"])
app.include_router(career.router,      prefix="/api",             tags=["Career"])
app.include_router(calibration.router, prefix="/api/calibration", tags=["Calibration"])
app.include_router(feedback.router,    prefix="/api",             tags=["Feedback"])
app.include_router(goals.router,       prefix="/api",             tags=["Goals"])
app.include_router(development.router, prefix="/api",             tags=["Development"])
app.include_router(reports.router,     prefix="/api/reports",     tags=["Reports"])
app.include_router(ai.router,          prefix="/api",             tags=["AI Intelligence"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "HRM Performance Intelligence Platform API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }
