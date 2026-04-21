"""
Test Admission Features - OEC Tech Institute
Tests for:
- Admin password login (POST /api/admin/login)
- Admin admission forms endpoint (GET /api/admin/admission-forms)
- Student upload endpoint (POST /api/student/upload)
- Admission form submission (POST /api/admission-form)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
from conftest import ADMIN_PASSWORD, BASE_URL as CONF_URL

class TestAdminPasswordLogin:
    """Test admin password-based authentication"""
    
    def test_admin_login_success(self):
        """Test admin login with correct password"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "user" in data, "Response should contain user"
        assert "session_token" in data, "Response should contain session_token"
        assert data["user"]["role"] == "admin", "User role should be admin"
        print(f"✓ Admin login successful, session_token: {data['session_token'][:20]}...")
    
    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrong_password"},
            timeout=30
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Wrong password correctly rejected with 401")
    
    def test_admin_login_empty_password(self):
        """Test admin login with empty password"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ""},
            timeout=30
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Empty password correctly rejected")


class TestAdminAdmissionForms:
    """Test admin admission forms endpoint"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=30
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        data = response.json()
        return data["session_token"]
    
    def test_get_admission_forms_requires_auth(self):
        """Test that GET /api/admin/admission-forms requires authentication"""
        response = requests.get(
            f"{BASE_URL}/api/admin/admission-forms",
            timeout=30
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admission forms endpoint requires auth (401 without)")
    
    def test_get_admission_forms_with_auth(self, admin_session):
        """Test GET /api/admin/admission-forms with admin session"""
        response = requests.get(
            f"{BASE_URL}/api/admin/admission-forms",
            cookies={"session_token": admin_session},
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Admission forms endpoint returns array with {len(data)} forms")
        
        # If there are forms, verify structure
        if len(data) > 0:
            form = data[0]
            expected_fields = ["form_id", "student_id", "full_name", "course_id"]
            for field in expected_fields:
                assert field in form, f"Form should have {field} field"
            print(f"✓ Form structure verified: {list(form.keys())[:5]}...")


class TestStudentUpload:
    """Test student file upload endpoint"""
    
    def test_student_upload_requires_auth(self):
        """Test that POST /api/student/upload requires authentication"""
        # Create a simple test file
        files = {'file': ('test.txt', b'test content', 'text/plain')}
        response = requests.post(
            f"{BASE_URL}/api/student/upload",
            files=files,
            timeout=30
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Student upload endpoint requires auth (401 without)")


class TestAdmissionFormSubmission:
    """Test admission form submission endpoint"""
    
    def test_admission_form_requires_auth(self):
        """Test that POST /api/admission-form requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/admission-form",
            json={
                "full_name": "Test Student",
                "phone": "03001234567",
                "course_id": "test_course"
            },
            timeout=30
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admission form submission requires auth (401 without)")


class TestAdminNavigation:
    """Test that admin endpoints are accessible with proper auth"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=30
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["session_token"]
    
    def test_admin_stats_accessible(self, admin_session):
        """Test admin stats endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            cookies={"session_token": admin_session},
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Admin stats endpoint accessible")
    
    def test_admin_students_accessible(self, admin_session):
        """Test admin students endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/students",
            cookies={"session_token": admin_session},
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Admin students endpoint accessible")
    
    def test_admin_enrollments_accessible(self, admin_session):
        """Test admin enrollments endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/enrollments",
            cookies={"session_token": admin_session},
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Admin enrollments endpoint accessible")
    
    def test_admin_courses_accessible(self, admin_session):
        """Test admin courses endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/courses",
            cookies={"session_token": admin_session},
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Admin courses endpoint accessible")


class TestPublicCourses:
    """Test public courses endpoint for checkout flow"""
    
    def test_get_courses(self):
        """Test GET /api/courses returns courses"""
        response = requests.get(f"{BASE_URL}/api/courses", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Courses endpoint returns {len(data)} courses")
        
        if len(data) > 0:
            course = data[0]
            assert "course_id" in course, "Course should have course_id"
            assert "title" in course, "Course should have title"
            print(f"✓ First course: {course['title']} (ID: {course['course_id']})")
            return course["course_id"]
    
    def test_get_single_course(self):
        """Test GET /api/courses/:id returns course details"""
        # First get list of courses
        response = requests.get(f"{BASE_URL}/api/courses", timeout=30)
        if response.status_code != 200 or len(response.json()) == 0:
            pytest.skip("No courses available")
        
        course_id = response.json()[0]["course_id"]
        
        # Get single course
        response = requests.get(f"{BASE_URL}/api/courses/{course_id}", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        course = response.json()
        assert course["course_id"] == course_id
        print(f"✓ Single course endpoint works for {course_id}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
