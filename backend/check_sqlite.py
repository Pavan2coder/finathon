import os
os.environ["TESTING"] = "1"
os.environ["DATABASE_URL"] = "sqlite:///./test_check.db"
os.environ["SECRET_KEY"] = "test-key-32-chars-long-placeholder!!"
os.environ["GEMINI_API_KEY"] = "dummy"

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base
from app.models import Employee, EmployeeRole, EmployeeStatus
from app.core.security import get_password_hash
from datetime import datetime

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)
db = Session()

emp = Employee(
    employee_code="T1", name="Test", email="test@co.com",
    password_hash=get_password_hash("pass"),
    role=EmployeeRole.EMPLOYEE, department="Eng",
    joining_date=datetime(2022, 1, 1), status=EmployeeStatus.ACTIVE,
)
db.add(emp)
db.commit()
db.refresh(emp)
print("Direct SQLite insert OK:", emp.id, emp.email)

# Now test via FastAPI TestClient
from fastapi.testclient import TestClient
from app.main import app
from app.core.dependencies import get_db

# Give TestClient its own fresh in-memory DB
engine2 = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=engine2)
Session2 = sessionmaker(bind=engine2)
test_db = Session2()

def override():
    try:
        yield test_db
    finally:
        pass

app.dependency_overrides[get_db] = override
client = TestClient(app)

resp = client.post("/api/auth/register", json={
    "employee_code": "NEW001",
    "name": "New User",
    "email": "newuser@company.com",
    "password": "securepass123",
    "department": "Engineering",
})
print("Register response:", resp.status_code, resp.text[:200])
app.dependency_overrides.clear()
test_db.close()
db.close()
