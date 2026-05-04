"""
Test suite for refactored OEC Tech Institute API
Tests all public and admin endpoints after backend refactoring from single server.py to modular files
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
from conftest import ADMIN_PASSWORD, BASE_URL as CONF_URL


class TestPublicEndpoints:
    """Test public API endpoints (no auth required)"""
    
    def test_get_courses(self):
        """GET /api/courses - should return array of published courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of courses"
        if len(data) > 0:
            course = data[0]
            assert "course_id" in course
            assert "title" in course
            assert "price" in course
            print(f"✓ GET /api/courses returned {len(data)} courses")
    
    def test_get_diploma_tracks(self):
        """GET /api/diploma-tracks - should return array of diploma tracks"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of diploma tracks"
        print(f"✓ GET /api/diploma-tracks returned {len(data)} tracks")
    
    def test_get_reviews(self):
        """GET /api/reviews - should return array of reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of reviews"
        print(f"✓ GET /api/reviews returned {len(data)} reviews")
    
    def test_get_single_course(self):
        """GET /api/courses/{course_id} - should return course details"""
        # First get list of courses
        courses_resp = requests.get(f"{BASE_URL}/api/courses")
        courses = courses_resp.json()
        if len(courses) > 0:
            course_id = courses[0]["course_id"]
            response = requests.get(f"{BASE_URL}/api/courses/{course_id}")
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            data = response.json()
            assert data["course_id"] == course_id
            assert "weeks" in data, "Course should have weeks array"
            print(f"✓ GET /api/courses/{course_id} returned course with {len(data.get('weeks', []))} weeks")
        else:
            pytest.skip("No courses available to test")
    
    def test_get_nonexistent_course(self):
        """GET /api/courses/{invalid_id} - should return 404"""
        response = requests.get(f"{BASE_URL}/api/courses/nonexistent_course_xyz")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ GET /api/courses/nonexistent returns 404")


class TestAdminLogin:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """POST /api/admin/login - should return session token with correct password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "session_token" in data, "Response should contain session_token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["role"] == "admin", "User role should be admin"
        print(f"✓ Admin login successful, token: {data['session_token'][:20]}...")
    
    def test_admin_login_wrong_password(self):
        """POST /api/admin/login - should return 401 with wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "wrong_password"})
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin login with wrong password returns 401")


@pytest.fixture
def admin_session():
    """Get admin session token for authenticated tests"""
    response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
    if response.status_code != 200:
        pytest.skip("Admin login failed - cannot run authenticated tests")
    data = response.json()
    return data["session_token"]


