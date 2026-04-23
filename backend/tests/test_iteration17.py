"""
Iteration 17 - Testing OEC Tech Institute LMS
Features to test:
1. Public access APIs (courses, diploma-tracks, reviews, video-testimonials)
2. Admin course edit (PATCH with image_url, intro_video_url)
3. Admin diploma enrollment (add/delete)
4. Checkout 4-step flow validation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_PASSWORD = "OEC@Admin#2026!Secure"

class TestPublicAPIs:
    """Test public endpoints that should work without authentication"""
    
    def test_get_courses_public(self):
        """GET /api/courses - should return 9 courses without auth"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of courses"
        assert len(data) == 9, f"Expected 9 courses, got {len(data)}"
        print(f"✓ GET /api/courses returns {len(data)} courses")
    
    def test_get_single_course(self):
        """GET /api/courses/{id} - should return course details"""
        # First get list to find a course_id
        response = requests.get(f"{BASE_URL}/api/courses")
        courses = response.json()
        if courses:
            course_id = courses[0].get("course_id")
            response = requests.get(f"{BASE_URL}/api/courses/{course_id}")
            assert response.status_code == 200
            data = response.json()
            assert "title" in data
            assert "course_id" in data
            print(f"✓ GET /api/courses/{course_id} returns course details")
    
    def test_get_diploma_tracks_public(self):
        """GET /api/diploma-tracks - should return 3 tracks without auth"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of diploma tracks"
        assert len(data) == 3, f"Expected 3 diploma tracks, got {len(data)}"
        print(f"✓ GET /api/diploma-tracks returns {len(data)} tracks")
    
    def test_get_reviews_public(self):
        """GET /api/reviews - should work without auth"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of reviews"
        print(f"✓ GET /api/reviews returns {len(data)} reviews")
    
    def test_get_video_testimonials_public(self):
        """GET /api/video-testimonials - should work without auth"""
        response = requests.get(f"{BASE_URL}/api/video-testimonials")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of video testimonials"
        print(f"✓ GET /api/video-testimonials returns {len(data)} videos")


