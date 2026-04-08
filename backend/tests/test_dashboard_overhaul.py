"""
Test suite for Iteration 12: Comprehensive Admin Dashboard Overhaul
Tests:
- GET /api/admin/stats - all new fields (total_diploma_students, admission_plus_inst1, inst2_total, monthly_revenue, month_name, students_this_month, total_pending_approval, defaulters_count, monthly_growth array)
- GET /api/admin/defaulters - returns array of defaulter records
- PUT /api/admin/defaulters/{id}/deactivate - sets enrollment to defaulter status
- PUT /api/admin/defaulters/{id}/activate - re-activates enrollment
- GET /api/admin/admission-forms - includes installment_1_url and installment_2_url fields
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_PASSWORD = "OEC@Admin#2026!Secure"


class TestAdminLogin:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Admin login with correct password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "user" in data, "Response should contain user"
        assert "session_token" in data, "Response should contain session_token"
        assert data["user"]["role"] == "admin", "User role should be admin"
        print(f"✓ Admin login successful, session_token received")
    
    def test_admin_login_wrong_password(self):
        """Admin login with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "wrongpassword"})
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Admin login with wrong password correctly returns 401")


class TestAdminStats:
    """Tests for GET /api/admin/stats - comprehensive dashboard stats"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, "Admin login failed"
        self.session_token = response.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.session_token}"}
    
    def test_admin_stats_requires_auth(self):
        """Stats endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print(f"✓ /api/admin/stats requires authentication")
    
    def test_admin_stats_returns_all_fields(self):
        """Stats endpoint returns all required fields"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Check all required fields exist
        required_fields = [
            "total_students",
            "total_courses",
            "total_enrollments",
            "total_diploma_students",
            "pending_payments",
            "approved_payments",
            "admission_plus_inst1",
            "inst2_total",
            "monthly_revenue",
            "month_name",
            "students_this_month",
            "total_pending_approval",
            "defaulters_count",
            "monthly_growth"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
            print(f"  ✓ Field '{field}' present: {data[field]}")
        
        print(f"✓ All 14 required fields present in /api/admin/stats response")
    
    def test_admin_stats_monthly_growth_structure(self):
        """monthly_growth is an array of 6 objects with month/students/enrollments"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        monthly_growth = data.get("monthly_growth", [])
        assert isinstance(monthly_growth, list), "monthly_growth should be a list"
        assert len(monthly_growth) == 6, f"monthly_growth should have 6 items, got {len(monthly_growth)}"
        
        for item in monthly_growth:
            assert "month" in item, "Each item should have 'month'"
            assert "students" in item, "Each item should have 'students'"
            assert "enrollments" in item, "Each item should have 'enrollments'"
            assert isinstance(item["students"], int), "students should be int"
            assert isinstance(item["enrollments"], int), "enrollments should be int"
        
        print(f"✓ monthly_growth has correct structure: {[m['month'] for m in monthly_growth]}")
    
    def test_admin_stats_numeric_fields(self):
        """Numeric fields are integers"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        numeric_fields = [
            "total_students", "total_courses", "total_enrollments", "total_diploma_students",
            "pending_payments", "approved_payments", "admission_plus_inst1", "inst2_total",
            "monthly_revenue", "students_this_month", "total_pending_approval", "defaulters_count"
        ]
        
        for field in numeric_fields:
            assert isinstance(data[field], (int, float)), f"{field} should be numeric, got {type(data[field])}"
        
        print(f"✓ All numeric fields have correct types")
    
    def test_admin_stats_month_name_format(self):
        """month_name is a string like 'January 2026'"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        month_name = data.get("month_name", "")
        assert isinstance(month_name, str), "month_name should be string"
        assert len(month_name) > 0, "month_name should not be empty"
        # Should contain year
        assert "202" in month_name, f"month_name should contain year, got: {month_name}"
        
        print(f"✓ month_name format correct: {month_name}")


