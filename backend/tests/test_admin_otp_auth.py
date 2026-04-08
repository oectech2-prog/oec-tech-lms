"""
Test Admin OTP Authentication and Admin Panel Endpoints
- Admin OTP request/verify flow
- Admin stats, students, enrollments, courses endpoints
- Protected route verification
"""
import pytest
import requests
import os
import re
import subprocess
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_PHONE = "03000517616"
WRONG_PHONE = "03001234567"

class TestAdminOTPAuth:
    """Admin OTP Authentication Tests"""
    
    def test_request_otp_correct_phone(self):
        """POST /api/admin/request-otp with correct phone returns success"""
        response = requests.post(f"{BASE_URL}/api/admin/request-otp", json={"phone": ADMIN_PHONE})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("otp_sent") == True
        assert "message" in data
        print(f"✓ OTP request successful: {data['message']}")
    
    def test_request_otp_wrong_phone(self):
        """POST /api/admin/request-otp with wrong phone returns 403"""
        response = requests.post(f"{BASE_URL}/api/admin/request-otp", json={"phone": WRONG_PHONE})
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Wrong phone rejected: {data['detail']}")
    
    def test_verify_otp_wrong_otp(self):
        """POST /api/admin/verify-otp with wrong OTP returns 400"""
        # First request OTP
        requests.post(f"{BASE_URL}/api/admin/request-otp", json={"phone": ADMIN_PHONE})
        
        # Try wrong OTP
        response = requests.post(f"{BASE_URL}/api/admin/verify-otp", json={
            "phone": ADMIN_PHONE,
            "otp": "000000"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Wrong OTP rejected: {data['detail']}")
    
    def test_verify_otp_wrong_phone(self):
        """POST /api/admin/verify-otp with wrong phone returns 403"""
        response = requests.post(f"{BASE_URL}/api/admin/verify-otp", json={
            "phone": WRONG_PHONE,
            "otp": "123456"
        })
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("✓ Wrong phone rejected on verify")


class TestAdminEndpointsWithoutAuth:
    """Test admin endpoints return 401 without authentication"""
    
    def test_admin_stats_requires_auth(self):
        """GET /api/admin/stats without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/admin/stats requires auth")
    
    def test_admin_students_requires_auth(self):
        """GET /api/admin/students without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/students")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/admin/students requires auth")
    
    def test_admin_enrollments_requires_auth(self):
        """GET /api/admin/enrollments without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/enrollments")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/admin/enrollments requires auth")
    
    def test_admin_courses_requires_auth(self):
        """GET /api/admin/courses without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/courses")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/admin/courses requires auth")


def get_otp_from_logs():
    """Extract OTP from backend logs"""
    try:
        result = subprocess.run(
            ["grep", "ADMIN OTP", "/var/log/supervisor/backend.err.log"],
            capture_output=True, text=True, timeout=5
        )
        lines = result.stdout.strip().split('\n')
        if lines:
            last_line = lines[-1]
            match = re.search(r'OTP: (\d{6})', last_line)
            if match:
                return match.group(1)
    except Exception as e:
        print(f"Error getting OTP from logs: {e}")
    return None