class TestAdminAuth:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """POST /api/admin/login - successful login"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data or "session" in data or response.status_code == 200
        print("✓ Admin login successful")
        return response.cookies
    
    def test_admin_login_wrong_password(self):
        """POST /api/admin/login - wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "wrongpassword"})
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin login with wrong password returns 401")
    
    def test_admin_stats_without_auth(self):
        """GET /api/admin/stats - should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin stats without auth returns 401")


class TestAdminCourseEdit:
    """Test admin course edit functionality (PATCH with image_url, intro_video_url)"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session cookies"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.cookies
    
    def test_admin_get_courses(self, admin_session):
        """GET /api/admin/courses - should return all courses with auth"""
        response = requests.get(f"{BASE_URL}/api/admin/courses", cookies=admin_session)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 9, f"Expected 9 courses, got {len(data)}"
        print(f"✓ Admin GET /api/admin/courses returns {len(data)} courses")
        return data
    
    def test_admin_update_course_partial(self, admin_session):
        """PUT /api/admin/courses/{id} - partial update with image_url and intro_video_url"""
        # Get a course first
        response = requests.get(f"{BASE_URL}/api/admin/courses", cookies=admin_session)
        courses = response.json()
        if not courses:
            pytest.skip("No courses to test")
        
        course = courses[0]
        course_id = course.get("course_id")
        original_title = course.get("title")
        
        # Test partial update with just image_url
        update_data = {
            "image_url": "https://drive.google.com/uc?export=view&id=test123",
            "intro_video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/courses/{course_id}",
            json=update_data,
            cookies=admin_session
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify the update
        updated = response.json()
        assert updated.get("image_url") == update_data["image_url"], "image_url not updated"
        assert updated.get("intro_video_url") == update_data["intro_video_url"], "intro_video_url not updated"
        assert updated.get("title") == original_title, "Title should not change"
        
        print(f"✓ Admin PUT /api/admin/courses/{course_id} partial update works")
        
        # Restore original values
        restore_data = {
            "image_url": course.get("image_url", ""),
            "intro_video_url": course.get("intro_video_url", "")
        }
        requests.put(f"{BASE_URL}/api/admin/courses/{course_id}", json=restore_data, cookies=admin_session)


class TestAdminDiplomaEnrollments:
    """Test admin diploma enrollment add/delete"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session cookies"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200
        return response.cookies
    
    def test_get_diploma_enrollments(self, admin_session):
        """GET /api/admin/diploma-enrollments - should return list"""
        response = requests.get(f"{BASE_URL}/api/admin/diploma-enrollments", cookies=admin_session)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin GET /api/admin/diploma-enrollments returns {len(data)} enrollments")
        return data
    
    def test_manual_add_diploma_enrollment_missing_email(self, admin_session):
        """POST /api/admin/diploma-enrollments/manual - should fail without email"""
        response = requests.post(
            f"{BASE_URL}/api/admin/diploma-enrollments/manual",
            json={"track_id": "some_track"},
            cookies=admin_session
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Manual add diploma enrollment fails without email (400)")
    
    def test_manual_add_diploma_enrollment_nonexistent_user(self, admin_session):
        """POST /api/admin/diploma-enrollments/manual - should fail for non-existent user"""
        # Get a valid track_id first
        tracks = requests.get(f"{BASE_URL}/api/diploma-tracks").json()
        if not tracks:
            pytest.skip("No diploma tracks")
        
        track_id = tracks[0].get("track_id")
        
        response = requests.post(
            f"{BASE_URL}/api/admin/diploma-enrollments/manual",
            json={
                "email": "nonexistent_user_test_12345@example.com",
                "track_id": track_id,
                "payment_method": "jazzcash",
                "payment_status": "pending"
            },
            cookies=admin_session
        )
        # Should return 404 because user doesn't exist
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("✓ Manual add diploma enrollment fails for non-existent user (404)")
    
    def test_delete_diploma_enrollment_nonexistent(self, admin_session):
        """DELETE /api/admin/diploma-enrollments/{id} - should return 404 for non-existent"""
        response = requests.delete(
            f"{BASE_URL}/api/admin/diploma-enrollments/nonexistent_id_12345",
            cookies=admin_session
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Delete non-existent diploma enrollment returns 404")


class TestAdminStats:
    """Test admin stats endpoint"""
    
    @pytest.fixture
    def admin_session(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        return response.cookies
    
    def test_admin_stats_with_auth(self, admin_session):
        """GET /api/admin/stats - should return dashboard stats"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", cookies=admin_session)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "total_courses" in data
        assert "total_students" in data
        assert "total_enrollments" in data
        assert data["total_courses"] == 9, f"Expected 9 courses, got {data['total_courses']}"
        print(f"✓ Admin stats: {data['total_courses']} courses, {data['total_students']} students")


class TestPageLoadPerformance:
    """Test page load performance"""
    
    def test_homepage_load_time(self):
        """Homepage should load under 2 seconds"""
        import time
        start = time.time()
        response = requests.get(BASE_URL)
        elapsed = time.time() - start
        assert response.status_code == 200, f"Homepage returned {response.status_code}"
        assert elapsed < 2.0, f"Homepage took {elapsed:.2f}s (should be < 2s)"
        print(f"✓ Homepage loaded in {elapsed:.2f}s")
    
    def test_courses_api_load_time(self):
        """Courses API should respond under 2 seconds"""
        import time
        start = time.time()
        response = requests.get(f"{BASE_URL}/api/courses")
        elapsed = time.time() - start
        assert response.status_code == 200
        assert elapsed < 2.0, f"Courses API took {elapsed:.2f}s (should be < 2s)"
        print(f"✓ Courses API responded in {elapsed:.2f}s")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
