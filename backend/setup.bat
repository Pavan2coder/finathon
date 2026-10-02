@echo off
REM Setup script for first-time installation

echo ===================================
echo HRM Performance Intelligence Platform
echo First-Time Setup
echo ===================================
echo.

REM Create virtual environment
echo [1/5] Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

REM Install dependencies
echo.
echo [2/5] Installing dependencies...
pip install -r requirements.txt

REM Check for .env file
if not exist ".env" (
    echo.
    echo [3/5] Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠ IMPORTANT: Please edit .env file with your configuration:
    echo   - DATABASE_URL
    echo   - SECRET_KEY
    echo   - GEMINI_API_KEY
    echo.
    pause
) else (
    echo.
    echo [3/5] .env file already exists
)

REM Run migrations
echo.
echo [4/5] Running database migrations...
alembic upgrade head

REM Seed database
echo.
echo [5/5] Seeding database with demo data...
python -m app.seed.seed_data

echo.
echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo To start the server, run:
echo   run.bat
echo.
echo Or manually:
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload
echo.
echo API Documentation will be at:
echo   http://localhost:8000/docs
echo.
pause
