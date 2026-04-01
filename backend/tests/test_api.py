import os
import sys
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]
TEST_DB_PATH = BACKEND_ROOT / "test_oncodetect.db"

if TEST_DB_PATH.exists():
    TEST_DB_PATH.unlink()

os.environ["APP_ENV"] = "development"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["DEFAULT_ADMIN_USERNAME"] = "admin"
os.environ["DEFAULT_ADMIN_PASSWORD"] = "password123"

sys.path.insert(0, str(BACKEND_ROOT))

import main  # noqa: E402


class OncoDetectApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(main.create_app())
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client.__exit__(None, None, None)
        main.engine.dispose()
        if TEST_DB_PATH.exists():
            TEST_DB_PATH.unlink()

    def login_headers(self):
        response = self.client.post(
            "/api/auth/login",
            data={"username": "admin", "password": "password123"},
        )
        self.assertEqual(response.status_code, 200)
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "OncoDetect API is running")

    def test_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "ok")
        self.assertEqual(payload["database"], "up")
        self.assertIn("brain", payload["allowedOrgans"])

    def test_me_requires_authentication(self):
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, 401)

    def test_login_and_me(self):
        headers = self.login_headers()
        response = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], "admin")

    def test_reports_list_requires_authentication(self):
        response = self.client.get("/api/reports")
        self.assertEqual(response.status_code, 401)

    def test_reports_list_returns_array(self):
        response = self.client.get("/api/reports", headers=self.login_headers())
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_report_not_found_returns_404(self):
        response = self.client.get("/api/reports/missing-report", headers=self.login_headers())
        self.assertEqual(response.status_code, 404)

    def test_analyze_rejects_invalid_json(self):
        response = self.client.post(
            "/api/analyze",
            data={"patient_data": "not-json"},
            files={"scan_file": ("scan.jpg", b"123", "image/jpeg")},
            headers=self.login_headers(),
        )
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.json()["detail"], "Invalid patient_data JSON payload")


if __name__ == "__main__":
    unittest.main()
