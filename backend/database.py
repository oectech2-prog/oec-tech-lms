from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import HTTPException
from pathlib import Path
from dotenv import load_dotenv
import os
import logging
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "oec-tech-institute"
storage_key = None


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not available")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not available")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


async def create_indexes():
    await db.users.create_index("user_id", unique=True)
    await db.users.create_index("email")
    await db.users.create_index("role")
    await db.user_sessions.create_index("session_token", unique=True)
    await db.user_sessions.create_index("user_id")
    await db.courses.create_index("course_id", unique=True)
    await db.enrollments.create_index("enrollment_id", unique=True)
    await db.enrollments.create_index("user_id")
    await db.enrollments.create_index("course_id")
    await db.enrollments.create_index("payment_status")
    await db.diploma_enrollments.create_index("enrollment_id", unique=True)
    await db.diploma_enrollments.create_index("user_id")
    await db.diploma_tracks.create_index("track_id", unique=True)
    await db.assignment_submissions.create_index("submission_id", unique=True)
    await db.assignment_submissions.create_index("user_id")
    await db.assignment_submissions.create_index("enrollment_id")
    await db.assignment_submissions.create_index("status")
    await db.reviews.create_index("review_id", unique=True)
    await db.certificates.create_index("enrollment_id")
    await db.certificates.create_index("certificate_id", unique=True)
    await db.files.create_index("storage_path")
    await db.admission_forms.create_index("form_id", unique=True)
    await db.contact_messages.create_index("message_id", unique=True)
    logger.info("MongoDB indexes created")
