@echo off
REM Quick start script for Windows

echo ===================================
echo HRM Performance Intelligence Platform
echo ===================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo Starting FastAPI server...
echo.
echo API Documentation: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
