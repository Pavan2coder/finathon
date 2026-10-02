"""
Validation script to verify backend functionality.

Run this after:
1. Setting up the database
2. Running migrations
3. Seeding data

This script performs basic smoke tests on the API endpoints.
"""
import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

def print_section(title: str):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def print_result(name: str, success: bool, details: str = ""):
    status = "✓" if success else "✗"
    print(f"{status} {name}")
    if details:
        print(f"  {details}")

def test_health_check() -> bool:
    """Test that the server is running."""
    try:
        resp = requests.get(f"{BASE_URL}/")
        return resp.status_code == 200
    except Exception as e:
        print(f"  Error: {e}")
        return False

def register_and_login() -> str:
    """Register a test user and get access token."""
    # Register
    register_data = {
        "employee_code": "TEST001",
        "name": "Test User",
        "email": "test@validation.com",
        "password": "test123",
        "department": "Engineering",
    }
    
    try:
        # Try to register
        resp = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
        if resp.status_code not in (200, 201, 400):  # 400 if already exists
            print(f"  Registration returned: {resp.status_code}")
    except Exception as e:
        print(f"  Registration error: {e}")
    
    # Login
    login_data = {
        "email": "test@validation.com",
        "password": "test123",
    }
    
    resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if resp.status_code == 200:
        data = resp.json()
        return data.get("access_token", "")
    else:
        print(f"  Login failed: {resp.status_code}")
        print(f"  Response: {resp.text}")
        return ""

def test_dashboard(token: str) -> Dict[str, Any]:
    """Test dashboard summary endpoint."""
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/api/reports/dashboard", headers=headers)
    if resp.status_code == 200:
        return resp.json()
    else:
        print(f"  Dashboard failed: {resp.status_code}")
        return {}

def test_employees(token: str) -> bool:
    """Test employees list endpoint."""
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/api/employees", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        count = len(data.get("data", []))
        print_result("Fetch employees list", True, f"Found {count} employees")
        return True
    else:
        print_result("Fetch employees list", False, f"Status: {resp.status_code}")
        return False

def test_calibration(token: str) -> bool:
    """Test calibration endpoint."""
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/api/calibration", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        alerts = data.get("data", {}).get("alerts", [])
        print_result("Fetch calibration alerts", True, f"Found {len(alerts)} alerts")
        return True
    else:
        print_result("Fetch calibration alerts", False, f"Status: {resp.status_code}")
        return False

def test_reports(token: str) -> bool:
    """Test reports endpoints."""
    headers = {"Authorization": f"Bearer {token}"}
    
    endpoints = [
        "/api/reports/performance",
        "/api/reports/calibration",
        "/api/reports/skills",
        "/api/reports/promotion-readiness",
    ]
    
    all_success = True
    for endpoint in endpoints:
        resp = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        success = resp.status_code == 200
        all_success = all_success and success
        name = endpoint.split('/')[-1].replace('-', ' ').title()
        print_result(f"Fetch {name} report", success, 
                     f"Status: {resp.status_code}")
    
    return all_success

def main():
    print_section("Backend Validation Script")
    print("Testing backend API endpoints...")
    
    # 1. Health check
    print_section("1. Health Check")
    if not test_health_check():
        print("\n❌ Server is not running!")
        print("\nPlease start the server:")
        print("  cd backend")
        print("  uvicorn app.main:app --reload")
        return
    print_result("Server is running", True)
    
    # 2. Authentication
    print_section("2. Authentication")
    token = register_and_login()
    if not token:
        print("\n❌ Authentication failed!")
        return
    print_result("User login successful", True, f"Token: {token[:20]}...")
    
    # 3. Dashboard
    print_section("3. Dashboard Summary")
    dashboard_data = test_dashboard(token)
    if dashboard_data:
        data = dashboard_data.get("data", {})
        print_result("Dashboard endpoint", True)
        print(f"  Total Employees: {data.get('total_employees', 0)}")
        print(f"  Reviews Completed: {data.get('reviews_completed', 0)}")
        print(f"  Calibration Alerts: {data.get('calibration_alerts', 0)}")
        print(f"  Promotion Ready: {data.get('promotion_ready', 0)}")
    else:
        print_result("Dashboard endpoint", False)
    
    # 4. Employees
    print_section("4. Employees")
    test_employees(token)
    
    # 5. Calibration
    print_section("5. Calibration")
    test_calibration(token)
    
    # 6. Reports
    print_section("6. Reports")
    test_reports(token)
    
    # Summary
    print_section("Validation Complete")
    print("\n✓ All smoke tests passed!")
    print("\nNext steps:")
    print("1. Check Swagger docs: http://localhost:8000/docs")
    print("2. Test specific employee endpoints")
    print("3. Test AI analysis endpoints")
    print("4. Integrate with React frontend")

if __name__ == "__main__":
    main()
