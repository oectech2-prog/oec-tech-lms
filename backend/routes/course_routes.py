from fastapi import APIRouter, HTTPException, Header, Cookie
from datetime import datetime, timezone, timedelta
import uuid

from database import db
from models import (
    CourseCreate, EnrollmentCreate, ProgressUpdate,
    AssignmentSubmission, Installment2Submit
)
from auth import get_current_user, require_admin

router = APIRouter()


@router.get("/courses")
async def get_courses():
    courses = await db.courses.find({"is_published": True}, {"_id": 0}).to_list(1000)
    return courses


@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/admin/courses")
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


@router.put("/admin/courses/{course_id}")
async def update_course(course_id: str, course_data: CourseCreate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    await db.courses.update_one({"course_id": course_id}, {"$set": course_data.model_dump()})
    result = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    return result


@router.delete("/admin/courses/{course_id}")
async def delete_course(course_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    await db.courses.delete_one({"course_id": course_id})
    return {"message": "Course deleted"}


@router.post("/enrollments")
async def create_enrollment(data: EnrollmentCreate, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    existing = await db.enrollments.find_one({"user_id": user.user_id, "course_id": data.course_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    course = await db.courses.find_one({"course_id": data.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment_id = f"enroll_{uuid.uuid4().hex[:8]}"
    course_price = course.get("price", 0)
    admission_fee = course.get("admission_fee", 0)
    installment_1 = int(course_price / 2)
    installment_2 = course_price - installment_1

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
        "submitted_assignments": [],
        "approved_weeks": []
    }
    await db.enrollments.insert_one(enrollment)
    result = await db.enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
    return result


@router.get("/enrollments/my-courses")
async def get_my_courses(authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    enrollments = await db.enrollments.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    result = []
    for enrollment in enrollments:
        course = await db.courses.find_one({"course_id": enrollment["course_id"]}, {"_id": 0})
        if course:
            result.append({"enrollment": enrollment, "course": course})
    return result


@router.put("/enrollments/{enrollment_id}/progress")
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


@router.post("/enrollments/{enrollment_id}/submit-assignment")
async def submit_assignment(enrollment_id: str, data: AssignmentSubmission, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    enrollment = await db.enrollments.find_one({"enrollment_id": enrollment_id, "user_id": user.user_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    if enrollment["payment_status"] != "completed":
        raise HTTPException(status_code=403, detail="Payment not completed")

    course = await db.courses.find_one({"course_id": enrollment["course_id"]}, {"_id": 0})
    week_number = 0
    if course:
        for w in course.get("weeks", []):
            a = w.get("assignment")
            if a and a.get("assignment_id") == data.assignment_id:
                week_number = w.get("week_number", 0)
                break

    submission = {
        "submission_id": f"sub_{uuid.uuid4().hex[:8]}",
        "enrollment_id": enrollment_id,
        "assignment_id": data.assignment_id,
        "user_id": user.user_id,
        "content": data.content,
        "file_url": data.file_url,
        "submission_type": data.submission_type,
        "week_number": week_number,
        "course_id": enrollment["course_id"],
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "status": "submitted",
        "feedback": None
    }
    await db.assignment_submissions.insert_one(submission)

    submitted = enrollment.get("submitted_assignments", [])
    if data.assignment_id not in submitted:
        submitted.append(data.assignment_id)
        await db.enrollments.update_one(
            {"enrollment_id": enrollment_id},
            {"$set": {"submitted_assignments": submitted}}
        )

    return {"message": "Assignment submitted", "submission_id": submission["submission_id"]}


@router.get("/enrollments/{enrollment_id}/submissions")
async def get_submissions(enrollment_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    submissions = await db.assignment_submissions.find(
        {"enrollment_id": enrollment_id, "user_id": user.user_id}, {"_id": 0}
    ).to_list(1000)
    return submissions


@router.post("/enrollments/{enrollment_id}/submit-installment-2")
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
