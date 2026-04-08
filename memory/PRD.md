# OEC Tech Institute - PRD

## Architecture
- Frontend: React + Tailwind CSS + Shadcn UI + Framer Motion + Swiper
- Backend: FastAPI + MongoDB (Motor async driver) — **Modular structure**
- Student Auth: Google OAuth (Emergent-managed)
- Admin Auth: Password-based (bcrypt hashed)
- Theme: Black (#050505), White, Gold (#D4AF37)

## Backend Structure (Refactored April 8, 2026)
```
backend/
├── server.py              # FastAPI app, CORS, router imports, startup
├── database.py            # MongoDB connection, Object Storage, indexes
├── models.py              # All Pydantic models
├── auth.py                # Auth helpers, email utilities
├── routes/
│   ├── auth_routes.py     # /auth/*, /profile, /admin/login
│   ├── course_routes.py   # /courses/*, /enrollments/*
│   ├── admin_routes.py    # /admin/* (stats, students, assignments, defaulters, diplomas)
│   └── general_routes.py  # /reviews, /contact, /certificates, /diploma-tracks, /files, /admission-form
├── seed_data.py
└── seed_reviews.py
```

## What's Been Implemented

### Phase 1-3: MVP, Brand, Pricing, Policies
- 8 courses + 3 diploma tracks, Google OAuth, Certificate PDF
- 3D Hero, WhatsApp chat, Google Maps, Policy pages

### Phase 4: Admin Panel
- Password login (bcrypt), Student/Payment/Course CRUD

### Phase 5-6: Admission Form & Installments
- 4-step checkout, 2-installment system, dashboard notifications

### Phase 7: Profile & Polish
- Student profile edit (name + picture), OEC Tech branding, mobile responsive

### Phase 8: Diploma Track Checkout
- Same 4-step process for diploma tracks, auto-enrollment on approval

### Phase 9: Advanced Admin Dashboard & Defaulters
- 12 stat cards, growth chart, quick actions
- Defaulters page with deactivate/re-activate

### Phase 10: Assignment System & Week Locking
- Assignment submission (text/link/file), admin review, week-by-week unlocking
- Weekly progress tracking

### Phase 11: Code Optimization & Security (April 8, 2026)
- **Backend refactored**: 1400+ line server.py split into 8 modular files
- **MongoDB indexes**: Created at startup for all collections (performance)
- **Input validation**: String length limits on user inputs
- **File upload**: Student upload limit increased to 10MB, Content-Disposition headers
- **Admin Assignments Enhanced**: File download/view/preview, link opening, original filename display
- **Security**: Proper cookie settings (httponly, secure, samesite=none)

## Admin Panel Pages
1. `/admin` - Dashboard (stats, chart, quick actions)
2. `/admin/courses` - Course CRUD
3. `/admin/students` - Student management
4. `/admin/enrollments` - Payment verification + installment management
5. `/admin/admissions` - Admission form review + fee screenshots
6. `/admin/diploma-students` - Diploma enrollment management
7. `/admin/defaulters` - Overdue 2nd installment students
8. `/admin/assignments` - Student assignment review + approval (file download/view/link)

## Backlog
### P1
- Resend email integration (needs API key from user)
### P3
- Mobile responsiveness audit on admin data tables
- Student messaging, instructor profiles, SEO
