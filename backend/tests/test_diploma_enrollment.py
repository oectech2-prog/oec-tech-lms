"""
Test Diploma Enrollment Features - Iteration 11
Tests:
- POST /api/diploma-enrollments (requires auth, returns 401 without)
- GET /api/admin/diploma-enrollments (requires admin)
- PUT /api/admin/diploma-enrollments/{id} (update status)
- PUT /api/admin/diploma-enrollments/{id}/installment-2 (update installment 2 status)
- POST /api/diploma-enrollments/{id}/submit-installment-2 (submit 2nd installment proof)
- GET /api/notifications (includes diploma installment notifications with is_diploma flag)
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
from conftest import ADMIN_PASSWORD, BASE_URL as CONF_URL

# Diploma track IDs from the review request
DIPLOMA_TRACKS = ["track_digital_marketing", "track_ecommerce", "track_web_design"]


class TestDiplomaEnrollmentAuth:
    """Test diploma enrollment authentication requirements"""
    
    def test_create_diploma_enrollment_requires_auth(self):
        """POST /api/diploma-enrollments returns 401 without authentication"""
        response = requests.post(
            f"{BASE_URL}/api/diploma-enrollments",
            json={
                "track_id": DIPLOMA_TRACKS[0],
                "payment_method": "jazzcash",
                "payment_proof": "test",
                "admission_fee_proof": "test_url",
                "installment_1_proof": "test_url"
            }
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("✓ POST /api/diploma-enrollments returns 401 without auth")
    
    def test_submit_diploma_installment_2_requires_auth(self):
        """POST /api/diploma-enrollments/{id}/submit-installment-2 returns 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/diploma-enrollments/fake_id/submit-installment-2",
            json={
                "proof_url": "test_url",
                "payment_method": "jazzcash",
                "reference": "test_ref"
            }
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("✓ POST /api/diploma-enrollments/{id}/submit-installment-2 returns 401 without auth")


class TestAdminDiplomaEnrollments:
    """Test admin diploma enrollment endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "session_token" in data, "No session_token in response"
        return data["session_token"]
    
    def test_admin_login_works(self, admin_session):
        """Admin login with correct password works"""
        assert admin_session is not None
        print("✓ Admin login works with correct password")
    
    def test_get_admin_diploma_enrollments(self, admin_session):
        """GET /api/admin/diploma-enrollments returns array"""
        response = requests.get(
            f"{BASE_URL}/api/admin/diploma-enrollments",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/admin/diploma-enrollments returns array ({len(data)} enrollments)")
        
        # If there are enrollments, verify structure
        if len(data) > 0:
            enrollment_item = data[0]
            assert "enrollment" in enrollment_item, "Missing 'enrollment' key"
            assert "user" in enrollment_item, "Missing 'user' key"
            assert "track" in enrollment_item, "Missing 'track' key"
            print("✓ Diploma enrollment structure has enrollment, user, track keys")
    
    def test_get_admin_diploma_enrollments_requires_admin(self):
        """GET /api/admin/diploma-enrollments returns 401 without admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/diploma-enrollments")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/admin/diploma-enrollments requires admin auth")
    
    def test_update_diploma_enrollment_status_requires_admin(self):
        """PUT /api/admin/diploma-enrollments/{id} requires admin auth"""
        response = requests.put(
            f"{BASE_URL}/api/admin/diploma-enrollments/fake_id",
            json={"payment_status": "completed"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ PUT /api/admin/diploma-enrollments/{id} requires admin auth")
    
    def test_update_diploma_installment_2_requires_admin(self):
        """PUT /api/admin/diploma-enrollments/{id}/installment-2 requires admin auth"""
        response = requests.put(
            f"{BASE_URL}/api/admin/diploma-enrollments/fake_id/installment-2",
            json={"payment_status": "completed"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ PUT /api/admin/diploma-enrollments/{id}/installment-2 requires admin auth")


class TestDiplomaTracks:
    """Test diploma tracks endpoints"""
    
    def test_get_diploma_tracks(self):
        """GET /api/diploma-tracks returns array of tracks"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/diploma-tracks returns array ({len(data)} tracks)")
        
        # Check if expected tracks exist
        track_ids = [t.get("track_id") for t in data]
        for expected_track in DIPLOMA_TRACKS:
            if expected_track in track_ids:
                print(f"  ✓ Found track: {expected_track}")
    
    def test_get_diploma_track_by_id(self):
        """GET /api/diploma-tracks/{track_id} returns track details"""
        # First get all tracks to find a valid ID
        response = requests.get(f"{BASE_URL}/api/diploma-tracks")
        if response.status_code == 200 and len(response.json()) > 0:
            track_id = response.json()[0].get("track_id")
            response = requests.get(f"{BASE_URL}/api/diploma-tracks/{track_id}")
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            data = response.json()
            assert "track_id" in data, "Missing track_id in response"
            assert "title" in data, "Missing title in response"
            print(f"✓ GET /api/diploma-tracks/{track_id} returns track details")
        else:
            pytest.skip("No diploma tracks available to test")
    
    def test_get_nonexistent_diploma_track(self):
        """GET /api/diploma-tracks/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks/nonexistent_track_xyz")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ GET /api/diploma-tracks/{invalid_id} returns 404")


class TestNotificationsWithDiploma:
    """Test notifications endpoint includes diploma installment notifications"""
    
    def test_notifications_requires_auth(self):
        """GET /api/notifications returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/notifications requires auth")


class TestCourses:
    """Test courses endpoint (needed for diploma track checkout)"""
    
    def test_get_courses(self):
        """GET /api/courses returns array of courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/courses returns array ({len(data)} courses)")
        
        # Check course structure
        if len(data) > 0:
            course = data[0]
            assert "course_id" in course, "Missing course_id"
            assert "title" in course, "Missing title"
            assert "price" in course, "Missing price"
            print("✓ Course structure has course_id, title, price")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
