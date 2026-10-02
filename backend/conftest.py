"""
Root conftest — sets environment variables before any app code is imported.
This ensures the test database (SQLite) is used instead of Postgres.
"""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_hrm.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-unit-tests-only-32ch")
os.environ.setdefault("GEMINI_API_KEY", "dummy-key")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:5173")
os.environ["TESTING"] = "1"
