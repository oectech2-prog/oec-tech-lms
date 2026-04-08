from fastapi import APIRouter, Header, Cookie
from fastapi.responses import JSONResponse
from datetime import datetime, timezone, timedelta
import uuid
import bcrypt
import requests
import logging

from database import db
from models import AdminLoginRequest, ProfileUpdate, User
from auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

ADMIN_PASSWORD_HASH = bcrypt.hashpw(b"OEC@Admin#2026!Secure", bcrypt.gensalt()).decode()


@router.post("/auth/session")
async def create_session(request_data: dict):
    session_id = request_data.get("session_id")
    if not session_id:
        from fastapi import HTTPException
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
            path="/", max_age=7 * 24 * 60 * 60
        )
        return response
    except requests.exceptions.RequestException as e:
        logger.error(f"Auth error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Authentication failed")


@router.get("/auth/me")
async def get_me(authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    return user


@router.post("/auth/logout")
async def logout(authorization: str = Header(None), session_token: str = Cookie(None)):
    token = session_token or (authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None)
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie(key="session_token", path="/")
    return response


@router.put("/profile")
async def update_profile(data: ProfileUpdate, authorization: str = Header(None), session_token: str = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    update_fields = {}
    if data.name and data.name.strip():
        update_fields["name"] = data.name.strip()[:100]
    if data.picture is not None:
        update_fields["picture"] = data.picture
    if not update_fields:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Nothing to update")
    await db.users.update_one({"user_id": user.user_id}, {"$set": update_fields})
    updated = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return updated


@router.post("/admin/login")
async def admin_login(data: AdminLoginRequest):
    if not bcrypt.checkpw(data.password.encode(), ADMIN_PASSWORD_HASH.encode()):
        from fastapi import HTTPException
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
        path="/", max_age=24 * 60 * 60
    )
    return response
