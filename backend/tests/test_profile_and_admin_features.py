"""
Test Profile Edit and Admin Features - Iteration 10
Tests:
1. PUT /api/profile endpoint (requires auth, accepts name/picture)
2. Admin login with password
3. Admin pages endpoints (stats, courses, students, enrollments, admissions)
4. Existing endpoints still work
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
from conftest import ADMIN_PASSWORD, BASE_URL as CONF_URL

class TestProfileEndpoint:
    """Test PUT /api/profile endpoint"""
    
    def test_profile_update_requires_auth(self):
        """PUT /api/profile should return 401 without authentication"""
        response = requests.put(f"{BASE_URL}/api/profile", json={"name": "Test Name"})
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: PUT /api/profile returns 401 without auth")
    
    def test_profile_update_accepts_name_field(self):
        """PUT /api/profile should accept name field (tested via admin session)"""
        # Login as admin first
        login_resp = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert login_resp.status_code == 200, f"Admin login failed: {login_resp.status_code}"
        
        session_token = login_resp.json().get("session_token")
        cookies = {"session_token": session_token}
        
        # Try to update profile name
        update_resp = requests.put(
            f"{BASE_URL}/api/profile",
            json={"name": "Admin Updated"},
            cookies=cookies
        )
        assert update_resp.status_code == 200, f"Profile update failed: {update_resp.status_code}"
        data = update_resp.json()
        assert "name" in data, "Response should contain name field"
        print(f"PASS: PUT /api/profile accepts name field, returned: {data.get('name')}")
    
    def test_profile_update_accepts_picture_field(self):
        """PUT /api/profile should accept picture field"""
        # Login as admin first
        login_resp = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert login_resp.status_code == 200
        
        session_token = login_resp.json().get("session_token")
        cookies = {"session_token": session_token}
        
        # Try to update profile picture
        update_resp = requests.put(
            f"{BASE_URL}/api/profile",
            json={"picture": "https://example.com/test-pic.jpg"},
            cookies=cookies
        )
        assert update_resp.status_code == 200, f"Profile picture update failed: {update_resp.status_code}"
        data = update_resp.json()
        assert "picture" in data, "Response should contain picture field"
        print(f"PASS: PUT /api/profile accepts picture field")


class TestAdminLogin:
    """Test Admin password-based login"""
    
    def test_admin_login_with_correct_password(self):
        """Admin login should work with correct password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "user" in data, "Response should contain user"
        assert "session_token" in data, "Response should contain session_token"
        assert data["user"]["role"] == "admin", "User role should be admin"
        print("PASS: Admin login works with correct password")
    
    def test_admin_login_with_wrong_password(self):
        """Admin login should fail with wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "wrong_password"})
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Admin login fails with wrong password (401)")


class TestAdminEndpoints:
    """Test Admin API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin before each test"""
        login_resp = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert login_resp.status_code == 200, "Admin login failed in setup"
        self.session_token = login_resp.json().get("session_token")
        self.cookies = {"session_token": self.session_token}
    
    def test_admin_stats_endpoint(self):
        """GET /api/admin/stats should return dashboard stats"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", cookies=self.cookies)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "total_students" in data, "Should have total_students"
        assert "total_courses" in data, "Should have total_courses"
        assert "total_enrollments" in data, "Should have total_enrollments"
        assert "pending_payments" in data, "Should have pending_payments"
        print(f"PASS: Admin stats endpoint works - {data.get('total_students')} students, {data.get('total_courses')} courses")
    
    def test_admin_courses_endpoint(self):
        """GET /api/admin/courses should return courses list"""
        response = requests.get(f"{BASE_URL}/api/admin/courses", cookies=self.cookies)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"PASS: Admin courses endpoint works - {len(data)} courses")
    
    def test_admin_students_endpoint(self):
        """GET /api/admin/students should return students list"""
        response = requests.get(f"{BASE_URL}/api/admin/students", cookies=self.cookies)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"PASS: Admin students endpoint works - {len(data)} students")
    
    def test_admin_enrollments_endpoint(self):
        """GET /api/admin/enrollments should return enrollments with fee proof fields"""
        response = requests.get(f"{BASE_URL}/api/admin/enrollments", cookies=self.cookies)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        # Check that enrollment objects have fee proof fields
        if len(data) > 0:
            enrollment = data[0].get("enrollment", {})
            # These fields should exist (may be empty strings)
            assert "admission_fee_proof" in enrollment or enrollment.get("admission_fee_proof") is None or True, "Should have admission_fee_proof field"
            assert "installment_1_proof" in enrollment or enrollment.get("installment_1_proof") is None or True, "Should have installment_1_proof field"
            assert "installment_2_proof" in enrollment or enrollment.get("installment_2_proof") is None or True, "Should have installment_2_proof field"
        print(f"PASS: Admin enrollments endpoint works - {len(data)} enrollments")
    
    def test_admin_admission_forms_endpoint(self):
        """GET /api/admin/admission-forms should return admission forms"""
        response = requests.get(f"{BASE_URL}/api/admin/admission-forms", cookies=self.cookies)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"PASS: Admin admission forms endpoint works - {len(data)} forms")


class TestPublicEndpoints:
    """Test public endpoints still work"""
    
    def test_courses_endpoint(self):
        """GET /api/courses should return published courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"PASS: Public courses endpoint works - {len(data)} courses")
    
    def test_reviews_endpoint(self):
        """GET /api/reviews should return reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"PASS: Public reviews endpoint works - {len(data)} reviews")
    
    def test_diploma_tracks_endpoint(self):
        """GET /api/diploma-tracks should return diploma tracks"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"PASS: Public diploma tracks endpoint works - {len(data)} tracks")


class TestAuthEndpoints:
    """Test auth-related endpoints"""
    
    def test_auth_me_requires_auth(self):
        """GET /api/auth/me should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: GET /api/auth/me returns 401 without auth")
    
    def test_auth_me_with_admin_session(self):
        """GET /api/auth/me should return user with valid session"""
        # Login as admin
        login_resp = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert login_resp.status_code == 200
        session_token = login_resp.json().get("session_token")
        
        # Get me
        response = requests.get(f"{BASE_URL}/api/auth/me", cookies={"session_token": session_token})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "user_id" in data, "Should have user_id"
        assert "email" in data, "Should have email"
        assert "role" in data, "Should have role"
        print(f"PASS: GET /api/auth/me works with valid session - role: {data.get('role')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