class TestDefaulters:
    """Tests for defaulters endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, "Admin login failed"
        self.session_token = response.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.session_token}"}
    
    def test_get_defaulters_requires_auth(self):
        """GET /api/admin/defaulters requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/defaulters")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print(f"✓ /api/admin/defaulters requires authentication")
    
    def test_get_defaulters_returns_array(self):
        """GET /api/admin/defaulters returns array"""
        response = requests.get(f"{BASE_URL}/api/admin/defaulters", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ /api/admin/defaulters returns array with {len(data)} items")
        
        # If there are defaulters, check structure
        if len(data) > 0:
            item = data[0]
            assert "enrollment" in item, "Each item should have 'enrollment'"
            assert "user" in item, "Each item should have 'user'"
            assert "type" in item, "Each item should have 'type' (course/diploma)"
            assert "due_date" in item, "Each item should have 'due_date'"
            assert "amount" in item, "Each item should have 'amount'"
            print(f"  ✓ Defaulter record structure verified")
    
    def test_deactivate_requires_auth(self):
        """PUT /api/admin/defaulters/{id}/deactivate requires auth"""
        response = requests.put(f"{BASE_URL}/api/admin/defaulters/fake_id/deactivate")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print(f"✓ /api/admin/defaulters/{{id}}/deactivate requires authentication")
    
    def test_activate_requires_auth(self):
        """PUT /api/admin/defaulters/{id}/activate requires auth"""
        response = requests.put(f"{BASE_URL}/api/admin/defaulters/fake_id/activate")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print(f"✓ /api/admin/defaulters/{{id}}/activate requires authentication")
    
    def test_deactivate_invalid_id_returns_404(self):
        """PUT /api/admin/defaulters/{invalid_id}/deactivate returns 404"""
        response = requests.put(f"{BASE_URL}/api/admin/defaulters/invalid_enrollment_id/deactivate", headers=self.headers)
        assert response.status_code == 404, f"Expected 404 for invalid ID, got {response.status_code}"
        print(f"✓ Deactivate with invalid ID returns 404")
    
    def test_activate_invalid_id_returns_404(self):
        """PUT /api/admin/defaulters/{invalid_id}/activate returns 404"""
        response = requests.put(f"{BASE_URL}/api/admin/defaulters/invalid_enrollment_id/activate", headers=self.headers)
        assert response.status_code == 404, f"Expected 404 for invalid ID, got {response.status_code}"
        print(f"✓ Activate with invalid ID returns 404")


class TestAdmissionForms:
    """Tests for GET /api/admin/admission-forms with installment URLs"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, "Admin login failed"
        self.session_token = response.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.session_token}"}
    
    def test_admission_forms_requires_auth(self):
        """GET /api/admin/admission-forms requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/admission-forms")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print(f"✓ /api/admin/admission-forms requires authentication")
    
    def test_admission_forms_returns_array(self):
        """GET /api/admin/admission-forms returns array"""
        response = requests.get(f"{BASE_URL}/api/admin/admission-forms", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ /api/admin/admission-forms returns array with {len(data)} items")
    
    def test_admission_forms_include_installment_urls(self):
        """Admission forms include installment_1_url and installment_2_url fields"""
        response = requests.get(f"{BASE_URL}/api/admin/admission-forms", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            form = data[0]
            # These fields should be present (even if empty string)
            assert "installment_1_url" in form, "Form should have 'installment_1_url' field"
            assert "installment_2_url" in form, "Form should have 'installment_2_url' field"
            print(f"✓ Admission form includes installment_1_url: '{form.get('installment_1_url', '')[:50]}...'")
            print(f"✓ Admission form includes installment_2_url: '{form.get('installment_2_url', '')[:50]}...'")
        else:
            # No forms exist, but endpoint works
            print(f"✓ No admission forms in database, but endpoint works correctly")


class TestExistingEndpoints:
    """Verify existing endpoints still work"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, "Admin login failed"
        self.session_token = response.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.session_token}"}
    
    def test_get_courses(self):
        """GET /api/courses returns array"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ /api/courses returns {len(data)} courses")
    
    def test_get_admin_students(self):
        """GET /api/admin/students returns array"""
        response = requests.get(f"{BASE_URL}/api/admin/students", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ /api/admin/students returns {len(data)} students")
    
    def test_get_admin_enrollments(self):
        """GET /api/admin/enrollments returns array"""
        response = requests.get(f"{BASE_URL}/api/admin/enrollments", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ /api/admin/enrollments returns {len(data)} enrollments")
    
    def test_get_diploma_tracks(self):
        """GET /api/diploma-tracks returns array"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ /api/diploma-tracks returns {len(data)} tracks")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
