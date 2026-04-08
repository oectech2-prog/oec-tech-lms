"""
Backend API Tests for OEC Tech Institute - Iteration 6
Tests: Course pricing with admission fees, diploma tracks, policy pages
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Expected course prices based on requirements
EXPECTED_PRICES = {
    "Computer Applications": {"price": 6000, "admission_fee": 1000},
    "Graphic Designing": {"price": 12000, "admission_fee": 1000},
    "Social Media Marketing": {"price": 12000, "admission_fee": 1000},
    "WordPress Web Development": {"price": 12000, "admission_fee": 1000},
    "Shopify Dropshipping": {"price": 16000, "admission_fee": 2000},
    "Amazon Virtual Assistant": {"price": 20000, "admission_fee": 2000},
    "eBay Business": {"price": 20000, "admission_fee": 2000},
    "YouTube & TikTok Automation": {"price": 12000, "admission_fee": 1000},
}


class TestCoursesAPI:
    """Test course endpoints with pricing and admission fees"""
    
    def test_get_courses_returns_200(self):
        """GET /api/courses returns 200"""
        response = requests.get(f"{BASE_URL}/api/courses", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/courses returns 200")
    
    def test_courses_have_admission_fee_field(self):
        """All courses have admission_fee field"""
        response = requests.get(f"{BASE_URL}/api/courses", timeout=10)
        assert response.status_code == 200
        courses = response.json()
        
        for course in courses:
            assert "admission_fee" in course, f"Course '{course['title']}' missing admission_fee field"
            assert isinstance(course["admission_fee"], (int, float)), f"admission_fee should be numeric for '{course['title']}'"
        
        print(f"PASS: All {len(courses)} courses have admission_fee field")
    
    def test_course_prices_match_requirements(self):
        """Course prices match expected values"""
        response = requests.get(f"{BASE_URL}/api/courses", timeout=10)
        assert response.status_code == 200
        courses = response.json()
        
        mismatches = []
        for course in courses:
            title = course["title"]
            if title in EXPECTED_PRICES:
                expected = EXPECTED_PRICES[title]
                if course["price"] != expected["price"]:
                    mismatches.append(f"{title}: price expected {expected['price']}, got {course['price']}")
                if course.get("admission_fee") != expected["admission_fee"]:
                    mismatches.append(f"{title}: admission_fee expected {expected['admission_fee']}, got {course.get('admission_fee')}")
        
        if mismatches:
            pytest.fail("Price mismatches:\n" + "\n".join(mismatches))
        
        print("PASS: All course prices match requirements")
    
    def test_get_single_course_has_admission_fee(self):
        """GET /api/courses/{course_id} returns admission_fee"""
        # First get list to find a course_id
        response = requests.get(f"{BASE_URL}/api/courses", timeout=10)
        assert response.status_code == 200
        courses = response.json()
        assert len(courses) > 0, "No courses found"
        
        course_id = courses[0]["course_id"]
        detail_response = requests.get(f"{BASE_URL}/api/courses/{course_id}", timeout=10)
        assert detail_response.status_code == 200
        
        course = detail_response.json()
        assert "admission_fee" in course, f"Course detail missing admission_fee"
        assert "price" in course, f"Course detail missing price"
        
        print(f"PASS: Course detail for {course_id} has admission_fee={course['admission_fee']}")


class TestDiplomaTracksAPI:
    """Test diploma tracks endpoints"""
    
    def test_get_diploma_tracks_returns_200(self):
        """GET /api/diploma-tracks returns 200"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/diploma-tracks returns 200")
    
    def test_diploma_tracks_have_courses(self):
        """Diploma tracks have courses array"""
        response = requests.get(f"{BASE_URL}/api/diploma-tracks", timeout=10)
        assert response.status_code == 200
        tracks = response.json()
        
        assert len(tracks) >= 3, f"Expected at least 3 tracks, got {len(tracks)}"
        
        for track in tracks:
            assert "track_id" in track, f"Track missing track_id"
            assert "courses" in track, f"Track '{track.get('title')}' missing courses array"
            assert isinstance(track["courses"], list), f"courses should be a list"
            assert len(track["courses"]) > 0, f"Track '{track.get('title')}' has no courses"
        
        print(f"PASS: All {len(tracks)} diploma tracks have courses")
    
    def test_get_single_diploma_track(self):
        """GET /api/diploma-tracks/{track_id} returns track details"""
        # First get list to find a track_id
        response = requests.get(f"{BASE_URL}/api/diploma-tracks", timeout=10)
        assert response.status_code == 200
        tracks = response.json()
        assert len(tracks) > 0, "No tracks found"
        
        track_id = tracks[0]["track_id"]
        detail_response = requests.get(f"{BASE_URL}/api/diploma-tracks/{track_id}", timeout=10)
        assert detail_response.status_code == 200
        
        track = detail_response.json()
        assert track["track_id"] == track_id
        assert "title" in track
        assert "courses" in track
        assert "roadmap" in track
        assert "outcomes" in track
        
        print(f"PASS: Diploma track detail for {track_id} returned correctly")


class TestHealthAndBasicEndpoints:
    """Test basic API health"""
    
    def test_reviews_endpoint(self):
        """GET /api/reviews returns 200"""
        response = requests.get(f"{BASE_URL}/api/reviews", timeout=10)
        assert response.status_code == 200
        print("PASS: GET /api/reviews returns 200")
    
    def test_contact_endpoint(self):
        """POST /api/contact works"""
        response = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "Test message from automated testing"
        }, timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("PASS: POST /api/contact returns 200")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
