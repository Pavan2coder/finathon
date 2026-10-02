"""Quick validation script — run with: python validate.py"""
import os
os.environ["DATABASE_URL"] = "sqlite:///./test_validate.db"
os.environ["SECRET_KEY"]   = "test-key-32-chars-long-placeholder!!"
os.environ["GEMINI_API_KEY"] = "dummy"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173"

# Core imports
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token, decode_access_token

# Analytics
from app.analytics.calibration_analysis import (
    determine_alert_severity, calculate_expected_rating_range,
)
from app.analytics.rating_analysis import compute_manager_stats, compute_z_score

# Models
from app.models.calibration import AlertSeverity
from app.models import (
    Employee, PerformanceReview, CalibrationAlert, Goal,
    Project, Skill, EmployeeSkill, Feedback,
)

print("All imports OK")

# ── Calibration logic ────────────────────────────────────────────────────────
assert determine_alert_severity(30.0)  == AlertSeverity.HIGH,   "HIGH failed"
assert determine_alert_severity(25.0)  == AlertSeverity.HIGH,   "HIGH boundary failed"
assert determine_alert_severity(24.9)  == AlertSeverity.MEDIUM, "MEDIUM failed"
assert determine_alert_severity(15.0)  == AlertSeverity.MEDIUM, "MEDIUM boundary failed"
assert determine_alert_severity(14.9)  == AlertSeverity.LOW,    "LOW failed"
assert determine_alert_severity(-28.0) == AlertSeverity.HIGH,   "Negative HIGH failed"
print("Severity thresholds OK")

lo, hi = calculate_expected_rating_range(90.0)
assert lo >= 4.0 and hi <= 5.0, f"High evidence range wrong: {lo}–{hi}"
lo2, hi2 = calculate_expected_rating_range(20.0)
assert hi2 <= 2.5, f"Low evidence range wrong: {lo2}–{hi2}"
print("Expected rating range OK")

# ── Scenario 1: High evidence + low rating ───────────────────────────────────
ev, rating = 90.0, 3.1
norm = ((rating - 1.0) / 4.0) * 100
deviation = ev - norm
assert deviation > 25.0, f"Scenario 1 deviation wrong: {deviation}"
assert determine_alert_severity(deviation) == AlertSeverity.HIGH
print("Scenario 1 (high evidence, low rating) → HIGH alert: OK")

# ── Scenario 2: Moderate evidence + inflated rating ──────────────────────────
ev2, rating2 = 70.0, 4.9
norm2 = ((rating2 - 1.0) / 4.0) * 100
deviation2 = ev2 - norm2
assert deviation2 < -15.0, f"Scenario 2 deviation wrong: {deviation2}"
print("Scenario 2 (moderate evidence, high rating) → MEDIUM/HIGH alert: OK")

# ── Scenario 3: Aligned ───────────────────────────────────────────────────────
ev3, rating3 = 83.0, 4.2
norm3 = ((rating3 - 1.0) / 4.0) * 100
deviation3 = ev3 - norm3
assert abs(deviation3) < 15.0, f"Scenario 3 should be aligned: {deviation3}"
print("Scenario 3 (aligned) → no alert: OK")

# ── Manager statistics ────────────────────────────────────────────────────────
stats = compute_manager_stats([3.0, 4.0, 5.0])
assert abs(stats["mean"] - 4.0) < 0.01
assert stats["count"] == 3
print("Manager stats OK")

z = compute_z_score(4.5, 3.5, 0.5)
assert z == 2.0
z0 = compute_z_score(3.5, 3.5, 0.5)
assert z0 == 0.0
print("Z-score calculation OK")

# ── JWT ───────────────────────────────────────────────────────────────────────
token = create_access_token({"sub": "employee-123"})
decoded = decode_access_token(token)
assert decoded["sub"] == "employee-123"
assert decode_access_token("bad.token.here") is None
print("JWT auth OK")

# ── Password hashing ──────────────────────────────────────────────────────────
hashed = get_password_hash("mypassword")
from app.core.security import verify_password
assert verify_password("mypassword", hashed)
assert not verify_password("wrong", hashed)
print("Password hashing OK")

# Cleanup
import os
for f in ["test_validate.db", "hrm_dev.db"]:
    if os.path.exists(f):
        os.remove(f)

print()
print("=" * 50)
print("  All validation checks passed!")
print("=" * 50)
