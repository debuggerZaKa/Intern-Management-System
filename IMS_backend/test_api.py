import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine
from app.seeds.rbac_seed import seed_rbac

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Ensure all database tables exist and RBAC seed data is present before tests run."""
    try:
        Base.metadata.create_all(bind=engine)
        seed_rbac()
    except Exception as e:
        print(f"Test database setup warning: {e}")


def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_invalid_login():
    response = client.post("/api/v1/auth/login", json={"email": "wrong_email@netsol.com", "password": "wrongpassword"})
    assert response.status_code == 401


def test_signup_workflow():
    signup_data = {
        "email": "pending_intern_test@netsol.com",
        "password": "Password@123",
        "full_name": "Pending Intern Test",
        "department": "AI Engineering",
        "university": "NUST",
        "degree": "BS Software Engineering",
        "semester": "8th"
    }
    signup_res = client.post("/api/v1/signup", json=signup_data)
    assert signup_res.status_code in (201, 400)

    if signup_res.status_code == 201:
        assert signup_res.json()["status"] == "pending"
        # Attempt login before approval -> Should be 403 Forbidden
        login_res = client.post("/api/v1/auth/login", json={"email": "pending_intern_test@netsol.com", "password": "Password@123"})
        assert login_res.status_code == 403


def test_admin_login_and_me():
    login_res = client.post("/api/v1/auth/login", json={"email": "admin@netsol.com", "password": "Admin@123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None

    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["email"] == "admin@netsol.com"
    assert user_data["role"]["name"] == "admin"


def test_intern_registration_and_rbac():
    intern_email = "test_intern_01@netsol.com"
    reg_data = {
        "email": intern_email,
        "password": "Password@123",
        "full_name": "Test Intern One",
        "department": "Engineering",
        "university": "FAST NUCES",
        "degree": "BS Computer Science",
        "semester": "7th"
    }
    client.post("/api/v1/auth/register", json=reg_data)

    login_res = client.post("/api/v1/auth/login", json={"email": intern_email, "password": "Password@123"})
    if login_res.status_code == 200:
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Intern attempts admin endpoint -> Should be 403 Forbidden
        users_res = client.get("/api/v1/admin/users", headers=headers)
        assert users_res.status_code == 403

        # Intern GET own dashboard
        dashboard_res = client.get("/api/v1/interns/dashboard", headers=headers)
        assert dashboard_res.status_code == 200


def test_bulk_import_invalid_file():
    login_res = client.post("/api/v1/auth/login", json={"email": "admin@netsol.com", "password": "Admin@123"})
    if login_res.status_code == 200:
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Submit invalid file format (.txt)
        files = {"file": ("test.txt", b"invalid data content", "text/plain")}
        import_res = client.post("/api/v1/admin/bulk-import", headers=headers, files=files)
        assert import_res.status_code == 400


if __name__ == "__main__":
    pytest.main(["-v", "test_api.py"])
