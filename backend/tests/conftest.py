"""Test configuration - loads credentials from environment."""
import os

BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:8001")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")
TEST_USER_EMAIL = os.environ.get("TEST_USER_EMAIL", "")
TEST_USER_PASSWORD = os.environ.get("TEST_USER_PASSWORD", "")
