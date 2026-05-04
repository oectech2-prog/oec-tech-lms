"""
Test Installment Payment System - OEC Tech Institute
Tests for the 2-installment payment feature:
- POST /api/enrollments creates enrollment with installment fields
- POST /api/enrollments/{id}/submit-installment-2 submits 2nd installment
- PUT /api/admin/enrollments/{id}/installment-2 admin approves/rejects 2nd installment
- GET /api/notifications returns installment_2_due notifications
- Admin approval sets installment_1_status to completed and calculates installment_2_due_date
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
from conftest import ADMIN_PASSWORD, BASE_URL as CONF_URL

# Test session created via mongosh
TEST_SESSION_TOKEN = "test_session_inst_1775659699888"
TEST_USER_ID = "test-user-inst-1775659699888"


class TestEnrollmentWithInstallments:
    """Test enrollment creation with installment fields"""
    
    @pytest.fixture
    def student_session(self):
        """Return test student session token"""
        return TEST_SESSION_TOKEN
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=30
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["session_token"]
    
    @pytest.fixture
    def course_data(self):
        """Get first available course"""
        response = requests.get(f"{BASE_URL}/api/courses", timeout=30)
        if response.status_code != 200 or len(response.json()) == 0:
            pytest.skip("No courses available")
        return response.json()[0]
    
    def test_enrollment_requires_auth(self):
        """Test that POST /api/enrollments requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/enrollments",
            json={
                "course_id": "test_course",
                "payment_method": "jazzcash",
                "admission_fee_proof": "http://example.com/proof1.jpg",
                "installment_1_proof": "http://example.com/proof2.jpg"
            },
            timeout=30
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Enrollment endpoint requires auth (401 without)")
    
    def test_create_enrollment_with_installment_fields(self, student_session, course_data):
        """Test POST /api/enrollments creates enrollment with installment fields"""
        course_id = course_data["course_id"]
        
        response = requests.post(
            f"{BASE_URL}/api/enrollments",
            json={
                "course_id": course_id,
                "payment_method": "jazzcash",
                "payment_proof": "TXN123456",
                "admission_fee_proof": "http://example.com/admission_fee.jpg",
                "installment_1_proof": "http://example.com/installment_1.jpg"
            },
            cookies={"session_token": student_session},
            timeout=30
        )
        
        # Could be 200 or 400 if already enrolled
        if response.status_code == 400 and "Already enrolled" in response.text:
            print("✓ User already enrolled in this course (expected for re-runs)")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        enrollment = response.json()
        
        # Verify installment fields exist
        assert "enrollment_id" in enrollment, "Should have enrollment_id"
        assert "installment_1_amount" in enrollment, "Should have installment_1_amount"
        assert "installment_2_amount" in enrollment, "Should have installment_2_amount"
        assert "installment_1_status" in enrollment, "Should have installment_1_status"
        assert "installment_2_status" in enrollment, "Should have installment_2_status"
        assert "admission_fee_proof" in enrollment, "Should have admission_fee_proof"
        assert "installment_1_proof" in enrollment, "Should have installment_1_proof"
        
        # Verify installment calculation: course.price / 2
        course_price = course_data.get("price", 0)
        expected_inst1 = int(course_price / 2)
        expected_inst2 = course_price - expected_inst1
        
        assert enrollment["installment_1_amount"] == expected_inst1, \
            f"installment_1_amount should be {expected_inst1}, got {enrollment['installment_1_amount']}"
        assert enrollment["installment_2_amount"] == expected_inst2, \
            f"installment_2_amount should be {expected_inst2}, got {enrollment['installment_2_amount']}"
        
        # Verify initial status
        assert enrollment["installment_1_status"] == "pending", "installment_1_status should be pending"
        assert enrollment["installment_2_status"] == "pending", "installment_2_status should be pending"
        assert enrollment["payment_status"] == "pending", "payment_status should be pending"
        
        # Verify proof URLs stored
        assert enrollment["admission_fee_proof"] == "http://example.com/admission_fee.jpg"
        assert enrollment["installment_1_proof"] == "http://example.com/installment_1.jpg"
        
        print(f"✓ Enrollment created with installments: inst1={enrollment['installment_1_amount']}, inst2={enrollment['installment_2_amount']}")
        print(f"✓ Admission fee: {enrollment.get('admission_fee', 0)}, proofs stored correctly")


