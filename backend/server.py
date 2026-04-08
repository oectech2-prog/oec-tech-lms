from fastapi import FastAPI, APIRouter, HTTPException, Header, Query, UploadFile, File, Response, Cookie
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import bcrypt
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
    admission_fee_proof: str = ""  # admission fee screenshot URL
    installment_1_proof: str = ""  # 1st installment screenshot URL

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

class AdminLoginRequest(BaseModel):
    password: str

class AdminStudentRemove(BaseModel):
    user_id: str

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

# ============ ADMIN PASSWORD AUTH ============

ADMIN_PASSWORD_HASH = bcrypt.hashpw(b"OEC@Admin#2026!Secure", bcrypt.gensalt()).decode()

@api_router.post("/admin/login")
async def admin_login(data: AdminLoginRequest):
    if not bcrypt.checkpw(data.password.encode(), ADMIN_PASSWORD_HASH.encode()):
        raise HTTPException(status_code=401, detail="Invalid password")

    admin = await db.users.find_one({"role": "admin"}, {"_id": 0})
    if not admin:
        admin_id = f"admin_{uuid.uuid4().hex[:8]}"
        admin = {
            "user_id": admin_id,
            "email": "admin@oectechs.com",
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin)
        admin = await db.users.find_one({"user_id": admin_id}, {"_id": 0})

    # Cleanup old admin sessions
    await db.user_sessions.delete_many({"user_id": admin["user_id"]})

    session_token_val = f"admin_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": admin["user_id"],
        "session_token": session_token_val,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    response = JSONResponse(content={"user": admin, "session_token": session_token_val})
    response.set_cookie(
        key="session_token", value=session_token_val,
        httponly=True, secure=True, samesite="none",
        path="/", max_age=24*60*60
    )
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
    # Calculate installments: course price divided into 2
    course_price = course.get("price", 0)
    admission_fee = course.get("admission_fee", 0)
    installment_1 = int(course_price / 2)
    installment_2 = course_price - installment_1

    # Parse course duration for halfway calculation (e.g. "5 Weeks" -> 5)
    duration_str = course.get("duration", "")
    total_weeks = 0
    for part in duration_str.split():
        if part.isdigit():
            total_weeks = int(part)
            break
    halfway_weeks = max(1, total_weeks // 2)

    enrollment = {
        "enrollment_id": enrollment_id,
        "user_id": user.user_id,
        "course_id": data.course_id,
        "payment_status": "pending",
        "payment_method": data.payment_method,
        "payment_proof": data.payment_proof,
        "admission_fee": admission_fee,
        "admission_fee_proof": data.admission_fee_proof,
        "installment_1_amount": installment_1,
        "installment_1_proof": data.installment_1_proof,
        "installment_1_status": "pending",
        "installment_2_amount": installment_2,
        "installment_2_proof": "",
        "installment_2_status": "pending",
        "installment_2_due_weeks": halfway_weeks,
        "installment_2_due_date": "",
        "installment_2_notified": False,
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
    approved_payments = await db.enrollments.count_documents({"payment_status": "completed"})
    total_reviews = await db.reviews.count_documents({})
    total_messages = await db.contact_messages.count_documents({})

    # Monthly revenue
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_enrollments = await db.enrollments.find(
        {"payment_status": "completed", "approved_at": {"$gte": month_start.isoformat()}}, {"_id": 0}
    ).to_list(1000)
    monthly_revenue = 0
    for e in month_enrollments:
        course = await db.courses.find_one({"course_id": e["course_id"]}, {"_id": 0})
        if course:
            monthly_revenue += (course.get("price", 0) + course.get("admission_fee", 0))

    # Students this month
    students_this_month = await db.users.count_documents({
        "role": "student",
        "created_at": {"$gte": month_start.isoformat()}
    })

    return {
        "total_students": total_students,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "pending_payments": pending_payments,
        "approved_payments": approved_payments,
        "total_reviews": total_reviews,
        "total_messages": total_messages,
        "monthly_revenue": monthly_revenue,
        "students_this_month": students_this_month,
    }

@api_router.get("/admin/students")
async def get_students(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    students = await db.users.find({"role": "student"}, {"_id": 0}).to_list(1000)
    result = []
    for s in students:
        enrollments = await db.enrollments.find({"user_id": s["user_id"]}, {"_id": 0}).to_list(100)
        approved = [e for e in enrollments if e.get("payment_status") == "completed"]
        total_lessons = 0
        completed_lessons = 0
        for e in approved:
            course = await db.courses.find_one({"course_id": e["course_id"]}, {"_id": 0})
            if course:
                total_lessons += sum(len(w.get("lessons", [])) for w in course.get("weeks", []))
                completed_lessons += len(e.get("completed_lessons", []))
        # Joining date = first approval date
        joining_date = None
        for e in enrollments:
            if e.get("approved_at"):
                if not joining_date or e["approved_at"] < joining_date:
                    joining_date = e["approved_at"]
        s["enrollments_count"] = len(enrollments)
        s["approved_courses"] = len(approved)
        s["total_lessons"] = total_lessons
        s["completed_lessons"] = completed_lessons
        s["joining_date"] = joining_date
        result.append(s)
    return result

@api_router.get("/admin/students/{user_id}/progress")
async def get_student_progress(user_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    student = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    enrollments = await db.enrollments.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    courses_progress = []
    for e in enrollments:
        course = await db.courses.find_one({"course_id": e["course_id"]}, {"_id": 0})
        if course:
            total_lessons = sum(len(w.get("lessons", [])) for w in course.get("weeks", []))
            courses_progress.append({
                "enrollment": e,
                "course_title": course["title"],
                "total_lessons": total_lessons,
                "completed_lessons": len(e.get("completed_lessons", [])),
                "progress": e.get("progress", 0),
                "submitted_assignments": e.get("submitted_assignments", []),
            })
    return {"student": student, "courses": courses_progress}

@api_router.delete("/admin/students/{user_id}")
async def remove_student(user_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    if user.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot remove admin")
    await db.users.delete_one({"user_id": user_id})
    await db.enrollments.delete_many({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.assignment_submissions.delete_many({"user_id": user_id})
    return {"message": "Student removed"}

@api_router.get("/admin/enrollments")
async def get_all_enrollments(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    enrollments = await db.enrollments.find({}, {"_id": 0}).sort("enrolled_at", -1).to_list(1000)
    result = []
    for e in enrollments:
        user = await db.users.find_one({"user_id": e["user_id"]}, {"_id": 0})
        course = await db.courses.find_one({"course_id": e["course_id"]}, {"_id": 0})
        result.append({"enrollment": e, "user": user, "course": course})
    return result

@api_router.put("/admin/enrollments/{enrollment_id}")
async def update_enrollment_status(enrollment_id: str, data: PaymentStatusUpdate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    update_fields = {"payment_status": data.payment_status}
    if data.payment_status == "completed":
        update_fields["approved_at"] = datetime.now(timezone.utc).isoformat()
        update_fields["installment_1_status"] = "completed"
        # Calculate installment 2 due date
        enrollment_doc = await db.enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
        if enrollment_doc:
            halfway_weeks = enrollment_doc.get("installment_2_due_weeks", 3)
            due_date = datetime.now(timezone.utc) + timedelta(weeks=halfway_weeks)
            update_fields["installment_2_due_date"] = due_date.isoformat()

    await db.enrollments.update_one(
        {"enrollment_id": enrollment_id},
        {"$set": update_fields}
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
    # Add enrollment count per course
    for c in courses:
        c["enrollment_count"] = await db.enrollments.count_documents({"course_id": c["course_id"]})
        c["approved_count"] = await db.enrollments.count_documents({"course_id": c["course_id"], "payment_status": "completed"})
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

@api_router.post("/student/upload")
async def student_upload_file(file: UploadFile = File(...), authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/student_docs/{user.user_id}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
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

# ============ INSTALLMENT ENDPOINTS ============

class Installment2Submit(BaseModel):
    proof_url: str
    payment_method: str = ""
    reference: str = ""

@api_router.post("/enrollments/{enrollment_id}/submit-installment-2")
async def submit_installment_2(enrollment_id: str, data: Installment2Submit, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    enrollment = await db.enrollments.find_one({"enrollment_id": enrollment_id, "user_id": user.user_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    if enrollment.get("installment_2_status") == "completed":
        raise HTTPException(status_code=400, detail="2nd installment already paid")
    await db.enrollments.update_one(
        {"enrollment_id": enrollment_id},
        {"$set": {
            "installment_2_proof": data.proof_url,
            "installment_2_status": "submitted",
            "installment_2_payment_method": data.payment_method,
            "installment_2_reference": data.reference,
            "installment_2_submitted_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "2nd installment submitted for review"}

@api_router.put("/admin/enrollments/{enrollment_id}/installment-2")
async def admin_approve_installment_2(enrollment_id: str, data: PaymentStatusUpdate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    update_fields = {"installment_2_status": data.payment_status}
    if data.payment_status == "completed":
        update_fields["installment_2_approved_at"] = datetime.now(timezone.utc).isoformat()
    await db.enrollments.update_one(
        {"enrollment_id": enrollment_id},
        {"$set": update_fields}
    )
    # Send email on 2nd installment approval
    if data.payment_status == "completed":
        enrollment = await db.enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
        if enrollment:
            usr = await db.users.find_one({"user_id": enrollment["user_id"]}, {"_id": 0})
            course = await db.courses.find_one({"course_id": enrollment["course_id"]}, {"_id": 0})
            if usr and course:
                await send_installment_email(usr, course, enrollment, "approved")
    return {"message": "Installment 2 status updated"}

@api_router.get("/notifications")
async def get_notifications(authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    enrollments = await db.enrollments.find(
        {"user_id": user.user_id, "payment_status": "completed"},
        {"_id": 0}
    ).to_list(100)
    notifications = []
    now = datetime.now(timezone.utc)
    for e in enrollments:
        inst2_status = e.get("installment_2_status", "pending")
        due_date_str = e.get("installment_2_due_date", "")
        if inst2_status in ("pending", "submitted") and due_date_str:
            due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00")) if due_date_str else None
            if due_date and now >= due_date and inst2_status == "pending":
                course = await db.courses.find_one({"course_id": e["course_id"]}, {"_id": 0})
                notifications.append({
                    "type": "installment_2_due",
                    "enrollment_id": e["enrollment_id"],
                    "course_title": course["title"] if course else "",
                    "amount": e.get("installment_2_amount", 0),
                    "due_date": due_date_str,
                    "status": inst2_status,
                })
            elif inst2_status == "submitted":
                course = await db.courses.find_one({"course_id": e["course_id"]}, {"_id": 0})
                notifications.append({
                    "type": "installment_2_pending_approval",
                    "enrollment_id": e["enrollment_id"],
                    "course_title": course["title"] if course else "",
                    "amount": e.get("installment_2_amount", 0),
                    "status": inst2_status,
                })
    return notifications

async def send_installment_email(user: dict, course: dict, enrollment: dict, status: str):
    """Send 2nd installment notification email"""
    if status == "due":
        subject = f"2nd Installment Due - {course.get('title', '')} | OEC Tech Institute"
        msg = f"Your 2nd installment of <strong style='color:#D4AF37;'>PKR {enrollment.get('installment_2_amount', 0):,}</strong> for <strong style='color:#D4AF37;'>{course.get('title', '')}</strong> is now due."
    else:
        subject = f"2nd Installment Approved - {course.get('title', '')} | OEC Tech Institute"
        msg = f"Your 2nd installment for <strong style='color:#D4AF37;'>{course.get('title', '')}</strong> has been approved."
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#050505;color:#fff;padding:40px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="color:#D4AF37;margin:0;">OEC Tech Institute</h1>
      </div>
      <p style="color:#fff;font-size:16px;">Hi {user.get('name', 'Student')},</p>
      <p style="color:#A1A1AA;font-size:14px;line-height:1.6;">{msg}</p>
      <p style="color:#A1A1AA;font-size:12px;text-align:center;border-top:1px solid #27272A;padding-top:20px;margin-top:30px;">
        OEC Tech Institute | info@oectechs.com
      </p>
    </div>
    """
    if HAS_RESEND:
        try:
            params = {"from": SENDER_EMAIL, "to": [user.get("email")], "subject": subject, "html": html}
            await asyncio.to_thread(resend.Emails.send, params)
            logger.info(f"Installment email sent to {user.get('email')}")
        except Exception as e:
            logger.error(f"Installment email failed: {e}")
    else:
        logger.info(f"[EMAIL MOCK] {subject} for {user.get('email')}")

# ============ ADMISSION FORM ============

@api_router.post("/admission-form")
async def submit_admission_form(data: dict, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    form_id = f"form_{uuid.uuid4().hex[:10]}"
    student_id = f"OEC-{datetime.now(timezone.utc).strftime('%Y')}-{str(await db.admission_forms.count_documents({}) + 1).zfill(4)}"
    form_doc = {
        "form_id": form_id,
        "student_id": student_id,
        "user_id": user.user_id,
        "course_id": data.get("course_id"),
        "full_name": data.get("full_name", ""),
        "qualification": data.get("qualification", ""),
        "phone": data.get("phone", ""),
        "date_of_birth": data.get("date_of_birth", ""),
        "address": data.get("address", ""),
        "gender": data.get("gender", ""),
        "session_type": data.get("session_type", ""),
        "learning_type": data.get("learning_type", ""),
        "religion": data.get("religion", ""),
        "city": data.get("city", ""),
        "father_name": data.get("father_name", ""),
        "father_phone": data.get("father_phone", ""),
        "father_cnic": data.get("father_cnic", ""),
        "id_card_front_url": data.get("id_card_front_url", ""),
        "id_card_back_url": data.get("id_card_back_url", ""),
        "last_degree_url": data.get("last_degree_url", ""),
        "bform_url": data.get("bform_url", ""),
        "receipt_url": data.get("receipt_url", ""),
        "joining_date": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admission_forms.insert_one(form_doc)
    return {"form_id": form_id, "student_id": student_id}

@api_router.get("/admin/admission-forms")
async def get_admission_forms(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    forms = await db.admission_forms.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for f in forms:
        course = await db.courses.find_one({"course_id": f.get("course_id")}, {"_id": 0})
        f["course_title"] = course["title"] if course else f.get("course_id", "")
    return forms

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
