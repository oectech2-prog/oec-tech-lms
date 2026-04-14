from fastapi import APIRouter, HTTPException, Header, Cookie
from datetime import datetime, timezone
import uuid

from database import db
from models import VideoTestimonialCreate, VideoTestimonialSubmit
from auth import get_current_user, require_admin

router = APIRouter()


@router.get("/video-testimonials")
async def get_video_testimonials():
    vids = await db.video_testimonials.find({"status": "approved"}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return vids


@router.post("/video-testimonials")
async def submit_video_testimonial(data: VideoTestimonialSubmit, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    doc = {
        "testimonial_id": f"vt_{uuid.uuid4().hex[:10]}",
        "student_name": user.name,
        "user_id": user.user_id,
        "user_picture": user.picture,
        "course_title": data.course_title[:200],
        "video_type": data.video_type,
        "video_url": data.video_url[:1000],
        "description": data.description[:2000],
        "thumbnail_url": "",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.video_testimonials.insert_one(doc)
    return {"message": "Video testimonial submitted for review"}


@router.get("/admin/video-testimonials")
async def admin_get_testimonials(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    vids = await db.video_testimonials.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    return vids


@router.post("/admin/video-testimonials")
async def admin_add_testimonial(data: VideoTestimonialCreate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    doc = {
        "testimonial_id": f"vt_{uuid.uuid4().hex[:10]}",
        "student_name": data.student_name[:200],
        "user_id": "admin",
        "user_picture": None,
        "course_title": data.course_title[:200],
        "video_type": data.video_type,
        "video_url": data.video_url[:1000],
        "description": data.description[:2000],
        "thumbnail_url": data.thumbnail_url[:1000],
        "status": "approved",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.video_testimonials.insert_one(doc)
    result = await db.video_testimonials.find_one({"testimonial_id": doc["testimonial_id"]}, {"_id": 0})
    return result


@router.put("/admin/video-testimonials/{testimonial_id}")
async def admin_update_testimonial(testimonial_id: str, data: dict, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    existing = await db.video_testimonials.find_one({"testimonial_id": testimonial_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    update = {}
    for k in ["status", "student_name", "course_title", "video_type", "video_url", "description", "thumbnail_url"]:
        if k in data:
            update[k] = str(data[k])[:2000]
    if update:
        await db.video_testimonials.update_one({"testimonial_id": testimonial_id}, {"$set": update})
    result = await db.video_testimonials.find_one({"testimonial_id": testimonial_id}, {"_id": 0})
    return result


@router.delete("/admin/video-testimonials/{testimonial_id}")
async def admin_delete_testimonial(testimonial_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    await db.video_testimonials.delete_one({"testimonial_id": testimonial_id})
    return {"message": "Testimonial deleted"}