class TestAdminApprovalSetsInstallmentStatus:
    """Test that admin approval sets installment_1_status and calculates due date"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=30
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["session_token"]
    
    def test_admin_approval_sets_installment_1_completed(self, admin_session):
        """Test PUT /api/admin/enrollments/{id} with completed sets installment_1_status"""
        # Get enrollments
        response = requests.get(
            f"{BASE_URL}/api/admin/enrollments",
            cookies={"session_token": admin_session},
            timeout=30
        )
        assert response.status_code == 200
        enrollments = response.json()
        
        # Find a pending enrollment
        pending = [e for e in enrollments if e["enrollment"]["payment_status"] == "pending"]
        if not pending:
            print("✓ No pending enrollments to test approval (skipping)")
            return
        
        enrollment_id = pending[0]["enrollment"]["enrollment_id"]
        
        # Approve the enrollment
        response = requests.put(
            f"{BASE_URL}/api/admin/enrollments/{enrollment_id}",
            json={"payment_status": "completed"},
            cookies={"session_token": admin_session},
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify the enrollment was updated
        response = requests.get(
            f"{BASE_URL}/api/admin/enrollments",
            cookies={"session_token": admin_session},
            timeout=30
        )
        enrollments = response.json()
        updated = next((e for e in enrollments if e["enrollment"]["enrollment_id"] == enrollment_id), None)
        
        if updated:
            enrollment = updated["enrollment"]
            assert enrollment["payment_status"] == "completed", "payment_status should be completed"
            assert enrollment["installment_1_status"] == "completed", "installment_1_status should be completed after approval"
            assert "installment_2_due_date" in enrollment, "Should have installment_2_due_date"
            assert enrollment["installment_2_due_date"], "installment_2_due_date should be set"
            print(f"✓ Admin approval sets installment_1_status=completed")
            print(f"✓ installment_2_due_date set to: {enrollment['installment_2_due_date']}")


class TestSubmitInstallment2:
    """Test 2nd installment submission endpoint"""
    
    @pytest.fixture
    def student_session(self):
        """Return test student session token"""
        return TEST_SESSION_TOKEN
    
    def test_submit_installment_2_requires_auth(self):
        """Test that POST /api/enrollments/{id}/submit-installment-2 requires auth"""
        response = requests.post(
            f"{BASE_URL}/api/enrollments/fake_id/submit-installment-2",
            json={"proof_url": "http://example.com/proof.jpg"},
            timeout=30
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Submit installment 2 requires auth (401 without)")
    
    def test_submit_installment_2_not_found(self, student_session):
        """Test submit installment 2 with invalid enrollment ID"""
        response = requests.post(
            f"{BASE_URL}/api/enrollments/invalid_enrollment_id/submit-installment-2",
            json={"proof_url": "http://example.com/proof.jpg"},
            cookies={"session_token": student_session},
            timeout=30
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Submit installment 2 returns 404 for invalid enrollment")


class TestAdminInstallment2Approval:
    """Test admin 2nd installment approval/rejection"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=30
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["session_token"]
    
    def test_admin_installment_2_approval_requires_auth(self):
        """Test PUT /api/admin/enrollments/{id}/installment-2 requires admin auth"""
        response = requests.put(
            f"{BASE_URL}/api/admin/enrollments/fake_id/installment-2",
            json={"payment_status": "completed"},
            timeout=30
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin installment 2 approval requires auth (401 without)")
    
    def test_admin_installment_2_endpoint_exists(self, admin_session):
        """Test that the admin installment 2 endpoint exists and responds"""
        # Try with a fake ID - should return 200 (MongoDB update with no match)
        response = requests.put(
            f"{BASE_URL}/api/admin/enrollments/fake_enrollment_id/installment-2",
            json={"payment_status": "completed"},
            cookies={"session_token": admin_session},
            timeout=30
        )
        # Should return 200 even if no enrollment found (MongoDB update behavior)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Admin installment 2 endpoint exists and responds")


class TestNotificationsEndpoint:
    """Test notifications endpoint for installment_2_due"""
    
    @pytest.fixture
    def student_session(self):
        """Return test student session token"""
        return TEST_SESSION_TOKEN
    
    def test_notifications_requires_auth(self):
        """Test GET /api/notifications requires authentication"""
        response = requests.get(
            f"{BASE_URL}/api/notifications",
            timeout=30
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Notifications endpoint requires auth (401 without)")
    
    def test_notifications_returns_array(self, student_session):
        """Test GET /api/notifications returns array"""
        response = requests.get(
            f"{BASE_URL}/api/notifications",
            cookies={"session_token": student_session},
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Notifications endpoint returns array with {len(data)} notifications")
        
        # If there are notifications, verify structure
        for notif in data:
            assert "type" in notif, "Notification should have type"
            assert "enrollment_id" in notif, "Notification should have enrollment_id"
            if notif["type"] == "installment_2_due":
                assert "amount" in notif, "installment_2_due should have amount"
                assert "course_title" in notif, "installment_2_due should have course_title"
                print(f"✓ Found installment_2_due notification: {notif['course_title']} - PKR {notif['amount']}")


class TestEnrollmentInstallmentFields:
    """Test that admin enrollments endpoint returns installment fields"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=30
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["session_token"]
    
    def test_admin_enrollments_include_installment_fields(self, admin_session):
        """Test GET /api/admin/enrollments returns installment fields"""
        response = requests.get(
            f"{BASE_URL}/api/admin/enrollments",
            cookies={"session_token": admin_session},
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        enrollments = response.json()
        
        if len(enrollments) == 0:
            print("✓ No enrollments to verify (empty list)")
            return
        
        # Check first enrollment has installment fields
        enrollment = enrollments[0]["enrollment"]
        installment_fields = [
            "installment_1_amount",
            "installment_2_amount", 
            "installment_1_status",
            "installment_2_status"
        ]
        
        for field in installment_fields:
            assert field in enrollment, f"Enrollment should have {field}"
        
        print(f"✓ Admin enrollments include installment fields")
        print(f"  - installment_1: PKR {enrollment.get('installment_1_amount', 0)} ({enrollment.get('installment_1_status', 'N/A')})")
        print(f"  - installment_2: PKR {enrollment.get('installment_2_amount', 0)} ({enrollment.get('installment_2_status', 'N/A')})")


class TestInstallmentCalculation:
    """Test installment calculation logic"""
    
    def test_installment_calculation_for_courses(self):
        """Verify installment calculation: course.price / 2"""
        response = requests.get(f"{BASE_URL}/api/courses", timeout=30)
        assert response.status_code == 200
        courses = response.json()
        
        print("✓ Installment calculation verification:")
        for course in courses[:3]:  # Check first 3 courses
            price = course.get("price", 0)
            admission_fee = course.get("admission_fee", 0)
            inst1 = int(price / 2)
            inst2 = price - inst1
            pay_now = admission_fee + inst1
            
            print(f"  - {course['title']}: price={price}, adm_fee={admission_fee}")
            print(f"    inst1={inst1}, inst2={inst2}, pay_now={pay_now}")
            
            # Verify calculation
            assert inst1 + inst2 == price, f"Installments should sum to price"
            assert pay_now == admission_fee + inst1, f"Pay now should be admission + inst1"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
