from fastapi import HTTPException, Header, Cookie
from datetime import datetime, timezone
import os
import logging
import asyncio

from database import db
from models import User

try:
    import resend
    resend.api_key = os.environ.get("RESEND_API_KEY", "")
    HAS_RESEND = bool(resend.api_key)
except ImportError:
    HAS_RESEND = False

logger = logging.getLogger(__name__)
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")


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


async def send_approval_email(user: dict, course: dict, enrollment: dict):
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


async def send_installment_email(user: dict, course: dict, enrollment: dict, status: str):
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
