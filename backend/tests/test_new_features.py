"""
Test suite for NEW features added after iteration 14:
- Admin Expenses CRUD
- Video Testimonials CRUD
- Course Outline Editor
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
from conftest import ADMIN_PASSWORD, BASE_URL as CONF_URL


class TestExpensesAPI:
    """Admin Expenses API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        self.cookies = response.cookies
        self.session = requests.Session()
        self.session.cookies.update(self.cookies)
    
    def test_get_expenses(self):
        """GET /api/admin/expenses returns expenses list"""
        response = self.session.get(f"{BASE_URL}/api/admin/expenses")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of expenses"
        print(f"✓ GET /api/admin/expenses - Found {len(data)} expenses")
    
    def test_get_expense_stats(self):
        """GET /api/admin/expenses/stats returns stats"""
        response = self.session.get(f"{BASE_URL}/api/admin/expenses/stats")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "monthly" in data, "Expected 'monthly' in stats"
        assert "current_month" in data, "Expected 'current_month' in stats"
        assert "categories" in data, "Expected 'categories' in stats"
        print(f"✓ GET /api/admin/expenses/stats - Current month: {data['current_month']}, Total: {data.get('current_total_expenses', 0)}")
    
    def test_create_expense(self):
        """POST /api/admin/expenses creates an expense"""
        payload = {
            "category": "Staff Salary",
            "description": "TEST_expense_pytest",
            "amount": 5000.0,
            "month": "January",
            "year": 2026
        }
        response = self.session.post(f"{BASE_URL}/api/admin/expenses", json=payload)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "expense_id" in data, "Expected expense_id in response"
        assert data["category"] == "Staff Salary"
        assert data["amount"] == 5000.0
        self.created_expense_id = data["expense_id"]
        print(f"✓ POST /api/admin/expenses - Created expense: {data['expense_id']}")
        
        # Verify persistence with GET
        get_response = self.session.get(f"{BASE_URL}/api/admin/expenses")
        assert get_response.status_code == 200
        expenses = get_response.json()
        found = any(e["expense_id"] == data["expense_id"] for e in expenses)
        assert found, "Created expense not found in list"
        print(f"✓ Verified expense persisted in database")
    
    def test_update_expense(self):
        """PUT /api/admin/expenses/{id} updates expense"""
        # First create an expense
        create_payload = {
            "category": "Building Rent",
            "description": "TEST_update_expense",
            "amount": 10000.0,
            "month": "January",
            "year": 2026
        }
        create_response = self.session.post(f"{BASE_URL}/api/admin/expenses", json=create_payload)
        assert create_response.status_code == 200
        expense_id = create_response.json()["expense_id"]
        
        # Update the expense
        update_payload = {
            "category": "Electricity Bill",
            "description": "TEST_updated_expense",
            "amount": 15000.0,
            "month": "January",
            "year": 2026
        }
        update_response = self.session.put(f"{BASE_URL}/api/admin/expenses/{expense_id}", json=update_payload)
        assert update_response.status_code == 200, f"Failed: {update_response.text}"
        data = update_response.json()
        assert data["category"] == "Electricity Bill"
        assert data["amount"] == 15000.0
        print(f"✓ PUT /api/admin/expenses/{expense_id} - Updated expense")
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/admin/expenses/{expense_id}")
    
    def test_delete_expense(self):
        """DELETE /api/admin/expenses/{id} deletes expense"""
        # First create an expense
        create_payload = {
            "category": "Other Expenses",
            "description": "TEST_delete_expense",
            "amount": 1000.0,
            "month": "January",
            "year": 2026
        }
        create_response = self.session.post(f"{BASE_URL}/api/admin/expenses", json=create_payload)
        assert create_response.status_code == 200
        expense_id = create_response.json()["expense_id"]
        
        # Delete the expense
        delete_response = self.session.delete(f"{BASE_URL}/api/admin/expenses/{expense_id}")
        assert delete_response.status_code == 200, f"Failed: {delete_response.text}"
        
        # Verify deletion
        get_response = self.session.get(f"{BASE_URL}/api/admin/expenses")
        expenses = get_response.json()
        found = any(e["expense_id"] == expense_id for e in expenses)
        assert not found, "Deleted expense still exists"
        print(f"✓ DELETE /api/admin/expenses/{expense_id} - Expense deleted and verified")
    
    def test_expenses_without_auth(self):
        """GET /api/admin/expenses without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/expenses")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ GET /api/admin/expenses without auth returns 401")


class TestVideoTestimonialsAPI:
    """Video Testimonials API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        self.cookies = response.cookies
        self.session = requests.Session()
        self.session.cookies.update(self.cookies)
    
    def test_get_public_video_testimonials(self):
        """GET /api/video-testimonials returns approved videos (public)"""
        response = requests.get(f"{BASE_URL}/api/video-testimonials")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of videos"
        # All returned videos should be approved
        for v in data:
            assert v.get("status") == "approved", f"Non-approved video in public list: {v.get('testimonial_id')}"
        print(f"✓ GET /api/video-testimonials - Found {len(data)} approved videos")
    
    def test_get_admin_video_testimonials(self):
        """GET /api/admin/video-testimonials returns all videos"""
        response = self.session.get(f"{BASE_URL}/api/admin/video-testimonials")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of videos"
        print(f"✓ GET /api/admin/video-testimonials - Found {len(data)} videos (all statuses)")
    
    def test_create_admin_video_testimonial(self):
        """POST /api/admin/video-testimonials creates video"""
        payload = {
            "student_name": "TEST_Student_Pytest",
            "course_title": "Python Course",
            "video_type": "youtube",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "description": "Test testimonial from pytest"
        }
        response = self.session.post(f"{BASE_URL}/api/admin/video-testimonials", json=payload)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "testimonial_id" in data, "Expected testimonial_id in response"
        assert data["student_name"] == "TEST_Student_Pytest"
        assert data["status"] == "approved", "Admin-created videos should be auto-approved"
        self.created_video_id = data["testimonial_id"]
        print(f"✓ POST /api/admin/video-testimonials - Created video: {data['testimonial_id']}")
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/admin/video-testimonials/{data['testimonial_id']}")
    
    def test_update_video_testimonial_status(self):
        """PUT /api/admin/video-testimonials/{id} updates status"""
        # First create a video
        create_payload = {
            "student_name": "TEST_Status_Update",
            "video_type": "youtube",
            "video_url": "https://www.youtube.com/watch?v=test123"
        }
        create_response = self.session.post(f"{BASE_URL}/api/admin/video-testimonials", json=create_payload)
        assert create_response.status_code == 200
        video_id = create_response.json()["testimonial_id"]
        
        # Update status to rejected
        update_response = self.session.put(f"{BASE_URL}/api/admin/video-testimonials/{video_id}", json={"status": "rejected"})
        assert update_response.status_code == 200, f"Failed: {update_response.text}"
        data = update_response.json()
        assert data["status"] == "rejected"
        print(f"✓ PUT /api/admin/video-testimonials/{video_id} - Status updated to rejected")
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/admin/video-testimonials/{video_id}")
    
    def test_delete_video_testimonial(self):
        """DELETE /api/admin/video-testimonials/{id} deletes video"""
        # First create a video
        create_payload = {
            "student_name": "TEST_Delete_Video",
            "video_type": "link",
            "video_url": "https://example.com/video.mp4"
        }
        create_response = self.session.post(f"{BASE_URL}/api/admin/video-testimonials", json=create_payload)
        assert create_response.status_code == 200
        video_id = create_response.json()["testimonial_id"]
        
        # Delete the video
        delete_response = self.session.delete(f"{BASE_URL}/api/admin/video-testimonials/{video_id}")
        assert delete_response.status_code == 200, f"Failed: {delete_response.text}"
        
        # Verify deletion
        get_response = self.session.get(f"{BASE_URL}/api/admin/video-testimonials")
        videos = get_response.json()
        found = any(v["testimonial_id"] == video_id for v in videos)
        assert not found, "Deleted video still exists"
        print(f"✓ DELETE /api/admin/video-testimonials/{video_id} - Video deleted and verified")
    
    def test_admin_videos_without_auth(self):
        """GET /api/admin/video-testimonials without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/video-testimonials")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ GET /api/admin/video-testimonials without auth returns 401")


class TestCourseOutlineAPI:
    """Course Outline Editor API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin session token and find a course"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        self.cookies = response.cookies
        self.session = requests.Session()
        self.session.cookies.update(self.cookies)
        
        # Get a course to test with
        courses_response = self.session.get(f"{BASE_URL}/api/admin/courses")
        assert courses_response.status_code == 200
        courses = courses_response.json()
        assert len(courses) > 0, "No courses found for testing"
        self.test_course = courses[0]
        self.course_id = self.test_course["course_id"]
    
    def test_update_course_outline(self):
        """PUT /api/admin/courses/{id}/outline updates course outline"""
        # Save original weeks to restore later
        original_weeks = self.test_course.get("weeks", [])
        
        # Create new outline
        new_weeks = [
            {
                "week_number": 1,
                "title": "TEST_Week_1_Pytest",
                "description": "Introduction to testing",
                "lessons": [
                    {
                        "lesson_id": "test_lesson_1",
                        "title": "Lesson 1: Getting Started",
                        "video_type": "youtube",
                        "video_url": "https://youtube.com/watch?v=test1",
                        "duration": "15 min"
                    }
                ],
                "assignment": {
                    "assignment_id": "test_assign_1",
                    "title": "Week 1 Assignment",
                    "description": "Complete the exercises",
                    "is_final_project": False
                }
            },
            {
                "week_number": 2,
                "title": "TEST_Week_2_Pytest",
                "description": "Advanced topics",
                "lessons": [
                    {
                        "lesson_id": "test_lesson_2",
                        "title": "Lesson 2: Deep Dive",
                        "video_type": "youtube",
                        "video_url": "https://youtube.com/watch?v=test2",
                        "duration": "20 min"
                    }
                ],
                "assignment": None
            }
        ]
        
        # Update outline
        response = self.session.put(
            f"{BASE_URL}/api/admin/courses/{self.course_id}/outline",
            json={"weeks": new_weeks}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "weeks" in data, "Expected 'weeks' in response"
        assert len(data["weeks"]) == 2, f"Expected 2 weeks, got {len(data['weeks'])}"
        assert data["weeks"][0]["title"] == "TEST_Week_1_Pytest"
        print(f"✓ PUT /api/admin/courses/{self.course_id}/outline - Updated outline with 2 weeks")
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/courses/{self.course_id}")
        assert get_response.status_code == 200
        course_data = get_response.json()
        assert len(course_data.get("weeks", [])) == 2
        print(f"✓ Verified outline persisted in database")
        
        # Restore original weeks
        self.session.put(
            f"{BASE_URL}/api/admin/courses/{self.course_id}/outline",
            json={"weeks": original_weeks}
        )
        print(f"✓ Restored original course outline")
    
    def test_update_outline_nonexistent_course(self):
        """PUT /api/admin/courses/nonexistent/outline returns 404"""
        response = self.session.put(
            f"{BASE_URL}/api/admin/courses/nonexistent_course_id/outline",
            json={"weeks": []}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ PUT /api/admin/courses/nonexistent/outline returns 404")
    
    def test_outline_without_auth(self):
        """PUT /api/admin/courses/{id}/outline without auth returns 401"""
        response = requests.put(
            f"{BASE_URL}/api/admin/courses/{self.course_id}/outline",
            json={"weeks": []}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ PUT /api/admin/courses/{self.course_id}/outline without auth returns 401")


class TestAdminCoursesPage:
    """Test Admin Courses page has Edit/Outline/Delete buttons"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        self.cookies = response.cookies
        self.session = requests.Session()
        self.session.cookies.update(self.cookies)
    
    def test_admin_courses_returns_courses(self):
        """GET /api/admin/courses returns courses with enrollment counts"""
        response = self.session.get(f"{BASE_URL}/api/admin/courses")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of courses"
        assert len(data) > 0, "Expected at least one course"
        # Check that courses have the expected fields
        course = data[0]
        assert "course_id" in course
        assert "title" in course
        print(f"✓ GET /api/admin/courses - Found {len(data)} courses")


# Cleanup test data after all tests
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after all tests"""
    yield
    # Cleanup after tests
    try:
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code == 200:
            session = requests.Session()
            session.cookies.update(response.cookies)
            
            # Cleanup test expenses
            expenses = session.get(f"{BASE_URL}/api/admin/expenses").json()
            for exp in expenses:
                if "TEST_" in (exp.get("description") or ""):
                    session.delete(f"{BASE_URL}/api/admin/expenses/{exp['expense_id']}")
            
            # Cleanup test videos
            videos = session.get(f"{BASE_URL}/api/admin/video-testimonials").json()
            for vid in videos:
                if "TEST_" in (vid.get("student_name") or ""):
                    session.delete(f"{BASE_URL}/api/admin/video-testimonials/{vid['testimonial_id']}")
    except Exception as e:
        print(f"Cleanup warning: {e}")
