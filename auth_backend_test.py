import requests
import sys
from datetime import datetime
import json

class AuthenticatedAPITester:
    def __init__(self, base_url="https://learn-hussnain.preview.emergentagent.com"):
        self.base_url = base_url
        self.student_token = "test_session_1775565356008"
        self.admin_token = "admin_session_1775565356008"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_student_auth(self):
        """Test student authentication endpoints"""
        print("\n" + "="*50)
        print("TESTING STUDENT AUTHENTICATION")
        print("="*50)
        
        # Test auth/me with student token
        success, user_data = self.run_test("Get Current User (Student)", "GET", "auth/me", 200, token=self.student_token)
        if success:
            print(f"   User: {user_data.get('name', 'Unknown')}")
            print(f"   Role: {user_data.get('role', 'Unknown')}")
        
        # Test my courses
        self.run_test("Get My Courses (Student)", "GET", "enrollments/my-courses", 200, token=self.student_token)
        
        # Test course enrollment
        enrollment_data = {
            "course_id": "course_comp_apps",
            "payment_method": "jazzcash",
            "payment_proof": "Test payment JC123456"
        }
        success, enrollment = self.run_test("Create Enrollment", "POST", "enrollments", 200, enrollment_data, token=self.student_token)
        if success:
            print(f"   Enrollment ID: {enrollment.get('enrollment_id', 'Unknown')}")
            return enrollment.get('enrollment_id')
        return None

    def test_admin_auth(self):
        """Test admin authentication endpoints"""
        print("\n" + "="*50)
        print("TESTING ADMIN AUTHENTICATION")
        print("="*50)
        
        # Test auth/me with admin token
        success, user_data = self.run_test("Get Current User (Admin)", "GET", "auth/me", 200, token=self.admin_token)
        if success:
            print(f"   User: {user_data.get('name', 'Unknown')}")
            print(f"   Role: {user_data.get('role', 'Unknown')}")
        
        # Test admin stats
        success, stats = self.run_test("Get Admin Stats", "GET", "admin/stats", 200, token=self.admin_token)
        if success:
            print(f"   Total Students: {stats.get('total_students', 0)}")
            print(f"   Total Courses: {stats.get('total_courses', 0)}")
            print(f"   Total Enrollments: {stats.get('total_enrollments', 0)}")
        
        # Test admin students
        self.run_test("Get Admin Students", "GET", "admin/students", 200, token=self.admin_token)
        
        # Test admin enrollments
        success, enrollments = self.run_test("Get Admin Enrollments", "GET", "admin/enrollments", 200, token=self.admin_token)
        if success and enrollments:
            print(f"   Found {len(enrollments)} enrollments")
            return enrollments
        return []

    def test_enrollment_management(self, enrollments):
        """Test enrollment status management"""
        print("\n" + "="*50)
        print("TESTING ENROLLMENT MANAGEMENT")
        print("="*50)
        
        if not enrollments:
            print("⚠️  No enrollments to test")
            return
        
        # Find a pending enrollment
        pending_enrollment = None
        for enrollment_data in enrollments:
            enrollment = enrollment_data.get('enrollment', {})
            if enrollment.get('payment_status') == 'pending':
                pending_enrollment = enrollment
                break
        
        if pending_enrollment:
            enrollment_id = pending_enrollment.get('enrollment_id')
            
            # Test approve enrollment
            approve_data = {"payment_status": "completed"}
            self.run_test("Approve Enrollment", "PUT", f"admin/enrollments/{enrollment_id}", 200, approve_data, token=self.admin_token)
            
            # Test reject enrollment (change it back to pending first, then reject)
            pending_data = {"payment_status": "pending"}
            self.run_test("Set Enrollment Pending", "PUT", f"admin/enrollments/{enrollment_id}", 200, pending_data, token=self.admin_token)
            
            reject_data = {"payment_status": "rejected"}
            self.run_test("Reject Enrollment", "PUT", f"admin/enrollments/{enrollment_id}", 200, reject_data, token=self.admin_token)

    def test_reviews_and_contact(self):
        """Test review creation and contact functionality"""
        print("\n" + "="*50)
        print("TESTING REVIEWS AND CONTACT")
        print("="*50)
        
        # Test review creation
        review_data = {
            "course_id": "course_comp_apps",
            "rating": 5,
            "comment": "Excellent course! Learned a lot about computer applications."
        }
        self.run_test("Create Review", "POST", "reviews", 200, review_data, token=self.student_token)

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("AUTHENTICATED API TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   - {test}")
        
        return self.tests_passed >= self.tests_run * 0.8

def main():
    print("🔐 Starting Authenticated API Tests")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = AuthenticatedAPITester()
    
    # Test student authentication
    enrollment_id = tester.test_student_auth()
    
    # Test admin authentication
    enrollments = tester.test_admin_auth()
    
    # Test enrollment management
    tester.test_enrollment_management(enrollments)
    
    # Test reviews and contact
    tester.test_reviews_and_contact()
    
    # Print summary
    success = tester.print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())