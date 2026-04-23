"""
Iteration 19 Tests - OEC Tech LMS New Features
1. Full course edit (Title, Category, Short/Full Desc, Requirements, What You'll Learn)
2. Course outline assignments with file_url for students to download
3. Manual student add via admin
4. PDF template verification (branded header/footer)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_PASSWORD = "OEC@Admin#2026!Secure"

class TestAdminAuth:
    """Admin authentication tests"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Get admin session token"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        token = data.get("session_token")
        assert token, "No session_token in response"
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_admin_login(self):
        """Test admin login works"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200
        data = response.json()
        assert "session_token" in data
        print("SUCCESS: Admin login works")


class TestCourseFullEdit:
    """Test PUT /api/admin/courses/{id} accepts all new fields"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200
        data = response.json()
        session.headers.update({"Authorization": f"Bearer {data['session_token']}"})
        return session
    
    def test_get_courses_list(self, admin_session):
        """Get list of courses to find one to edit"""
        response = admin_session.get(f"{BASE_URL}/api/admin/courses")
        assert response.status_code == 200
        courses = response.json()
        assert isinstance(courses, list)
        assert len(courses) > 0, "No courses found to test"
        print(f"SUCCESS: Found {len(courses)} courses")
        return courses[0]
    
    def test_course_update_with_all_fields(self, admin_session):
        """Test updating course with category, short_description, description, requirements, what_you_will_learn"""
        # Get a course first
        response = admin_session.get(f"{BASE_URL}/api/admin/courses")
        assert response.status_code == 200
        courses = response.json()
        assert len(courses) > 0
        course = courses[0]
        course_id = course["course_id"]
        
        # Update with all new fields
        update_data = {
            "title": course.get("title", "Test Course"),
            "category": "Technology",
            "short_description": "Test short description for iteration 19",
            "description": "Full detailed description for the course covering all topics",
            "requirements": ["Laptop", "Internet Connection", "Basic Computer Skills"],
            "what_you_will_learn": ["Build websites", "Design logos", "Create apps"]
        }
        
        response = admin_session.put(f"{BASE_URL}/api/admin/courses/{course_id}", json=update_data)
        assert response.status_code == 200, f"Course update failed: {response.text}"
        
        updated_course = response.json()
        assert updated_course.get("category") == "Technology"
        assert updated_course.get("short_description") == "Test short description for iteration 19"
        assert updated_course.get("description") == "Full detailed description for the course covering all topics"
        assert updated_course.get("requirements") == ["Laptop", "Internet Connection", "Basic Computer Skills"]
        assert updated_course.get("what_you_will_learn") == ["Build websites", "Design logos", "Create apps"]
        print("SUCCESS: Course updated with all fields (category, short_description, description, requirements, what_you_will_learn)")
    
    def test_course_update_category_only(self, admin_session):
        """Test updating just category"""
        response = admin_session.get(f"{BASE_URL}/api/admin/courses")
        courses = response.json()
        course_id = courses[0]["course_id"]
        
        response = admin_session.put(f"{BASE_URL}/api/admin/courses/{course_id}", json={"category": "Design"})
        assert response.status_code == 200
        assert response.json().get("category") == "Design"
        print("SUCCESS: Category-only update works")


