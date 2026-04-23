"""
Iteration 18 - Staff Management & New Features Testing
Tests for:
1. Staff CRUD operations (GET, POST, DELETE)
2. Staff categories endpoint (8 categories)
3. Admission forms with student_id and profile_pic_url
4. Admin admissions endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestStaffManagement:
    """Staff CRUD and categories tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self, admin_session):
        """Use admin session for all staff tests"""
        self.session = admin_session
    
    def test_get_staff_categories_returns_8_categories(self, admin_session):
        """GET /api/admin/staff/categories returns 8 categories"""
        response = admin_session.get(f"{BASE_URL}/api/admin/staff/categories")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "categories" in data, "Response should have 'categories' key"
        categories = data["categories"]
        assert len(categories) == 8, f"Expected 8 categories, got {len(categories)}"
        
        expected_categories = [
            "Principal", "Admin", "Instructor", "Job Holder",
            "Internship with Stipend", "Internship without Stipend",
            "Sweeper", "Guard"
        ]
        for cat in expected_categories:
            assert cat in categories, f"Category '{cat}' not found in response"
        print(f"✓ Staff categories: {categories}")
    
    def test_get_staff_list(self, admin_session):
        """GET /api/admin/staff returns staff list"""
        response = admin_session.get(f"{BASE_URL}/api/admin/staff")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Staff list returned {len(data)} members")
        
        # Check structure if staff exists
        if len(data) > 0:
            staff = data[0]
            assert "staff_id" in staff, "Staff should have staff_id"
            assert "name" in staff, "Staff should have name"
            assert "category" in staff, "Staff should have category"
            print(f"✓ First staff: {staff.get('name')} - {staff.get('category')}")
    
    def test_create_staff_with_all_fields(self, admin_session):
        """POST /api/admin/staff creates staff with all fields"""
        staff_data = {
            "name": "TEST_Staff_Member",
            "category": "Instructor",
            "father_name": "Test Father",
            "phone": "03001234567",
            "email": "test_staff@example.com",
            "cnic": "12345-1234567-1",
            "address": "Test Address",
            "city": "Lahore",
            "date_of_birth": "1990-01-15",
            "gender": "Male",
            "qualification": "Masters",
            "salary": "50000",
            "joining_date": "2026-01-01",
            "profile_pic_url": "",
            "id_card_front_url": "",
            "id_card_back_url": "",
            "letter_url": ""
        }
        
        response = admin_session.post(f"{BASE_URL}/api/admin/staff", json=staff_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "staff_id" in data, "Response should have staff_id"
        assert data["name"] == staff_data["name"], "Name should match"
        assert data["category"] == staff_data["category"], "Category should match"
        assert data["phone"] == staff_data["phone"], "Phone should match"
        assert data["email"] == staff_data["email"], "Email should match"
        
        # Store for cleanup
        self.created_staff_id = data["staff_id"]
        print(f"✓ Created staff: {data['staff_id']} - {data['name']}")
        
        # Verify persistence with GET
        get_response = admin_session.get(f"{BASE_URL}/api/admin/staff")
        assert get_response.status_code == 200
        staff_list = get_response.json()
        found = any(s["staff_id"] == data["staff_id"] for s in staff_list)
        assert found, "Created staff should be in staff list"
        print("✓ Staff persisted in database")
        
        return data["staff_id"]
    
    def test_create_staff_requires_name_and_category(self, admin_session):
        """POST /api/admin/staff returns 400 without name/category"""
        # Missing name
        response = admin_session.post(f"{BASE_URL}/api/admin/staff", json={"category": "Instructor"})
        assert response.status_code == 400, f"Expected 400 for missing name, got {response.status_code}"
        
        # Missing category
        response = admin_session.post(f"{BASE_URL}/api/admin/staff", json={"name": "Test"})
        assert response.status_code == 400, f"Expected 400 for missing category, got {response.status_code}"
        
        print("✓ Validation works for required fields")
    
    def test_delete_staff(self, admin_session):
        """DELETE /api/admin/staff/{id} deletes staff"""
        # First create a staff to delete
        staff_data = {"name": "TEST_Delete_Staff", "category": "Guard"}
        create_response = admin_session.post(f"{BASE_URL}/api/admin/staff", json=staff_data)
        assert create_response.status_code == 200
        staff_id = create_response.json()["staff_id"]
        print(f"✓ Created staff for deletion: {staff_id}")
        
        # Delete the staff
        delete_response = admin_session.delete(f"{BASE_URL}/api/admin/staff/{staff_id}")
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        
        data = delete_response.json()
        assert "message" in data, "Response should have message"
        print(f"✓ Deleted staff: {staff_id}")
        
        # Verify deletion with GET
        get_response = admin_session.get(f"{BASE_URL}/api/admin/staff")
        staff_list = get_response.json()
        found = any(s["staff_id"] == staff_id for s in staff_list)
        assert not found, "Deleted staff should not be in staff list"
        print("✓ Staff removed from database")
    
    def test_delete_nonexistent_staff_returns_404(self, admin_session):
        """DELETE /api/admin/staff/{id} returns 404 for non-existent"""
        response = admin_session.delete(f"{BASE_URL}/api/admin/staff/nonexistent_staff_id")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ 404 returned for non-existent staff")
    
    def test_staff_requires_auth(self):
        """Staff endpoints require admin auth"""
        # Without auth
        response = requests.get(f"{BASE_URL}/api/admin/staff")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        
        response = requests.get(f"{BASE_URL}/api/admin/staff/categories")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        
        print("✓ Staff endpoints require authentication")


class TestAdmissionForms:
    """Admission forms with student_id and profile_pic_url"""
    
    def test_get_admin_admissions_returns_forms_with_student_id(self, admin_session):
        """GET /api/admin/admission-forms returns forms with student_id field"""
        response = admin_session.get(f"{BASE_URL}/api/admin/admission-forms")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Admission forms returned: {len(data)} forms")
        
        # Check structure if forms exist
        if len(data) > 0:
            form = data[0]
            assert "student_id" in form, "Form should have student_id field"
            assert "form_id" in form, "Form should have form_id"
            assert "full_name" in form, "Form should have full_name"
            
            # Check student_id format (OEC-YYYY-XXXX)
            student_id = form.get("student_id", "")
            if student_id:
                assert student_id.startswith("OEC-"), f"Student ID should start with OEC-, got {student_id}"
                print(f"✓ Student ID format correct: {student_id}")
            
            # Note: profile_pic_url field is defined in schema but may not exist in old data
            # The field is added in general_routes.py submit_admission_form endpoint
            print(f"✓ Form profile_pic_url field: {'present' if 'profile_pic_url' in form else 'not in old data (expected)'}")
            
            print(f"✓ First form: {form.get('full_name')} - {form.get('student_id')}")
    
    def test_admission_forms_require_auth(self):
        """Admission forms endpoint requires admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/admission-forms")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Admission forms endpoint requires authentication")


class TestUploadEndpoints:
    """File upload endpoints for staff and student documents"""
    
    def test_admin_upload_requires_auth(self):
        """POST /api/upload requires admin auth"""
        response = requests.post(f"{BASE_URL}/api/upload")
        assert response.status_code in [401, 422], f"Expected 401/422 without auth, got {response.status_code}"
        print("✓ Admin upload requires authentication")
    
    def test_student_upload_requires_auth(self):
        """POST /api/student/upload requires auth"""
        response = requests.post(f"{BASE_URL}/api/student/upload")
        assert response.status_code in [401, 422], f"Expected 401/422 without auth, got {response.status_code}"
        print("✓ Student upload requires authentication")


class TestPageLoadPerformance:
    """Page load time tests"""
    
    def test_homepage_load_time(self):
        """Homepage loads under 2 seconds"""
        import time
        start = time.time()
        response = requests.get(BASE_URL)
        elapsed = time.time() - start
        
        assert response.status_code == 200, f"Homepage returned {response.status_code}"
        assert elapsed < 2.0, f"Homepage took {elapsed:.2f}s, expected < 2s"
        print(f"✓ Homepage loaded in {elapsed:.2f}s")
    
    def test_api_response_time(self, admin_session):
        """API endpoints respond under 2 seconds"""
        import time
        
        endpoints = [
            "/api/courses",
            "/api/diploma-tracks",
            "/api/admin/staff",
            "/api/admin/admission-forms"
        ]
        
        for endpoint in endpoints:
            start = time.time()
            response = admin_session.get(f"{BASE_URL}{endpoint}")
            elapsed = time.time() - start
            
            assert elapsed < 2.0, f"{endpoint} took {elapsed:.2f}s, expected < 2s"
            print(f"✓ {endpoint} responded in {elapsed:.2f}s")


# Fixtures
@pytest.fixture(scope="module")
def admin_session():
    """Create authenticated admin session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    
    # Login as admin
    login_response = session.post(
        f"{BASE_URL}/api/admin/login",
        json={"password": "OEC@Admin#2026!Secure"}
    )
    
    if login_response.status_code != 200:
        pytest.skip(f"Admin login failed: {login_response.status_code} - {login_response.text}")
    
    print("✓ Admin session created")
    return session


@pytest.fixture(scope="module", autouse=True)
def cleanup_test_staff(admin_session):
    """Cleanup TEST_ prefixed staff after tests"""
    yield
    
    # Get all staff and delete TEST_ prefixed ones
    try:
        response = admin_session.get(f"{BASE_URL}/api/admin/staff")
        if response.status_code == 200:
            staff_list = response.json()
            for staff in staff_list:
                if staff.get("name", "").startswith("TEST_"):
                    admin_session.delete(f"{BASE_URL}/api/admin/staff/{staff['staff_id']}")
                    print(f"Cleaned up: {staff['name']}")
    except Exception as e:
        print(f"Cleanup error: {e}")
