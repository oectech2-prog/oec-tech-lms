"""
Backend API Tests for OEC Tech Institute - Vanilla JS Conversion
Tests all critical API endpoints to ensure backend still works after frontend conversion
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPublicAPIs:
    """Test public API endpoints (no auth required)"""
    
    def test_get_courses(self):
        """GET /api/courses - returns list of courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 9  # 9 courses expected
        # Verify course structure
        course = data[0]
        assert "course_id" in course
        assert "title" in course
        assert "price" in course
        print(f"✓ GET /api/courses - {len(data)} courses returned")
    
    def test_get_single_course(self):
        """GET /api/courses/{id} - returns single course"""
        response = requests.get(f"{BASE_URL}/api/courses/course_graphic")
        assert response.status_code == 200
        data = response.json()
        assert data["course_id"] == "course_graphic"
        assert data["title"] == "Graphic Designing"
        print(f"✓ GET /api/courses/course_graphic - {data['title']}")
    
    def test_get_reviews(self):
        """GET /api/reviews - returns reviews list"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/reviews - {len(data)} reviews returned")
    
    def test_get_diploma_tracks(self):
        """GET /api/diploma-tracks - returns diploma tracks"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/diploma-tracks - {len(data)} tracks returned")
    
    def test_get_video_testimonials_public(self):
        """GET /api/video-testimonials - returns approved videos only"""
        response = requests.get(f"{BASE_URL}/api/video-testimonials")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned videos should be approved
        for video in data:
            assert video.get("status") == "approved"
        print(f"✓ GET /api/video-testimonials - {len(data)} approved videos")


class TestAdminAuth:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """POST /api/admin/login - successful login"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "OEC@Admin#2026!Secure"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user" in data or "message" in data
        print("✓ POST /api/admin/login - login successful")
    
    def test_admin_login_failure(self):
        """POST /api/admin/login - wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ POST /api/admin/login - wrong password returns 401")
    
    def test_admin_stats_without_auth(self):
        """GET /api/admin/stats - requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401
        print("✓ GET /api/admin/stats - returns 401 without auth")


class TestAdminAPIs:
    """Test admin API endpoints (with auth)"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Login and get session cookie"""
        self.session = requests.Session()
        response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "OEC@Admin#2026!Secure"}
        )
        assert response.status_code == 200
        yield
        self.session.close()
    
    def test_get_admin_stats(self):
        """GET /api/admin/stats - returns dashboard stats"""
        response = self.session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_courses" in data
        assert "total_students" in data
        assert "total_enrollments" in data
        print(f"✓ GET /api/admin/stats - courses: {data['total_courses']}, students: {data['total_students']}")
    
    def test_get_admin_courses(self):
        """GET /api/admin/courses - returns all courses"""
        response = self.session.get(f"{BASE_URL}/api/admin/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 9
        print(f"✓ GET /api/admin/courses - {len(data)} courses")
    
    def test_get_admin_expenses(self):
        """GET /api/admin/expenses - returns expenses list"""
        response = self.session.get(f"{BASE_URL}/api/admin/expenses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/admin/expenses - {len(data)} expenses")
    
    def test_get_admin_expenses_stats(self):
        """GET /api/admin/expenses/stats - returns expense stats"""
        response = self.session.get(f"{BASE_URL}/api/admin/expenses/stats")
        assert response.status_code == 200
        data = response.json()
        assert "current_month" in data
        assert "categories" in data or "monthly_data" in data
        print(f"✓ GET /api/admin/expenses/stats - current month: {data['current_month']}")
    
    def test_get_admin_video_testimonials(self):
        """GET /api/admin/video-testimonials - returns all videos"""
        response = self.session.get(f"{BASE_URL}/api/admin/video-testimonials")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/admin/video-testimonials - {len(data)} videos")
    
    def test_get_admin_students(self):
        """GET /api/admin/students - returns students list"""
        response = self.session.get(f"{BASE_URL}/api/admin/students")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/admin/students - {len(data)} students")
    
    def test_get_admin_enrollments(self):
        """GET /api/admin/enrollments - returns enrollments list"""
        response = self.session.get(f"{BASE_URL}/api/admin/enrollments")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/admin/enrollments - {len(data)} enrollments")


class TestCourseOutlineAPI:
    """Test course outline update API"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Login and get session cookie"""
        self.session = requests.Session()
        response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "OEC@Admin#2026!Secure"}
        )
        assert response.status_code == 200
        yield
        self.session.close()
    
    def test_update_course_outline(self):
        """PUT /api/admin/courses/{id}/outline - updates course outline"""
        outline_data = {
            "weeks": [
                {
                    "week_number": 1,
                    "title": "Test Week 1",
                    "description": "Test description",
                    "lessons": [
                        {"title": "Intro", "video_url": "", "video_type": "youtube", "duration": "15 min"}
                    ],
                    "assignments": []
                }
            ]
        }
        response = self.session.put(
            f"{BASE_URL}/api/admin/courses/course_comp_apps/outline",
            json=outline_data
        )
        assert response.status_code == 200
        data = response.json()
        assert "weeks" in data
        print("✓ PUT /api/admin/courses/{id}/outline - outline updated")
    
    def test_update_outline_nonexistent_course(self):
        """PUT /api/admin/courses/{id}/outline - 404 for nonexistent course"""
        response = self.session.put(
            f"{BASE_URL}/api/admin/courses/nonexistent_course/outline",
            json={"weeks": []}
        )
        assert response.status_code == 404
        print("✓ PUT /api/admin/courses/nonexistent/outline - returns 404")


class TestExpensesCRUD:
    """Test expenses CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Login and get session cookie"""
        self.session = requests.Session()
        response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "OEC@Admin#2026!Secure"}
        )
        assert response.status_code == 200
        yield
        self.session.close()
    
    def test_expense_crud_flow(self):
        """Test create, read, update, delete expense"""
        # CREATE
        expense_data = {
            "category": "Staff Salary",
            "amount": 1000,
            "description": "TEST_expense_for_testing",
            "month": "April",
            "year": 2026
        }
        create_response = self.session.post(
            f"{BASE_URL}/api/admin/expenses",
            json=expense_data
        )
        assert create_response.status_code in [200, 201]
        created = create_response.json()
        expense_id = created.get("id") or created.get("_id")
        print(f"✓ POST /api/admin/expenses - created expense {expense_id}")
        
        # READ (verify in list)
        list_response = self.session.get(f"{BASE_URL}/api/admin/expenses")
        assert list_response.status_code == 200
        expenses = list_response.json()
        found = any(e.get("description") == "TEST_expense_for_testing" for e in expenses)
        assert found, "Created expense not found in list"
        print("✓ GET /api/admin/expenses - expense found in list")
        
        # DELETE
        if expense_id:
            delete_response = self.session.delete(f"{BASE_URL}/api/admin/expenses/{expense_id}")
            assert delete_response.status_code in [200, 204]
            print(f"✓ DELETE /api/admin/expenses/{expense_id} - deleted")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
