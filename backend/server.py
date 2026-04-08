from fastapi import FastAPI, APIRouter, HTTPException, Header, Query, UploadFile, File, Response, Cookie
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import requests
import asyncio

try:
    import resend
    resend.api_key = os.environ.get("RESEND_API_KEY", "")
    HAS_RESEND = bool(resend.api_key)
except ImportError:
    HAS_RESEND = False

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Object Storage Setup
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
        logging.error(f"Storage init failed: {e}")
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

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ PYDANTIC MODELS ============

class Lesson(BaseModel):
    lesson_id: str = Field(default_factory=lambda: f"lesson_{uuid.uuid4().hex[:8]}")
    title: str
    video_type: str = "youtube"  # youtube, vimeo, upload, external
    video_url: str = ""
    duration: str = "10 min"

class Assignment(BaseModel):
    assignment_id: str = Field(default_factory=lambda: f"assign_{uuid.uuid4().hex[:8]}")
    title: str
    description: str
    is_final_project: bool = False

class Week(BaseModel):
    week_number: int
    title: str
    description: str = ""
    lessons: List[Lesson] = []
    assignment: Optional[Assignment] = None

class CourseCreate(BaseModel):
    title: str
    description: str
    short_description: str
    price: float
    currency: str = "PKR"
    image_url: str = ""
    category: str = ""
    duration: str = ""
    level: str = "Beginner"
    instructor: str = "Hussnain Academy"
    intro_video_url: str = ""
    intro_video_type: str = "youtube"
    requirements: List[str] = []
    what_you_will_learn: List[str] = []
    weeks: List[Week] = []

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    course_id: str
    title: str
    description: str
    short_description: str
    price: float
    currency: str = "PKR"
    image_url: str
    category: str
    duration: str
    level: str
    instructor: str
    intro_video_url: str = ""
    intro_video_type: str = "youtube"
    requirements: List[str] = []
    what_you_will_learn: List[str] = []
    weeks: List[Week] = []
    is_published: bool = True
    created_at: str = ""

class EnrollmentCreate(BaseModel):
    course_id: str
    payment_method: str  # jazzcash, easypaisa, bank_transfer
    payment_proof: str = ""  # optional proof text/reference

class ProgressUpdate(BaseModel):
    lesson_id: str
    completed: bool

class AssignmentSubmission(BaseModel):
    assignment_id: str
    content: str  # text answer or link

class ReviewCreate(BaseModel):
    course_id: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    comment: str

class ContactMessage(BaseModel):
    name: str
    email: str
    subject: str = ""
    message: str

class PaymentStatusUpdate(BaseModel):
    payment_status: str  # pending, completed, rejected

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "student"
    created_at: str = ""

# ============ AUTH HELPER ============

async def get_current_user(authorization: str = Header(None), session_token: str = Cookie(None)) -> User:
    token = None
    if session_token:
        token = session_token
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user_doc)

async def require_admin(authorization: str = Header(None), session_token: str = Cookie(None)) -> User:
    user = await get_current_user(authorization, session_token)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/session")
async def create_session(request_data: dict):
    """Exchange session_id for session_token"""
    session_id = request_data.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    try:
        resp = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
            timeout=10
        )
        resp.raise_for_status()
        data = resp.json()

        user_doc = await db.users.find_one({"email": data["email"]}, {"_id": 0})
        if user_doc:
            user_id = user_doc["user_id"]
            # Update name/picture if changed
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"name": data["name"], "picture": data.get("picture")}}
            )
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            await db.users.insert_one({
                "user_id": user_id,
                "email": data["email"],
                "name": data["name"],
                "picture": data.get("picture"),
                "role": "student",
                "created_at": datetime.now(timezone.utc).isoformat()
            })

        session_token = data["session_token"]
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        response = JSONResponse(content={"user": user, "session_token": session_token})
        response.set_cookie(
            key="session_token", value=session_token,
            httponly=True, secure=True, samesite="none",
            path="/", max_age=7*24*60*60
        )
        return response
    except requests.exceptions.RequestException as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=400, detail="Authentication failed")