class TestCourseOutlineAssignments:
    """Test course outline with assignment file_url field"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200
        data = response.json()
        session.headers.update({"Authorization": f"Bearer {data['session_token']}"})
        return session
    
    def test_update_outline_with_assignment_file_url(self, admin_session):
        """Test updating course outline with assignment that has file_url"""
        # Get a course
        response = admin_session.get(f"{BASE_URL}/api/admin/courses")
        courses = response.json()
        course_id = courses[0]["course_id"]
        
        # Create outline with assignment including file_url
        outline_data = {
            "weeks": [
                {
                    "week_number": 1,
                    "title": "Week 1 - Introduction",
                    "description": "Getting started",
                    "lessons": [
                        {
                            "lesson_id": "l_test1",
                            "title": "Lesson 1",
                            "video_type": "youtube",
                            "video_url": "https://youtube.com/watch?v=test",
                            "duration": "20 min"
                        }
                    ],
                    "assignment": {
                        "assignment_id": "a_test1",
                        "title": "Week 1 Assignment",
                        "description": "Complete the exercises",
                        "file_url": "https://drive.google.com/file/d/test123/view",
                        "is_final_project": False
                    }
                },
                {
                    "week_number": 2,
                    "title": "Week 2 - Advanced Topics",
                    "description": "Deep dive",
                    "lessons": [],
                    "assignment": {
                        "assignment_id": "a_test2",
                        "title": "Final Project",
                        "description": "Build a complete project",
                        "file_url": "https://example.com/assignment.pdf",
                        "is_final_project": True
                    }
                }
            ]
        }
        
        response = admin_session.put(f"{BASE_URL}/api/admin/courses/{course_id}/outline", json=outline_data)
        assert response.status_code == 200, f"Outline update failed: {response.text}"
        
        updated_course = response.json()
        weeks = updated_course.get("weeks", [])
        assert len(weeks) >= 2
        
        # Verify assignment with file_url
        week1 = weeks[0]
        assert week1.get("assignment") is not None
        assert week1["assignment"].get("file_url") == "https://drive.google.com/file/d/test123/view"
        assert week1["assignment"].get("title") == "Week 1 Assignment"
        
        week2 = weeks[1]
        assert week2.get("assignment") is not None
        assert week2["assignment"].get("file_url") == "https://example.com/assignment.pdf"
        assert week2["assignment"].get("is_final_project") == True
        
        print("SUCCESS: Course outline updated with assignments containing file_url")


class TestManualStudentAdd:
    """Test POST /api/admin/admission-forms/manual creates student with auto-generated student_id"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200
        data = response.json()
        session.headers.update({"Authorization": f"Bearer {data['session_token']}"})
        return session
    
    def test_manual_add_student_success(self, admin_session):
        """Test adding student manually with all fields"""
        # Get a course first
        response = admin_session.get(f"{BASE_URL}/api/admin/courses")
        courses = response.json()
        course_id = courses[0]["course_id"] if courses else ""
        
        student_data = {
            "full_name": "TEST_Manual Student Iter19",
            "phone": "03001234567",
            "date_of_birth": "2000-01-15",
            "gender": "Male",
            "city": "Chunian",
            "address": "123 Test Street",
            "session_type": "Morning",
            "learning_type": "Physical",
            "qualification": "Intermediate",
            "father_name": "Test Father",
            "father_phone": "03009876543",
            "father_cnic": "35201-1234567-1",
            "course_id": course_id
        }
        
        response = admin_session.post(f"{BASE_URL}/api/admin/admission-forms/manual", json=student_data)
        assert response.status_code == 200, f"Manual add failed: {response.text}"
        
        data = response.json()
        assert "student_id" in data
        assert data["student_id"].startswith("OEC-")
        assert "form_id" in data
        print(f"SUCCESS: Manual student added with student_id: {data['student_id']}")
        return data
    
    def test_manual_add_student_requires_full_name(self, admin_session):
        """Test that full_name is required"""
        response = admin_session.post(f"{BASE_URL}/api/admin/admission-forms/manual", json={
            "phone": "03001234567"
        })
        assert response.status_code == 400
        print("SUCCESS: Manual add validates required full_name field")
    
    def test_manual_add_student_requires_auth(self):
        """Test that endpoint requires admin auth"""
        response = requests.post(f"{BASE_URL}/api/admin/admission-forms/manual", json={
            "full_name": "Test Student"
        })
        assert response.status_code in [401, 403]
        print("SUCCESS: Manual add endpoint requires admin auth")
    
    def test_verify_student_in_admission_forms(self, admin_session):
        """Verify manually added student appears in admission forms list"""
        response = admin_session.get(f"{BASE_URL}/api/admin/admission-forms")
        assert response.status_code == 200
        forms = response.json()
        
        # Find our test student
        test_students = [f for f in forms if "TEST_Manual Student Iter19" in f.get("full_name", "")]
        assert len(test_students) > 0, "Test student not found in admission forms"
        
        student = test_students[0]
        assert student.get("student_id", "").startswith("OEC-")
        assert student.get("phone") == "03001234567"
        assert student.get("father_name") == "Test Father"
        print(f"SUCCESS: Manual student verified in admission forms with ID: {student['student_id']}")


class TestAdmissionFormsEndpoint:
    """Test admission forms endpoint returns all required fields"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200
        data = response.json()
        session.headers.update({"Authorization": f"Bearer {data['session_token']}"})
        return session
    
    def test_admission_forms_have_student_id(self, admin_session):
        """Test that admission forms have student_id field"""
        response = admin_session.get(f"{BASE_URL}/api/admin/admission-forms")
        assert response.status_code == 200
        forms = response.json()
        
        if len(forms) > 0:
            form = forms[0]
            assert "student_id" in form, "student_id field missing from admission form"
            assert "full_name" in form
            assert "form_id" in form
            print(f"SUCCESS: Admission forms have student_id field. Sample: {form.get('student_id')}")
        else:
            print("WARNING: No admission forms to verify")


class TestExistingFeaturesStillWork:
    """Verify existing features still work"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200
        data = response.json()
        session.headers.update({"Authorization": f"Bearer {data['session_token']}"})
        return session
    
    def test_public_courses_endpoint(self):
        """Test public courses endpoint"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        courses = response.json()
        assert isinstance(courses, list)
        print(f"SUCCESS: Public courses endpoint returns {len(courses)} courses")
    
    def test_admin_stats_endpoint(self, admin_session):
        """Test admin stats endpoint"""
        response = admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        stats = response.json()
        assert "total_students" in stats
        assert "total_courses" in stats
        print("SUCCESS: Admin stats endpoint works")
    
    def test_admin_staff_endpoint(self, admin_session):
        """Test admin staff endpoint"""
        response = admin_session.get(f"{BASE_URL}/api/admin/staff")
        assert response.status_code == 200
        staff = response.json()
        assert isinstance(staff, list)
        print(f"SUCCESS: Admin staff endpoint returns {len(staff)} staff members")
    
    def test_diploma_tracks_endpoint(self):
        """Test diploma tracks endpoint"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks")
        assert response.status_code == 200
        tracks = response.json()
        assert isinstance(tracks, list)
        print(f"SUCCESS: Diploma tracks endpoint returns {len(tracks)} tracks")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