class TestAdminEndpoints:
    """Test admin-only endpoints (require authentication)"""
    
    def test_admin_stats(self, admin_session):
        """GET /api/admin/stats - should return dashboard statistics"""
        headers = {"Authorization": f"Bearer {admin_session}"}
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "total_students" in data
        assert "total_courses" in data
        assert "total_enrollments" in data
        assert "pending_payments" in data
        assert "monthly_growth" in data
        print(f"✓ Admin stats: {data['total_students']} students, {data['total_courses']} courses, {data['total_enrollments']} enrollments")
    
    def test_admin_stats_no_auth(self):
        """GET /api/admin/stats - should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin stats without auth returns 401")
    
    def test_admin_assignments(self, admin_session):
        """GET /api/admin/assignments - should return array of submissions with original_filename"""
        headers = {"Authorization": f"Bearer {admin_session}"}
        response = requests.get(f"{BASE_URL}/api/admin/assignments", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of assignments"
        if len(data) > 0:
            assignment = data[0]
            assert "submission_id" in assignment
            assert "user_name" in assignment
            assert "course_title" in assignment
            assert "original_filename" in assignment, "Assignment should include original_filename field"
            print(f"✓ Admin assignments returned {len(data)} submissions, first has original_filename: '{assignment.get('original_filename', '')}'")
        else:
            print("✓ Admin assignments returned empty list (no submissions)")
    
    def test_admin_students(self, admin_session):
        """GET /api/admin/students - should return array of students"""
        headers = {"Authorization": f"Bearer {admin_session}"}
        response = requests.get(f"{BASE_URL}/api/admin/students", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of students"
        print(f"✓ Admin students returned {len(data)} students")
    
    def test_admin_enrollments(self, admin_session):
        """GET /api/admin/enrollments - should return array of enrollments"""
        headers = {"Authorization": f"Bearer {admin_session}"}
        response = requests.get(f"{BASE_URL}/api/admin/enrollments", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of enrollments"
        if len(data) > 0:
            enrollment = data[0]
            assert "enrollment" in enrollment
            assert "user" in enrollment
            assert "course" in enrollment
        print(f"✓ Admin enrollments returned {len(data)} enrollments")
    
    def test_admin_defaulters(self, admin_session):
        """GET /api/admin/defaulters - should return array of defaulters"""
        headers = {"Authorization": f"Bearer {admin_session}"}
        response = requests.get(f"{BASE_URL}/api/admin/defaulters", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of defaulters"
        print(f"✓ Admin defaulters returned {len(data)} defaulters")
    
    def test_admin_diploma_enrollments(self, admin_session):
        """GET /api/admin/diploma-enrollments - should return array of diploma enrollments"""
        headers = {"Authorization": f"Bearer {admin_session}"}
        response = requests.get(f"{BASE_URL}/api/admin/diploma-enrollments", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of diploma enrollments"
        print(f"✓ Admin diploma enrollments returned {len(data)} enrollments")
    
    def test_admin_admission_forms(self, admin_session):
        """GET /api/admin/admission-forms - should return array of admission forms"""
        headers = {"Authorization": f"Bearer {admin_session}"}
        response = requests.get(f"{BASE_URL}/api/admin/admission-forms", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of admission forms"
        print(f"✓ Admin admission forms returned {len(data)} forms")
    
    def test_admin_courses(self, admin_session):
        """GET /api/admin/courses - should return courses with enrollment counts"""
        headers = {"Authorization": f"Bearer {admin_session}"}
        response = requests.get(f"{BASE_URL}/api/admin/courses", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of courses"
        if len(data) > 0:
            course = data[0]
            assert "enrollment_count" in course, "Course should have enrollment_count"
            assert "approved_count" in course, "Course should have approved_count"
        print(f"✓ Admin courses returned {len(data)} courses with enrollment counts")
    
    def test_admin_messages(self, admin_session):
        """GET /api/admin/messages - should return array of contact messages"""
        headers = {"Authorization": f"Bearer {admin_session}"}
        response = requests.get(f"{BASE_URL}/api/admin/messages", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of messages"
        print(f"✓ Admin messages returned {len(data)} messages")


class TestAssignmentReview:
    """Test assignment review functionality"""
    
    def test_review_nonexistent_assignment(self, admin_session):
        """PUT /api/admin/assignments/{invalid_id} - should return 404"""
        headers = {"Authorization": f"Bearer {admin_session}"}
        response = requests.put(
            f"{BASE_URL}/api/admin/assignments/nonexistent_sub_xyz",
            headers=headers,
            json={"status": "approved", "feedback": "Test"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Review nonexistent assignment returns 404")


class TestContactEndpoint:
    """Test contact form submission"""
    
    def test_contact_submission(self):
        """POST /api/contact - should accept contact message"""
        response = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Contact User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message from automated testing"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        print("✓ Contact form submission successful")


class TestStudentUploadEndpoint:
    """Test student file upload endpoint"""
    
    def test_student_upload_no_auth(self):
        """POST /api/student/upload - should return 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/student/upload")
        assert response.status_code in [401, 422], f"Expected 401 or 422, got {response.status_code}"
        print("✓ Student upload without auth returns 401/422")


class TestFileDownloadEndpoint:
    """Test file download endpoint"""
    
    def test_file_download_nonexistent(self):
        """GET /api/files/{path} - should return 404 for nonexistent file"""
        response = requests.get(f"{BASE_URL}/api/files/nonexistent/path/file.pdf")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ File download for nonexistent file returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
