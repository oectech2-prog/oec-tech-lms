from fastapi import APIRouter, HTTPException, Header, Cookie
from datetime import datetime, timezone, timedelta
import uuid

from database import db
from models import (
    PaymentStatusUpdate, AssignmentReview,
    DiplomaEnrollmentCreate, Installment2Submit
)
from auth import (
    require_admin, get_current_user,
    send_approval_email, send_installment_email
)

router = APIRouter()


# --- Stats helper functions (Fix #3: reduced complexity) ---

async def _calculate_revenue(approved_enrollments, dip_approved, month_start):
    """Calculate admission+inst1 total, inst2 total, and monthly revenue."""
    adm_inst1_total = 0
    inst2_total = 0
    monthly_revenue = 0

    for e in approved_enrollments:
        adm_inst1_total += (e.get("admission_fee", 0) or 0) + (e.get("installment_1_amount", 0) or 0)
        if e.get("installment_2_status") == "completed":
            inst2_total += (e.get("installment_2_amount", 0) or 0)
        if e.get("approved_at", "") >= month_start.isoformat():
            course = await db.courses.find_one({"course_id": e.get("course_id")}, {"_id": 0})
            if course:
                monthly_revenue += course.get("price", 0) + course.get("admission_fee", 0)

    for e in dip_approved:
        adm_inst1_total += (e.get("admission_fee", 0) or 0) + (e.get("installment_1_amount", 0) or 0)
        if e.get("installment_2_status") == "completed":
            inst2_total += (e.get("installment_2_amount", 0) or 0)
        if e.get("approved_at", "") >= month_start.isoformat():
            monthly_revenue += (e.get("admission_fee", 0) or 0) + (e.get("installment_1_amount", 0) or 0)

    return adm_inst1_total, inst2_total, monthly_revenue


def _count_defaulters(all_approved, now):
    """Count overdue installment-2 payments."""
    count = 0
    for e in all_approved:
        due_str = e.get("installment_2_due_date", "")
        if due_str and e.get("installment_2_status", "pending") == "pending":
            try:
                due_date = datetime.fromisoformat(due_str.replace("Z", "+00:00"))
                if now > due_date:
                    count += 1
            except (ValueError, TypeError):
                pass
    return count


async def _build_monthly_growth(now):
    """Build 6-month growth data."""
    growth = []
    for i in range(5, -1, -1):
        m = now.month - i
        y = now.year
        while m <= 0:
            m += 12
            y -= 1
        m_start = datetime(y, m, 1, tzinfo=timezone.utc).isoformat()
        m_end = datetime(y + 1, 1, 1, tzinfo=timezone.utc).isoformat() if m == 12 else datetime(y, m + 1, 1, tzinfo=timezone.utc).isoformat()

        m_students = await db.users.count_documents({"role": "student", "created_at": {"$gte": m_start, "$lt": m_end}})
        m_enr = await db.enrollments.count_documents({"enrolled_at": {"$gte": m_start, "$lt": m_end}})
        m_dip = await db.diploma_enrollments.count_documents({"enrolled_at": {"$gte": m_start, "$lt": m_end}})

        growth.append({
            "month": datetime(y, m, 1).strftime("%b %Y"),
            "students": m_students,
            "enrollments": m_enr + m_dip,
        })
    return growth