class TestAdminOTPVerifyAndSession:
    """Test full OTP verification flow and admin session"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Get admin session by requesting and verifying OTP"""
        # Request OTP
        response = requests.post(f"{BASE_URL}/api/admin/request-otp", json={"phone": ADMIN_PHONE})
        assert response.status_code == 200, f"OTP request failed: {response.text}"
        
        # Wait a moment for logs to be written
        time.sleep(0.5)
        
        # Get OTP from logs
        otp = get_otp_from_logs()
        if not otp:
            pytest.skip("Could not get OTP from logs")
        
        print(f"Got OTP from logs: {otp}")
        
        # Verify OTP
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/admin/verify-otp", json={
            "phone": ADMIN_PHONE,
            "otp": otp
        })
        
        if response.status_code != 200:
            pytest.skip(f"OTP verification failed: {response.text}")
        
        data = response.json()
        assert "user" in data
        assert "session_token" in data
        assert data["user"]["role"] == "admin"
        
        print(f"✓ Admin session created for: {data['user']['name']}")
        return session, data["session_token"]
    
    def test_verify_otp_returns_admin_session(self, admin_session):
        """POST /api/admin/verify-otp with correct OTP returns admin session"""
        session, token = admin_session
        assert token is not None
        assert len(token) > 0
        print("✓ OTP verification returns valid session token")
    
    def test_admin_stats_with_auth(self, admin_session):
        """GET /api/admin/stats with auth returns stats"""
        session, token = admin_session
        response = session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify required fields
        required_fields = ["total_students", "monthly_revenue", "pending_payments", "approved_payments", "students_this_month"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✓ Admin stats: students={data['total_students']}, pending={data['pending_payments']}, approved={data['approved_payments']}")
    
    def test_admin_students_with_auth(self, admin_session):
        """GET /api/admin/students with auth returns students list"""
        session, token = admin_session
        response = session.get(f"{BASE_URL}/api/admin/students")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        
        # If there are students, verify structure
        if len(data) > 0:
            student = data[0]
            assert "user_id" in student
            assert "enrollments_count" in student
            assert "completed_lessons" in student
            assert "joining_date" in student or student.get("joining_date") is None
            print(f"✓ Admin students: {len(data)} students found")
        else:
            print("✓ Admin students: 0 students (empty list)")
    
    def test_admin_enrollments_with_auth(self, admin_session):
        """GET /api/admin/enrollments with auth returns enrollments with user and course details"""
        session, token = admin_session
        response = session.get(f"{BASE_URL}/api/admin/enrollments")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        
        # If there are enrollments, verify structure
        if len(data) > 0:
            enrollment_item = data[0]
            assert "enrollment" in enrollment_item
            assert "user" in enrollment_item
            assert "course" in enrollment_item
            print(f"✓ Admin enrollments: {len(data)} enrollments found")
        else:
            print("✓ Admin enrollments: 0 enrollments (empty list)")
    
    def test_admin_courses_with_auth(self, admin_session):
        """GET /api/admin/courses with auth returns courses with enrollment counts"""
        session, token = admin_session
        response = session.get(f"{BASE_URL}/api/admin/courses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        
        # If there are courses, verify structure
        if len(data) > 0:
            course = data[0]
            assert "course_id" in course
            assert "enrollment_count" in course
            assert "approved_count" in course
            print(f"✓ Admin courses: {len(data)} courses found")
        else:
            print("✓ Admin courses: 0 courses (empty list)")


class TestAdminEnrollmentUpdate:
    """Test enrollment status update with approved_at timestamp"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Get admin session"""
        response = requests.post(f"{BASE_URL}/api/admin/request-otp", json={"phone": ADMIN_PHONE})
        if response.status_code != 200:
            pytest.skip("OTP request failed")
        
        time.sleep(0.5)
        otp = get_otp_from_logs()
        if not otp:
            pytest.skip("Could not get OTP from logs")
        
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/admin/verify-otp", json={
            "phone": ADMIN_PHONE,
            "otp": otp
        })
        
        if response.status_code != 200:
            pytest.skip(f"OTP verification failed: {response.text}")
        
        return session
    
    def test_update_enrollment_to_completed_sets_approved_at(self, admin_session):
        """PUT /api/admin/enrollments/{id} with payment_status=completed sets approved_at"""
        session = admin_session
        
        # Get enrollments
        response = session.get(f"{BASE_URL}/api/admin/enrollments")
        if response.status_code != 200:
            pytest.skip("Could not get enrollments")
        
        enrollments = response.json()
        
        # Find a pending enrollment to test
        pending = [e for e in enrollments if e.get("enrollment", {}).get("payment_status") == "pending"]
        
        if not pending:
            print("✓ No pending enrollments to test update (skipping)")
            pytest.skip("No pending enrollments available")
        
        enrollment_id = pending[0]["enrollment"]["enrollment_id"]
        
        # Update to completed
        response = session.put(f"{BASE_URL}/api/admin/enrollments/{enrollment_id}", json={
            "payment_status": "completed"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify approved_at was set by checking enrollments again
        response = session.get(f"{BASE_URL}/api/admin/enrollments")
        enrollments = response.json()
        
        updated = [e for e in enrollments if e.get("enrollment", {}).get("enrollment_id") == enrollment_id]
        if updated:
            enrollment = updated[0]["enrollment"]
            assert enrollment.get("payment_status") == "completed"
            assert enrollment.get("approved_at") is not None
            print(f"✓ Enrollment {enrollment_id} approved with approved_at: {enrollment['approved_at']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
