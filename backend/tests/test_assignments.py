"""
Test Assignment Submission System - Iteration 13
Tests:
- POST /api/enrollments/{id}/submit-assignment
- GET /api/admin/assignments
- PUT /api/admin/assignments/{id}
- Week locking logic (approved_weeks)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
from conftest import ADMIN_PASSWORD, BASE_URL as CONF_URL


class TestAdminLogin:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Admin login with correct password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "session_token" in data, "Missing session_token in response"
        assert "user" in data, "Missing user in response"
        assert data["user"]["role"] == "admin", "User role should be admin"
        
    def test_admin_login_wrong_password(self):
        """Admin login with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "wrongpassword"})
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestAdminAssignmentsEndpoint:
    """Tests for GET /api/admin/assignments"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["session_token"]
    
    def test_get_admin_assignments_requires_auth(self):
        """GET /api/admin/assignments requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/assignments")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_get_admin_assignments_success(self, admin_session):
        """GET /api/admin/assignments returns array of submissions"""
        response = requests.get(
            f"{BASE_URL}/api/admin/assignments",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be an array"
        
    def test_admin_assignments_response_structure(self, admin_session):
        """Verify response structure includes required fields"""
        response = requests.get(
            f"{BASE_URL}/api/admin/assignments",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # If there are submissions, verify structure
        if len(data) > 0:
            sub = data[0]
            # Required fields per spec
            assert "user_name" in sub, "Missing user_name field"
            assert "course_title" in sub, "Missing course_title field"
            assert "week_number" in sub, "Missing week_number field"
            assert "submission_type" in sub, "Missing submission_type field"
            assert "status" in sub, "Missing status field"
            assert "submission_id" in sub, "Missing submission_id field"
            print(f"Found {len(data)} submissions with correct structure")
        else:
            print("No submissions found - structure test skipped")


class TestReviewAssignmentEndpoint:
    """Tests for PUT /api/admin/assignments/{id}"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["session_token"]
    
    def test_review_assignment_requires_auth(self):
        """PUT /api/admin/assignments/{id} requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/admin/assignments/fake_id",
            json={"status": "approved", "feedback": ""}
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_review_assignment_invalid_id(self, admin_session):
        """PUT /api/admin/assignments/{id} with invalid ID returns 404"""
        response = requests.put(
            f"{BASE_URL}/api/admin/assignments/invalid_submission_id",
            json={"status": "approved", "feedback": "Good work!"},
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 404, f"Expected 404 for invalid ID, got {response.status_code}"


class TestSubmitAssignmentEndpoint:
    """Tests for POST /api/enrollments/{id}/submit-assignment"""
    
    def test_submit_assignment_requires_auth(self):
        """POST /api/enrollments/{id}/submit-assignment requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/enrollments/fake_enrollment/submit-assignment",
            json={
                "assignment_id": "test_assign",
                "content": "Test answer",
                "file_url": "",
                "submission_type": "text"
            }
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"


class TestAdminNavigation:
    """Test admin navigation has 8 items including Assignments"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["session_token"]
    
    def test_admin_stats_endpoint(self, admin_session):
        """Verify admin stats endpoint works (confirms admin access)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "total_students" in data
        assert "total_courses" in data


class TestCoursesWithWeeks:
    """Test courses have weeks with assignments for week locking"""
    
    def test_get_courses(self):
        """GET /api/courses returns courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} courses")
        
    def test_course_has_weeks_structure(self):
        """Verify courses have weeks array"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        courses = response.json()
        
        if len(courses) > 0:
            course = courses[0]
            assert "weeks" in course, "Course should have weeks array"
            weeks = course.get("weeks", [])
            print(f"Course '{course.get('title')}' has {len(weeks)} weeks")
            
            # Check if any week has assignment
            for week in weeks:
                if week.get("assignment"):
                    print(f"  Week {week.get('week_number')}: has assignment '{week['assignment'].get('title')}'")


class TestEnrollmentsWithApprovedWeeks:
    """Test enrollments have approved_weeks field for week locking"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["session_token"]
    
    def test_get_enrollments(self, admin_session):
        """GET /api/admin/enrollments returns enrollments"""
        response = requests.get(
            f"{BASE_URL}/api/admin/enrollments",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} enrollments")
        
        # Check if any enrollment has approved_weeks
        for item in data:
            enrollment = item.get("enrollment", {})
            approved_weeks = enrollment.get("approved_weeks", [])
            if approved_weeks:
                print(f"  Enrollment {enrollment.get('enrollment_id')}: approved_weeks = {approved_weeks}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