@router.get("/admin/stats")
async def get_admin_stats(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Parallel count queries
    total_students = await db.users.count_documents({"role": "student"})
    total_courses = await db.courses.count_documents({})
    total_enrollments = await db.enrollments.count_documents({})
    pending_payments = await db.enrollments.count_documents({"payment_status": "pending"})
    approved_payments = await db.enrollments.count_documents({"payment_status": "completed"})
    total_diploma_students = await db.diploma_enrollments.count_documents({})
    pending_diploma = await db.diploma_enrollments.count_documents({"payment_status": "pending"})
    students_this_month = await db.users.count_documents({"role": "student", "created_at": {"$gte": month_start.isoformat()}})

    # Revenue calculation
    approved_enrollments = await db.enrollments.find({"payment_status": "completed"}, {"_id": 0}).to_list(5000)
    dip_approved = await db.diploma_enrollments.find({"payment_status": "completed"}, {"_id": 0}).to_list(5000)

    adm_inst1, inst2, monthly_rev = await _calculate_revenue(approved_enrollments, dip_approved, month_start)
    defaulters_count = _count_defaulters(approved_enrollments + dip_approved, now)
    monthly_growth = await _build_monthly_growth(now)

    return {
        "total_students": total_students,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments + total_diploma_students,
        "total_diploma_students": total_diploma_students,
        "pending_payments": pending_payments,
        "approved_payments": approved_payments,
        "admission_plus_inst1": adm_inst1,
        "inst2_total": inst2,
        "monthly_revenue": monthly_rev,
        "month_name": now.strftime("%B %Y"),
        "students_this_month": students_this_month,
        "total_pending_approval": pending_payments + pending_diploma,
        "defaulters_count": defaulters_count,
        "monthly_growth": monthly_growth,
    }


@router.get("/admin/students")
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


@router.get("/admin/students/{user_id}/progress")
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


@router.delete("/admin/students/{user_id}")
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


@router.get("/admin/enrollments")
async def get_all_enrollments(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    enrollments = await db.enrollments.find({}, {"_id": 0}).sort("enrolled_at", -1).to_list(1000)
    result = []
    for e in enrollments:
        user = await db.users.find_one({"user_id": e["user_id"]}, {"_id": 0})
        course = await db.courses.find_one({"course_id": e["course_id"]}, {"_id": 0})
        result.append({"enrollment": e, "user": user, "course": course})
    return result


@router.put("/admin/enrollments/{enrollment_id}")
async def update_enrollment_status(enrollment_id: str, data: PaymentStatusUpdate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    update_fields = {"payment_status": data.payment_status}
    if data.payment_status == "completed":
        update_fields["approved_at"] = datetime.now(timezone.utc).isoformat()
        update_fields["installment_1_status"] = "completed"
        enrollment_doc = await db.enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
        if enrollment_doc:
            halfway_weeks = enrollment_doc.get("installment_2_due_weeks", 3)
            due_date = datetime.now(timezone.utc) + timedelta(weeks=halfway_weeks)
            update_fields["installment_2_due_date"] = due_date.isoformat()

    await db.enrollments.update_one(
        {"enrollment_id": enrollment_id},
        {"$set": update_fields}
    )

    if data.payment_status == "completed":
        enrollment = await db.enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
        if enrollment:
            user = await db.users.find_one({"user_id": enrollment["user_id"]}, {"_id": 0})
            course = await db.courses.find_one({"course_id": enrollment["course_id"]}, {"_id": 0})
            if user and course:
                await send_approval_email(user, course, enrollment)

    return {"message": "Enrollment updated"}


@router.put("/admin/enrollments/{enrollment_id}/installment-2")
async def admin_approve_installment_2(enrollment_id: str, data: PaymentStatusUpdate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    update_fields = {"installment_2_status": data.payment_status}
    if data.payment_status == "completed":
        update_fields["installment_2_approved_at"] = datetime.now(timezone.utc).isoformat()
    await db.enrollments.update_one(
        {"enrollment_id": enrollment_id},
        {"$set": update_fields}
    )
    if data.payment_status == "completed":
        enrollment = await db.enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
        if enrollment:
            usr = await db.users.find_one({"user_id": enrollment["user_id"]}, {"_id": 0})
            course = await db.courses.find_one({"course_id": enrollment["course_id"]}, {"_id": 0})
            if usr and course:
                await send_installment_email(usr, course, enrollment, "approved")
    return {"message": "Installment 2 status updated"}


@router.get("/admin/defaulters")
async def get_defaulters(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    now = datetime.now(timezone.utc)
    result = []
    approved = await db.enrollments.find({"payment_status": "completed"}, {"_id": 0}).to_list(5000)
    for e in approved:
        due_str = e.get("installment_2_due_date", "")
        inst2_status = e.get("installment_2_status", "pending")
        if due_str and inst2_status == "pending":
            try:
                due_date = datetime.fromisoformat(due_str.replace("Z", "+00:00"))
                if now > due_date:
                    user = await db.users.find_one({"user_id": e["user_id"]}, {"_id": 0})
                    course = await db.courses.find_one({"course_id": e["course_id"]}, {"_id": 0})
                    result.append({"enrollment": e, "user": user, "course": course, "type": "course", "due_date": due_str, "amount": e.get("installment_2_amount", 0)})
            except (ValueError, TypeError):
                pass
    dip_approved = await db.diploma_enrollments.find({"payment_status": "completed"}, {"_id": 0}).to_list(5000)
    for e in dip_approved:
        due_str = e.get("installment_2_due_date", "")
        inst2_status = e.get("installment_2_status", "pending")
        if due_str and inst2_status == "pending":
            try:
                due_date = datetime.fromisoformat(due_str.replace("Z", "+00:00"))
                if now > due_date:
                    user = await db.users.find_one({"user_id": e["user_id"]}, {"_id": 0})
                    track = await db.diploma_tracks.find_one({"track_id": e["track_id"]}, {"_id": 0})
                    result.append({"enrollment": e, "user": user, "track": track, "type": "diploma", "due_date": due_str, "amount": e.get("installment_2_amount", 0)})
            except (ValueError, TypeError):
                pass
    return result


@router.put("/admin/defaulters/{enrollment_id}/deactivate")
async def deactivate_student(enrollment_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    e = await db.enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
    if e:
        await db.enrollments.update_one({"enrollment_id": enrollment_id}, {"$set": {"payment_status": "defaulter"}})
        return {"message": "Student deactivated"}
    e = await db.diploma_enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
    if e:
        await db.diploma_enrollments.update_one({"enrollment_id": enrollment_id}, {"$set": {"payment_status": "defaulter"}})
        return {"message": "Student deactivated"}
    raise HTTPException(status_code=404, detail="Enrollment not found")


@router.put("/admin/defaulters/{enrollment_id}/activate")
async def activate_student(enrollment_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    e = await db.enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
    if e:
        await db.enrollments.update_one({"enrollment_id": enrollment_id}, {"$set": {"payment_status": "completed"}})
        return {"message": "Student re-activated"}
    e = await db.diploma_enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
    if e:
        await db.diploma_enrollments.update_one({"enrollment_id": enrollment_id}, {"$set": {"payment_status": "completed"}})
        return {"message": "Student re-activated"}
    raise HTTPException(status_code=404, detail="Enrollment not found")


@router.get("/admin/courses")
async def admin_get_courses(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    courses = await db.courses.find({}, {"_id": 0}).to_list(1000)
    for c in courses:
        c["enrollment_count"] = await db.enrollments.count_documents({"course_id": c["course_id"]})
        c["approved_count"] = await db.enrollments.count_documents({"course_id": c["course_id"], "payment_status": "completed"})
    return courses


@router.get("/admin/messages")
async def get_messages(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return messages


@router.get("/admin/assignments")
async def get_admin_assignments(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    subs = await db.assignment_submissions.find({}, {"_id": 0}).sort("submitted_at", -1).to_list(5000)
    result = []
    for s in subs:
        user = await db.users.find_one({"user_id": s["user_id"]}, {"_id": 0})
        course = await db.courses.find_one({"course_id": s.get("course_id")}, {"_id": 0})
        # Get original filename from files collection if file submission
        original_filename = ""
        if s.get("submission_type") == "file" and s.get("file_url"):
            file_path = s["file_url"].replace("/api/files/", "")
            file_record = await db.files.find_one({"storage_path": file_path}, {"_id": 0})
            if file_record:
                original_filename = file_record.get("original_filename", "")
        result.append({
            **s,
            "user_name": user.get("name") if user else "Unknown",
            "user_email": user.get("email") if user else "",
            "course_title": course.get("title") if course else "",
            "original_filename": original_filename
        })
    return result


@router.put("/admin/assignments/{submission_id}")
async def review_assignment(submission_id: str, data: AssignmentReview, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    sub = await db.assignment_submissions.find_one({"submission_id": submission_id}, {"_id": 0})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    update = {"status": data.status, "feedback": data.feedback, "reviewed_at": datetime.now(timezone.utc).isoformat()}
    await db.assignment_submissions.update_one({"submission_id": submission_id}, {"$set": update})

    if data.status == "approved":
        enrollment = await db.enrollments.find_one({"enrollment_id": sub["enrollment_id"]}, {"_id": 0})
        if enrollment:
            approved_weeks = enrollment.get("approved_weeks", [])
            week_num = sub.get("week_number", 0)
            if week_num and week_num not in approved_weeks:
                approved_weeks.append(week_num)
                approved_weeks.sort()
                await db.enrollments.update_one(
                    {"enrollment_id": sub["enrollment_id"]},
                    {"$set": {"approved_weeks": approved_weeks}}
                )

    return {"message": f"Assignment {data.status}"}


@router.get("/admin/diploma-enrollments")
async def get_admin_diploma_enrollments(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    enrollments = await db.diploma_enrollments.find({}, {"_id": 0}).sort("enrolled_at", -1).to_list(1000)
    result = []
    for e in enrollments:
        user = await db.users.find_one({"user_id": e["user_id"]}, {"_id": 0})
        track = await db.diploma_tracks.find_one({"track_id": e["track_id"]}, {"_id": 0})
        result.append({"enrollment": e, "user": user, "track": track})
    return result


@router.put("/admin/diploma-enrollments/{enrollment_id}")
async def update_diploma_enrollment_status(enrollment_id: str, data: PaymentStatusUpdate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    update_fields = {"payment_status": data.payment_status}
    if data.payment_status == "completed":
        update_fields["approved_at"] = datetime.now(timezone.utc).isoformat()
        update_fields["installment_1_status"] = "completed"
        enrollment_doc = await db.diploma_enrollments.find_one({"enrollment_id": enrollment_id}, {"_id": 0})
        if enrollment_doc:
            halfway_weeks = enrollment_doc.get("installment_2_due_weeks", 3)
            due_date = datetime.now(timezone.utc) + timedelta(weeks=halfway_weeks)
            update_fields["installment_2_due_date"] = due_date.isoformat()
            for cid in enrollment_doc.get("course_ids", []):
                existing = await db.enrollments.find_one({"user_id": enrollment_doc["user_id"], "course_id": cid})
                if not existing:
                    course = await db.courses.find_one({"course_id": cid}, {"_id": 0})
                    c_price = course.get("price", 0) if course else 0
                    await db.enrollments.insert_one({
                        "enrollment_id": f"enroll_{uuid.uuid4().hex[:8]}",
                        "user_id": enrollment_doc["user_id"],
                        "course_id": cid,
                        "payment_status": "completed",
                        "payment_method": enrollment_doc.get("payment_method", ""),
                        "payment_proof": f"[Diploma: {enrollment_doc.get('track_title', '')}]",
                        "admission_fee": 0,
                        "admission_fee_proof": "",
                        "installment_1_amount": c_price,
                        "installment_1_proof": "",
                        "installment_1_status": "completed",
                        "installment_2_amount": 0,
                        "installment_2_proof": "",
                        "installment_2_status": "completed",
                        "installment_2_due_weeks": 0,
                        "installment_2_due_date": "",
                        "installment_2_notified": False,
                        "enrolled_at": datetime.now(timezone.utc).isoformat(),
                        "approved_at": datetime.now(timezone.utc).isoformat(),
                        "progress": 0,
                        "completed_lessons": [],
                        "submitted_assignments": [],
                        "approved_weeks": []
                    })
    await db.diploma_enrollments.update_one({"enrollment_id": enrollment_id}, {"$set": update_fields})
    return {"message": "Diploma enrollment status updated"}


@router.put("/admin/diploma-enrollments/{enrollment_id}/installment-2")
async def admin_approve_diploma_installment_2(enrollment_id: str, data: PaymentStatusUpdate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    update_fields = {"installment_2_status": data.payment_status}
    if data.payment_status == "completed":
        update_fields["installment_2_approved_at"] = datetime.now(timezone.utc).isoformat()
    await db.diploma_enrollments.update_one({"enrollment_id": enrollment_id}, {"$set": update_fields})
    return {"message": "Diploma installment 2 status updated"}



@router.delete("/admin/diploma-enrollments/{enrollment_id}")
async def delete_diploma_enrollment(enrollment_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    result = await db.diploma_enrollments.delete_one({"enrollment_id": enrollment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Diploma enrollment not found")
    return {"message": "Diploma enrollment deleted"}



@router.post("/admin/diploma-enrollments/manual")
async def manual_add_diploma_enrollment(data: dict, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    email = data.get("email", "").strip()
    track_id = data.get("track_id", "")
    if not email or not track_id:
        raise HTTPException(status_code=400, detail="Email and track_id required")

    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Student not found. They must login with Google first.")

    track = await db.diploma_tracks.find_one({"track_id": track_id}, {"_id": 0})
    if not track:
        raise HTTPException(status_code=404, detail="Diploma track not found")

    existing = await db.diploma_enrollments.find_one({"user_id": user["user_id"], "track_id": track_id})
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled in this track")

    enrollment_id = f"dip_{uuid.uuid4().hex[:10]}"
    payment_status = data.get("payment_status", "pending")
    doc = {
        "enrollment_id": enrollment_id,
        "user_id": user["user_id"],
        "track_id": track_id,
        "track_title": track.get("title", ""),
        "course_ids": track.get("courses", []),
        "payment_method": data.get("payment_method", ""),
        "payment_status": payment_status,
        "installment_1_status": "completed" if payment_status == "completed" else "pending",
        "installment_2_status": "pending",
        "installment_2_due_weeks": 3,
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
    }
    if payment_status == "completed":
        doc["approved_at"] = datetime.now(timezone.utc).isoformat()
        doc["installment_2_due_date"] = (datetime.now(timezone.utc) + timedelta(weeks=3)).isoformat()

    await db.diploma_enrollments.insert_one(doc)
    return {"message": "Diploma enrollment created", "enrollment_id": enrollment_id}


@router.get("/admin/admission-forms")
async def get_admission_forms(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    forms = await db.admission_forms.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for f in forms:
        course = await db.courses.find_one({"course_id": f.get("course_id")}, {"_id": 0})
        f["course_title"] = course["title"] if course else f.get("course_id", "")
        enrollment = await db.enrollments.find_one({"user_id": f.get("user_id"), "course_id": f.get("course_id")}, {"_id": 0})
        if not enrollment:
            enrollment = await db.diploma_enrollments.find_one({"user_id": f.get("user_id")}, {"_id": 0})
        if enrollment:
            f["installment_1_url"] = enrollment.get("installment_1_proof", "")
            f["installment_2_url"] = enrollment.get("installment_2_proof", "")
        else:
            f["installment_1_url"] = ""
            f["installment_2_url"] = ""
    return forms



@router.post("/admin/admission-forms/manual")
async def manual_add_student(data: dict, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    full_name = data.get("full_name", "").strip()
    if not full_name:
        raise HTTPException(status_code=400, detail="Full name required")

    student_id = f"OEC-{datetime.now(timezone.utc).strftime('%Y')}-{str(await db.admission_forms.count_documents({}) + 1).zfill(4)}"

    course_id = data.get("course_id", "")
    course = await db.courses.find_one({"course_id": course_id}, {"_id": 0}) if course_id else None

    form_doc = {
        "form_id": f"form_{uuid.uuid4().hex[:10]}",
        "student_id": student_id,
        "user_id": f"manual_{uuid.uuid4().hex[:8]}",
        "full_name": full_name,
        "phone": data.get("phone", ""),
        "date_of_birth": data.get("date_of_birth", ""),
        "gender": data.get("gender", ""),
        "city": data.get("city", ""),
        "address": data.get("address", ""),
        "session_type": data.get("session_type", ""),
        "learning_type": data.get("learning_type", ""),
        "qualification": data.get("qualification", ""),
        "religion": data.get("religion", ""),
        "father_name": data.get("father_name", ""),
        "father_phone": data.get("father_phone", ""),
        "father_cnic": data.get("father_cnic", ""),
        "course_id": course_id,
        "course_title": course["title"] if course else "",
        "profile_pic_url": data.get("profile_pic_url", ""),
        "receipt_url": data.get("receipt_url", ""),
        "joining_date": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.admission_forms.insert_one(form_doc)
    return {"message": "Student added", "student_id": student_id, "form_id": form_doc["form_id"]}
