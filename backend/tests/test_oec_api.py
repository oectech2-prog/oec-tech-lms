"""
OEC Tech Institute API Tests
Tests for: courses, reviews, diploma-tracks, contact, certificates
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://learn-hussnain.preview.emergentagent.com')

class TestCoursesAPI:
    """Course listing and detail endpoint tests"""
    
    def test_get_courses_returns_list(self):
        """GET /api/courses should return list of courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ GET /api/courses returned {len(data)} courses")
    
    def test_courses_have_required_fields(self):
        """Courses should have all required fields"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        courses = response.json()
        
        required_fields = ['course_id', 'title', 'description', 'price', 'image_url', 'category', 'duration', 'level']
        for course in courses[:3]:  # Check first 3 courses
            for field in required_fields:
                assert field in course, f"Missing field: {field} in course {course.get('title', 'unknown')}"
        print(f"✓ Courses have all required fields")
    
    def test_get_single_course(self):
        """GET /api/courses/:id should return course details"""
        # First get list to get a valid course_id
        response = requests.get(f"{BASE_URL}/api/courses")
        courses = response.json()
        course_id = courses[0]['course_id']
        
        # Get single course
        response = requests.get(f"{BASE_URL}/api/courses/{course_id}")
        assert response.status_code == 200
        course = response.json()
        assert course['course_id'] == course_id
        assert 'weeks' in course
        print(f"✓ GET /api/courses/{course_id} returned course with {len(course.get('weeks', []))} weeks")
    
    def test_course_has_weekly_structure(self):
        """Course should have weekly outline with lessons"""
        response = requests.get(f"{BASE_URL}/api/courses")
        courses = response.json()
        course_id = courses[0]['course_id']
        
        response = requests.get(f"{BASE_URL}/api/courses/{course_id}")
        course = response.json()
        
        assert 'weeks' in course
        assert len(course['weeks']) > 0
        
        week = course['weeks'][0]
        assert 'week_number' in week
        assert 'title' in week
        assert 'lessons' in week
        print(f"✓ Course has weekly structure with lessons")
    
    def test_course_not_found(self):
        """GET /api/courses/:invalid_id should return 404"""
        response = requests.get(f"{BASE_URL}/api/courses/invalid_course_id_12345")
        assert response.status_code == 404
        print(f"✓ Invalid course returns 404")


class TestReviewsAPI:
    """Reviews endpoint tests - should have 100+ reviews"""
    
    def test_get_reviews_returns_list(self):
        """GET /api/reviews should return list of reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/reviews returned {len(data)} reviews")
    
    def test_reviews_count_over_100(self):
        """Should have 100+ reviews as per requirements"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        reviews = response.json()
        assert len(reviews) >= 100, f"Expected 100+ reviews, got {len(reviews)}"
        print(f"✓ Reviews count: {len(reviews)} (meets 100+ requirement)")
    
    def test_reviews_have_required_fields(self):
        """Reviews should have required fields"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        reviews = response.json()
        
        required_fields = ['review_id', 'user_name', 'rating', 'comment']
        for review in reviews[:5]:
            for field in required_fields:
                assert field in review, f"Missing field: {field}"
        print(f"✓ Reviews have all required fields")
    
    def test_reviews_have_country_codes(self):
        """Reviews should have country codes for filtering"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        reviews = response.json()
        
        countries = set()
        for review in reviews:
            if 'user_country' in review:
                countries.add(review['user_country'])
        
        expected_countries = {'PK', 'AE', 'GB', 'US'}
        assert countries.intersection(expected_countries), f"Expected countries from {expected_countries}, got {countries}"
        print(f"✓ Reviews have country codes: {countries}")
    
    def test_reviews_have_valid_ratings(self):
        """Ratings should be between 1-5"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        reviews = response.json()
        
        for review in reviews:
            assert 1 <= review['rating'] <= 5, f"Invalid rating: {review['rating']}"
        print(f"✓ All reviews have valid ratings (1-5)")


class TestDiplomaTracksAPI:
    """Diploma tracks endpoint tests"""
    
    def test_get_diploma_tracks(self):
        """GET /api/diploma-tracks should return tracks"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ GET /api/diploma-tracks returned {len(data)} tracks")
    
    def test_tracks_have_required_fields(self):
        """Tracks should have required fields"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks")
        tracks = response.json()
        
        required_fields = ['track_id', 'title', 'description', 'courses']
        for track in tracks:
            for field in required_fields:
                assert field in track, f"Missing field: {field}"
        print(f"✓ Diploma tracks have all required fields")
    
    def test_tracks_have_courses_list(self):
        """Each track should have a list of courses"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks")
        tracks = response.json()
        
        for track in tracks:
            assert isinstance(track['courses'], list)
            assert len(track['courses']) > 0
        print(f"✓ All tracks have course lists")


class TestContactAPI:
    """Contact form endpoint tests"""
    
    def test_contact_form_submission(self):
        """POST /api/contact should accept contact form"""
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message from automated testing"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert 'message' in data
        print(f"✓ Contact form submission successful")
    
    def test_contact_form_without_subject(self):
        """Contact form should work without subject (optional)"""
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "Test message without subject"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 200
        print(f"✓ Contact form works without subject")
    
    def test_contact_form_validation(self):
        """Contact form should validate required fields"""
        payload = {"name": "Test"}  # Missing email and message
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 422  # Validation error
        print(f"✓ Contact form validates required fields")


class TestCertificatesAPI:
    """Certificate endpoint tests"""
    
    def test_certificate_requires_auth(self):
        """GET /api/certificates/:id should require authentication"""
        response = requests.get(f"{BASE_URL}/api/certificates/test_enrollment_123")
        assert response.status_code == 401
        print(f"✓ Certificate endpoint requires authentication")
    
    def test_certificate_invalid_session(self):
        """Certificate with invalid session should return 401"""
        response = requests.get(
            f"{BASE_URL}/api/certificates/test_enrollment_123",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401
        print(f"✓ Invalid session returns 401")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_auth_me_requires_auth(self):
        """GET /api/auth/me should require authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print(f"✓ /api/auth/me requires authentication")
    
    def test_logout_works(self):
        """POST /api/auth/logout should work"""
        response = requests.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        print(f"✓ Logout endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
