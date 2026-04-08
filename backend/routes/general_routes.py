from fastapi import APIRouter, HTTPException, Header, Cookie, UploadFile, File, Response
from datetime import datetime, timezone
import uuid

from database import db, put_object, get_object, APP_NAME
from models import (
    ReviewCreate, ContactMessage,
    DiplomaEnrollmentCreate, Installment2Submit
)
from auth import get_current_user

router = APIRouter()


@router.get("/diploma-tracks")
async def get_diploma_tracks():
    tracks = await db.diploma_tracks.find({}, {"_id": 0}).to_list(1000)
    return tracks


@router.get("/diploma-tracks/{track_id}")
async def get_diploma_track(track_id: str):
    track = await db.diploma_tracks.find_one({"track_id": track_id}, {"_id": 0})
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return track


@router.post("/diploma-enrollments")
async def create_diploma_enrollment(data: DiplomaEnrollmentCreate, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    track = await db.diploma_tracks.find_one({"track_id": data.track_id}, {"_id": 0})
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    existing = await db.diploma_enrollments.find_one({"user_id": user.user_id, "track_id": data.track_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this diploma track")

    course_ids = track.get("courses", [])
    courses = await db.courses.find({"course_id": {"$in": course_ids}}, {"_id": 0}).to_list(100)
    total_course_fee = sum(c.get("price", 0) for c in courses)
    total_admission_fee = sum(c.get("admission_fee", 0) for c in courses)
    installment_1 = int(total_course_fee / 2)
    installment_2 = total_course_fee - installment_1

    total_weeks = sum(int(p) for c in courses for p in c.get("duration", "0").split() if p.isdigit())
    halfway_weeks = max(1, total_weeks // 2)

    enrollment_id = f"dip_enroll_{uuid.uuid4().hex[:8]}"
    enrollment = {
        "enrollment_id": enrollment_id,
        "user_id": user.user_id,
        "track_id": data.track_id,
        "track_title": track.get("title", ""),
        "course_ids": course_ids,
        "payment_status": "pending",
        "payment_method": data.payment_method,
        "payment_proof": data.payment_proof,
        "admission_fee": total_admission_fee,
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
    }
    await db.diploma_enrollments.insert_one(enrollment)
    enrollment.pop("_id", None)
    return {"message": "Diploma enrollment submitted", "enrollment_id": enrollment_id}


@router.post("/diploma-enrollments/{enrollment_id}/submit-installment-2")
async def submit_diploma_installment_2(enrollment_id: str, data: Installment2Submit, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    enrollment = await db.diploma_enrollments.find_one({"enrollment_id": enrollment_id, "user_id": user.user_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Diploma enrollment not found")
    if enrollment.get("installment_2_status") == "completed":
        raise HTTPException(status_code=400, detail="2nd installment already paid")
    await db.diploma_enrollments.update_one(
        {"enrollment_id": enrollment_id},
        {"$set": {
            "installment_2_proof": data.proof_url,
            "installment_2_status": "submitted",
            "installment_2_payment_method": data.payment_method,
            "installment_2_submitted_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Diploma 2nd installment submitted for review"}


@router.get("/reviews")
async def get_reviews():
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return reviews


@router.post("/reviews")
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
        "comment": data.comment[:2000],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review)
    result = await db.reviews.find_one({"review_id": review_id}, {"_id": 0})
    return result


@router.post("/contact")
async def contact(data: ContactMessage):
    msg = {
        "message_id": f"msg_{uuid.uuid4().hex[:8]}",
        "name": data.name[:200],
        "email": data.email[:200],
        "subject": data.subject[:300],
        "message": data.message[:5000],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(msg)
    return {"message": "Message sent successfully"}


@router.get("/certificates/{enrollment_id}")
async def get_certificate(enrollment_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
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

    existing = await db.certificates.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
    if existing:
        return existing

    cert_id = f"OEC-{enrollment_id[-8:].upper()}-{uuid.uuid4().hex[:4].upper()}"
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


@router.get("/notifications")
async def get_notifications(authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    enrollments = await db.enrollments.find(
        {"user_id": user.user_id, "payment_status": "completed"}, {"_id": 0}
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
    dip_enrollments = await db.diploma_enrollments.find(
        {"user_id": user.user_id, "payment_status": "completed"}, {"_id": 0}
    ).to_list(100)
    for e in dip_enrollments:
        inst2_status = e.get("installment_2_status", "pending")
        due_date_str = e.get("installment_2_due_date", "")
        if inst2_status in ("pending", "submitted") and due_date_str:
            due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00")) if due_date_str else None
            if due_date and now >= due_date and inst2_status == "pending":
                notifications.append({
                    "type": "installment_2_due",
                    "enrollment_id": e["enrollment_id"],
                    "course_title": f"Diploma: {e.get('track_title', '')}",
                    "amount": e.get("installment_2_amount", 0),
                    "due_date": due_date_str,
                    "status": inst2_status,
                    "is_diploma": True,
                })
            elif inst2_status == "submitted":
                notifications.append({
                    "type": "installment_2_pending_approval",
                    "enrollment_id": e["enrollment_id"],
                    "course_title": f"Diploma: {e.get('track_title', '')}",
                    "amount": e.get("installment_2_amount", 0),
                    "status": inst2_status,
                    "is_diploma": True,
                })
    return notifications


@router.post("/admission-form")
async def submit_admission_form(data: dict, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    form_id = f"form_{uuid.uuid4().hex[:10]}"
    student_id = f"OEC-{datetime.now(timezone.utc).strftime('%Y')}-{str(await db.admission_forms.count_documents({}) + 1).zfill(4)}"
    form_doc = {
        "form_id": form_id,
        "student_id": student_id,
        "user_id": user.user_id,
        "course_id": data.get("course_id"),
        "full_name": str(data.get("full_name", ""))[:200],
        "qualification": str(data.get("qualification", ""))[:200],
        "phone": str(data.get("phone", ""))[:20],
        "date_of_birth": data.get("date_of_birth", ""),
        "address": str(data.get("address", ""))[:500],
        "gender": data.get("gender", ""),
        "session_type": data.get("session_type", ""),
        "learning_type": data.get("learning_type", ""),
        "religion": data.get("religion", ""),
        "city": str(data.get("city", ""))[:100],
        "father_name": str(data.get("father_name", ""))[:200],
        "father_phone": str(data.get("father_phone", ""))[:20],
        "father_cnic": str(data.get("father_cnic", ""))[:20],
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


@router.post("/upload")
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


@router.post("/student/upload")
async def student_upload_file(file: UploadFile = File(...), authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/student_docs/{user.user_id}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
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


@router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    filename = record.get("original_filename", "download")
    headers = {"Content-Disposition": f'inline; filename="{filename}"'}
    return Response(content=data, media_type=record.get("content_type", content_type), headers=headers)
