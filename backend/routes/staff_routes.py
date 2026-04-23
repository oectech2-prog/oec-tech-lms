from fastapi import APIRouter, HTTPException, Header, Cookie
from datetime import datetime, timezone
import uuid

from database import db
from auth import require_admin

router = APIRouter()

STAFF_CATEGORIES = [
    "Principal", "Admin", "Instructor", "Job Holder",
    "Internship with Stipend", "Internship without Stipend",
    "Sweeper", "Guard"
]


@router.get("/admin/staff")
async def get_staff(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    staff = await db.staff.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return staff


@router.post("/admin/staff")
async def add_staff(data: dict, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    name = data.get("name", "").strip()
    category = data.get("category", "").strip()
    if not name or not category:
        raise HTTPException(status_code=400, detail="Name and category required")

    staff_id = f"staff_{uuid.uuid4().hex[:10]}"
    doc = {
        "staff_id": staff_id,
        "name": name,
        "category": category,
        "father_name": data.get("father_name", ""),
        "phone": data.get("phone", ""),
        "email": data.get("email", ""),
        "cnic": data.get("cnic", ""),
        "address": data.get("address", ""),
        "city": data.get("city", ""),
        "date_of_birth": data.get("date_of_birth", ""),
        "gender": data.get("gender", ""),
        "qualification": data.get("qualification", ""),
        "salary": data.get("salary", ""),
        "joining_date": data.get("joining_date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
        "profile_pic_url": data.get("profile_pic_url", ""),
        "id_card_front_url": data.get("id_card_front_url", ""),
        "id_card_back_url": data.get("id_card_back_url", ""),
        "letter_url": data.get("letter_url", ""),
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.staff.insert_one(doc)
    result = await db.staff.find_one({"staff_id": staff_id}, {"_id": 0})
    return result


@router.put("/admin/staff/{staff_id}")
async def update_staff(staff_id: str, data: dict, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    allowed = {"name","category","father_name","phone","email","cnic","address","city","date_of_birth","gender","qualification","salary","joining_date","profile_pic_url","id_card_front_url","id_card_back_url","letter_url","status"}
    update = {k: v for k, v in data.items() if k in allowed}
    if not update:
        raise HTTPException(status_code=400, detail="No valid fields")
    await db.staff.update_one({"staff_id": staff_id}, {"$set": update})
    result = await db.staff.find_one({"staff_id": staff_id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Staff not found")
    return result


@router.delete("/admin/staff/{staff_id}")
async def delete_staff(staff_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    result = await db.staff.delete_one({"staff_id": staff_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Staff not found")
    return {"message": "Staff deleted"}


@router.get("/admin/staff/categories")
async def get_staff_categories(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    return {"categories": STAFF_CATEGORIES}
