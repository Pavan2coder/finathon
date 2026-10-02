"""
Tests for authentication — registration, login, token validation.
"""
import pytest
from tests.conftest import make_employee, make_hr_admin, auth_header
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token


# ── Password hashing ──────────────────────────────────────────────────────────

class TestPasswordHashing:
    def test_hash_and_verify(self):
        plain = "mysecretpassword"
        hashed = get_password_hash(plain)
        assert verify_password(plain, hashed)

    def test_wrong_password_fails(self):
        hashed = get_password_hash("correct")
        assert not verify_password("wrong", hashed)

    def test_hash_is_not_plaintext(self):
        plain = "mypassword"
        hashed = get_password_hash(plain)
        assert hashed != plain


# ── JWT token ─────────────────────────────────────────────────────────────────

class TestJWTToken:
    def test_encode_decode_roundtrip(self):
        payload = {"sub": "user-123", "role": "EMPLOYEE"}
        token = create_access_token(payload)
        decoded = decode_access_token(token)
        assert decoded["sub"] == "user-123"

    def test_invalid_token_returns_none(self):
        result = decode_access_token("not.a.valid.token")
        assert result is None

    def test_tampered_token_returns_none(self):
        token = create_access_token({"sub": "user-123"})
        tampered = token[:-5] + "XXXXX"
        assert decode_access_token(tampered) is None


# ── Auth API ──────────────────────────────────────────────────────────────────

class TestAuthAPI:
    def test_register_new_user(self, client):
        resp = client.post("/api/auth/register", json={
            "employee_code": "NEW001",
            "name": "New User",
            "email": "newuser@company.com",
            "password": "securepass123",
            "department": "Engineering",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "newuser@company.com"

    def test_register_duplicate_email(self, client, db):
        make_employee(db, email="exists@co.com", code="E1")
        resp = client.post("/api/auth/register", json={
            "employee_code": "NEW002",
            "name": "Another",
            "email": "exists@co.com",
            "password": "pass",
            "department": "Eng",
        })
        assert resp.status_code == 400

    def test_login_valid_credentials(self, client, db):
        make_employee(db, email="login@co.com", code="L1", password="testpass")
        resp = client.post("/api/auth/login", json={
            "email": "login@co.com",
            "password": "testpass",
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_wrong_password(self, client, db):
        make_employee(db, email="login@co.com", code="L1", password="correct")
        resp = client.post("/api/auth/login", json={
            "email": "login@co.com",
            "password": "wrong",
        })
        assert resp.status_code == 401

    def test_login_unknown_email(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "nobody@nowhere.com",
            "password": "pass",
        })
        assert resp.status_code == 401

    def test_get_me(self, client, db):
        emp = make_employee(db, code="M1", email="me@co.com")
        resp = client.get("/api/auth/me", headers=auth_header(emp))
        assert resp.status_code == 200
        assert resp.json()["email"] == "me@co.com"

    def test_get_me_invalid_token(self, client):
        resp = client.get("/api/auth/me", headers={"Authorization": "Bearer bad.token"})
        # FastAPI HTTPBearer returns 403 for malformed scheme, 401 for invalid token
        assert resp.status_code in (401, 403)
