from fastapi import APIRouter, HTTPException, Header, Cookie
from datetime import datetime, timezone
import uuid

from database import db
from models import ExpenseCreate
from auth import require_admin

router = APIRouter()

EXPENSE_CATEGORIES = [
    "Staff Salary", "Building Rent", "Electricity Bill",
    "Internet Bill", "Sweeper Salary", "Admin Salary", "Other Expenses"
]


@router.get("/admin/expenses")
async def get_expenses(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    expenses = await db.expenses.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    return expenses


@router.post("/admin/expenses")
async def add_expense(data: ExpenseCreate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    doc = {
        "expense_id": f"exp_{uuid.uuid4().hex[:10]}",
        "category": data.category[:100],
        "description": data.description[:500],
        "amount": data.amount,
        "month": data.month,
        "year": data.year,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.expenses.insert_one(doc)
    result = await db.expenses.find_one({"expense_id": doc["expense_id"]}, {"_id": 0})
    return result


@router.put("/admin/expenses/{expense_id}")
async def update_expense(expense_id: str, data: ExpenseCreate, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    existing = await db.expenses.find_one({"expense_id": expense_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Expense not found")
    await db.expenses.update_one({"expense_id": expense_id}, {"$set": {
        "category": data.category[:100],
        "description": data.description[:500],
        "amount": data.amount,
        "month": data.month,
        "year": data.year,
    }})
    result = await db.expenses.find_one({"expense_id": expense_id}, {"_id": 0})
    return result


@router.delete("/admin/expenses/{expense_id}")
async def delete_expense(expense_id: str, authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    result = await db.expenses.delete_one({"expense_id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted"}


MONTHS = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]


async def _get_month_revenue(m_idx, y):
    """Calculate revenue for a specific month."""
    m_start = datetime(y, m_idx + 1, 1, tzinfo=timezone.utc).isoformat()
    m_end = datetime(y + 1, 1, 1, tzinfo=timezone.utc).isoformat() if m_idx + 1 == 12 else datetime(y, m_idx + 2, 1, tzinfo=timezone.utc).isoformat()

    revenue = 0
    for coll in [db.enrollments, db.diploma_enrollments]:
        docs = await coll.find(
            {"payment_status": "completed", "approved_at": {"$gte": m_start, "$lt": m_end}},
            {"_id": 0, "admission_fee": 1, "installment_1_amount": 1}
        ).to_list(5000)
        for e in docs:
            revenue += (e.get("admission_fee", 0) or 0) + (e.get("installment_1_amount", 0) or 0)
    return revenue


def _categorize_expenses(expenses):
    """Group expenses by category with totals."""
    by_cat = {}
    total = 0
    for e in expenses:
        amt = e.get("amount", 0)
        total += amt
        cat = e.get("category", "Other")
        by_cat[cat] = by_cat.get(cat, 0) + amt
    return total, by_cat


@router.get("/admin/expenses/stats")
async def expense_stats(authorization: str = Header(None), session_token: str = Cookie(None)):
    await require_admin(authorization, session_token)
    now = datetime.now(timezone.utc)

    monthly_data = []
    for i in range(11, -1, -1):
        m_idx = (now.month - 1 - i) % 12
        y = now.year - (1 if (now.month - 1 - i) < 0 else 0)

        expenses = await db.expenses.find({"month": MONTHS[m_idx], "year": y}, {"_id": 0}).to_list(5000)
        total_exp, by_cat = _categorize_expenses(expenses)
        revenue = await _get_month_revenue(m_idx, y)

        monthly_data.append({
            "month": MONTHS[m_idx], "year": y,
            "label": f"{MONTHS[m_idx][:3]} {y}",
            "total_expenses": total_exp, "total_revenue": revenue,
            "profit": revenue - total_exp, "categories": by_cat,
        })

    # Current month
    current_expenses = await db.expenses.find({"month": MONTHS[now.month - 1], "year": now.year}, {"_id": 0}).to_list(5000)
    current_total, current_by_cat = _categorize_expenses(current_expenses)

    return {
        "monthly": monthly_data,
        "current_month": MONTHS[now.month - 1],
        "current_year": now.year,
        "current_total_expenses": current_total,
        "current_breakdown": current_by_cat,
        "categories": EXPENSE_CATEGORIES,
    }