@api_router.get("/auth/me")
async def get_me(authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    return user

@api_router.post("/auth/logout")
async def logout(authorization: str = Header(None), session_token: str = Cookie(None)):
    token = session_token or (authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None)
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie(key="session_token", path="/")
    return response

# ============ COURSE ENDPOINTS ============

@api_router.get("/courses")
async def get_courses():
    courses = await db.courses.find({"is_published": True}, {"_id": 0}).to_list(1000)
    return courses

@api_router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@api_router.post("/admin/courses")
async def create_course(course_data: CourseCreate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    course_id = f"course_{uuid.uuid4().hex[:8]}"
    doc = {
        "course_id": course_id,
        **course_data.model_dump(),
        "is_published": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.courses.insert_one(doc)
    result = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    return result

@api_router.put("/admin/courses/{course_id}")
async def update_course(course_id: str, course_data: CourseCreate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    await db.courses.update_one({"course_id": course_id}, {"$set": course_data.model_dump()})
    result = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    return result

@api_router.delete("/admin/courses/{course_id}")
async def delete_course(course_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    await db.courses.delete_one({"course_id": course_id})
    return {"message": "Course deleted"}

# ============ ENROLLMENT ENDPOINTS ============

@api_router.post("/enrollments")
async def create_enrollment(data: EnrollmentCreate, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    existing = await db.enrollments.find_one({"user_id": user.user_id, "course_id": data.course_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    course = await db.courses.find_one({"course_id": data.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment_id = f"enroll_{uuid.uuid4().hex[:8]}"
    enrollment = {
        "enrollment_id": enrollment_id,
        "user_id": user.user_id,
        "course_id": data.course_id,
        "payment_status": "pending",
        "payment_method": data.payment_method,
        "payment_proof": data.payment_proof,
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
        "progress": 0,
        "completed_lessons": [],
        "submitted_assignments": []
    }
    await db.enrollments.insert_one(enrollment)
    result = await db.enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
    return result

@api_router.get("/enrollments/my-courses")
async def get_my_courses(authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    enrollments = await db.enrollments.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    result = []
    for enrollment in enrollments:
        course = await db.courses.find_one({"course_id": enrollment["course_id"]}, {"_id": 0})
        if course:
            result.append({"enrollment": enrollment, "course": course})
    return result

@api_router.put("/enrollments/{enrollment_id}/progress")
async def update_progress(enrollment_id: str, data: ProgressUpdate, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    enrollment = await db.enrollments.find_one({"enrollment_id": enrollment_id, "user_id": user.user_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    if enrollment["payment_status"] != "completed":
        raise HTTPException(status_code=403, detail="Payment not completed")

    completed = enrollment.get("completed_lessons", [])
    if data.completed and data.lesson_id not in completed:
        completed.append(data.lesson_id)
    elif not data.completed and data.lesson_id in completed:
        completed.remove(data.lesson_id)

    course = await db.courses.find_one({"course_id": enrollment["course_id"]}, {"_id": 0})
    total_lessons = sum(len(w.get("lessons", [])) for w in course.get("weeks", []))
    progress = int((len(completed) / total_lessons) * 100) if total_lessons > 0 else 0

    await db.enrollments.update_one(
        {"enrollment_id": enrollment_id},
        {"$set": {"completed_lessons": completed, "progress": progress}}
    )
    return {"progress": progress, "completed_lessons": completed}

@api_router.post("/enrollments/{enrollment_id}/submit-assignment")
async def submit_assignment(enrollment_id: str, data: AssignmentSubmission, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    enrollment = await db.enrollments.find_one({"enrollment_id": enrollment_id, "user_id": user.user_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    if enrollment["payment_status"] != "completed":
        raise HTTPException(status_code=403, detail="Payment not completed")

    submission = {
        "submission_id": f"sub_{uuid.uuid4().hex[:8]}",
        "enrollment_id": enrollment_id,
        "assignment_id": data.assignment_id,
        "user_id": user.user_id,
        "content": data.content,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "status": "submitted",
        "feedback": None
    }
    await db.assignment_submissions.insert_one(submission)

    # Update enrollment's submitted assignments
    submitted = enrollment.get("submitted_assignments", [])
    if data.assignment_id not in submitted:
        submitted.append(data.assignment_id)
        await db.enrollments.update_one(
            {"enrollment_id": enrollment_id},
            {"$set": {"submitted_assignments": submitted}}
        )

    return {"message": "Assignment submitted", "submission_id": submission["submission_id"]}

@api_router.get("/enrollments/{enrollment_id}/submissions")
async def get_submissions(enrollment_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    submissions = await db.assignment_submissions.find(
        {"enrollment_id": enrollment_id, "user_id": user.user_id}, {"_id": 0}
    ).to_list(1000)
    return submissions

# ============ DIPLOMA TRACKS ============

@api_router.get("/diploma-tracks")
async def get_diploma_tracks():
    tracks = await db.diploma_tracks.find({}, {"_id": 0}).to_list(1000)
    return tracks

@api_router.get("/diploma-tracks/{track_id}")
async def get_diploma_track(track_id: str):
    track = await db.diploma_tracks.find_one({"track_id": track_id}, {"_id": 0})
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return track

# ============ REVIEWS ============

@api_router.get("/reviews")
async def get_reviews():
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return reviews

@api_router.post("/reviews")
async def create_review(data: ReviewCreate, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    review_id = f"review_{uuid.uuid4().hex[:8]}"
    review = {
        "review_id": review_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "user_picture": user.picture,
        "course_id": data.course_id,
        "rating": data.rating,
        "comment": data.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review)
    result = await db.reviews.find_one({"review_id": review_id}, {"_id": 0})
    return result

# ============ CONTACT ============

@api_router.post("/contact")
async def contact(data: ContactMessage):
    msg = {
        "message_id": f"msg_{uuid.uuid4().hex[:8]}",
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(msg)
    return {"message": "Message sent successfully"}

# ============ ADMIN ENDPOINTS ============

@api_router.get("/admin/stats")
async def get_admin_stats(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    total_students = await db.users.count_documents({"role": "student"})
    total_courses = await db.courses.count_documents({})
    total_enrollments = await db.enrollments.count_documents({})
    pending_payments = await db.enrollments.count_documents({"payment_status": "pending"})
    total_reviews = await db.reviews.count_documents({})
    total_messages = await db.contact_messages.count_documents({})
    return {
        "total_students": total_students,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "pending_payments": pending_payments,
        "total_reviews": total_reviews,
        "total_messages": total_messages
    }

@api_router.get("/admin/students")
async def get_students(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    students = await db.users.find({"role": "student"}, {"_id": 0}).to_list(1000)
    return students

@api_router.get("/admin/enrollments")
async def get_all_enrollments(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    enrollments = await db.enrollments.find({}, {"_id": 0}).to_list(1000)
    result = []
    for e in enrollments:
        user = await db.users.find_one({"user_id": e["user_id"]}, {"_id": 0})
        course = await db.courses.find_one({"course_id": e["course_id"]}, {"_id": 0})
        result.append({"enrollment": e, "user": user, "course": course})
    return result

@api_router.put("/admin/enrollments/{enrollment_id}")
async def update_enrollment_status(enrollment_id: str, data: PaymentStatusUpdate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    await db.enrollments.update_one(
        {"enrollment_id": enrollment_id},
        {"$set": {"payment_status": data.payment_status}}
    )

    # Send email notification on approval
    if data.payment_status == "completed":
        enrollment = await db.enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
        if enrollment:
            user = await db.users.find_one({"user_id": enrollment["user_id"]}, {"_id": 0})
            course = await db.courses.find_one({"course_id": enrollment["course_id"]}, {"_id": 0})
            if user and course:
                await send_approval_email(user, course, enrollment)

    return {"message": "Enrollment updated"}

@api_router.get("/admin/courses")
async def admin_get_courses(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    courses = await db.courses.find({}, {"_id": 0}).to_list(1000)
    return courses

@api_router.get("/admin/messages")
async def get_messages(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return messages

# ============ EMAIL NOTIFICATION ============

SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

async def send_approval_email(user: dict, course: dict, enrollment: dict):
    """Send payment approval email to student"""
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#050505;color:#fff;padding:40px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="color:#D4AF37;margin:0;">OEC Tech Institute</h1>
        <p style="color:#A1A1AA;font-size:14px;">Payment Confirmed</p>
      </div>
      <p style="color:#fff;font-size:16px;">Hi {user.get('name', 'Student')},</p>
      <p style="color:#A1A1AA;font-size:14px;line-height:1.6;">
        Your payment for <strong style="color:#D4AF37;">{course.get('title', '')}</strong> has been verified and approved.
        You now have full lifetime access to all course materials.
      </p>
      <div style="background:#111;border:1px solid #27272A;border-radius:8px;padding:20px;margin:20px 0;">
        <p style="margin:5px 0;color:#A1A1AA;font-size:13px;">Course: <strong style="color:#fff;">{course.get('title', '')}</strong></p>
        <p style="margin:5px 0;color:#A1A1AA;font-size:13px;">Duration: <strong style="color:#fff;">{course.get('duration', '')}</strong></p>
        <p style="margin:5px 0;color:#A1A1AA;font-size:13px;">Payment Method: <strong style="color:#fff;">{enrollment.get('payment_method', '').replace('_',' ').title()}</strong></p>
        <p style="margin:5px 0;color:#A1A1AA;font-size:13px;">Status: <strong style="color:#22c55e;">Approved</strong></p>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="#" style="display:inline-block;background:#D4AF37;color:#050505;text-decoration:none;padding:12px 30px;border-radius:30px;font-weight:bold;font-size:14px;">Start Learning Now</a>
      </div>
      <p style="color:#A1A1AA;font-size:12px;text-align:center;border-top:1px solid #27272A;padding-top:20px;margin-top:30px;">
        OEC Tech Institute | info@oectechs.com
      </p>
    </div>
    """
    if HAS_RESEND:
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [user.get("email")],
                "subject": f"Payment Approved - {course.get('title', '')} | OEC Tech Institute",
                "html": html
            }
            await asyncio.to_thread(resend.Emails.send, params)
            logger.info(f"Approval email sent to {user.get('email')}")
        except Exception as e:
            logger.error(f"Email send failed: {e}")
    else:
        logger.info(f"[EMAIL MOCK] Payment approval email for {user.get('email')} - Course: {course.get('title')}")

# ============ CERTIFICATE GENERATION ============

@api_router.get("/certificates/{enrollment_id}")
async def get_certificate(enrollment_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    """Get certificate data for a completed course"""
    user = await get_current_user(authorization, session_token)
    enrollment = await db.enrollments.find_one({"enrollment_id": enrollment_id, "user_id": user.user_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    if enrollment["payment_status"] != "completed":
        raise HTTPException(status_code=403, detail="Payment not completed")
    if enrollment.get("progress", 0) < 100:
        raise HTTPException(status_code=403, detail="Course not completed yet")

    course = await db.courses.find_one({"course_id": enrollment["course_id"]}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    cert_id = f"OEC-{enrollment_id[-8:].upper()}-{uuid.uuid4().hex[:4].upper()}"

    # Check if certificate already exists
    existing = await db.certificates.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
    if existing:
        return existing

    cert = {
        "certificate_id": cert_id,
        "enrollment_id": enrollment_id,
        "user_id": user.user_id,
        "student_name": user.name,
        "course_title": course["title"],
        "course_category": course.get("category", ""),
        "completion_date": datetime.now(timezone.utc).isoformat(),
        "issued_by": "OEC Tech Institute",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.certificates.insert_one(cert)
    result = await db.certificates.find_one({"certificate_id": cert_id}, {"_id": 0})
    return result

# ============ FILE UPLOAD ============

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "application/octet-stream")
    await db.files.insert_one({
        "file_id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result["size"],
        "is_deleted": False,
        "uploaded_by": user.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"path": result["path"], "url": f"/api/files/{result['path']}"}

@api_router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))

# ============ STARTUP / SHUTDOWN ============

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.warning(f"Storage init failed (non-critical): {e}")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
