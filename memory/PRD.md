# OEC Tech Institute - Product Requirements Document

## Original Problem Statement
Build a complete modern and professional e-learning website for "OEC Tech Institute". Platform sells online courses, provides student dashboard with structured learning, and an advanced admin panel. Features include secure login, multi-step admission forms with document uploads, certificate generation, payment approval emails, WhatsApp integrations, video testimonials, expense tracking, and course outline management.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python) with modular routers
- **Database**: MongoDB
- **Auth**: Google OAuth (Emergent-managed) for students, password-based for admin

## Code Structure
```
/app/backend/
  server.py          # Main app, imports routers
  routes/            # Modular endpoints (auth, course, admin, general, video, expense)
  models.py          # Pydantic models
  database.py        # MongoDB connection
  auth.py            # Auth logic (Google OAuth + Admin password)
  seed_data.py       # Course seed data
/app/frontend/src/
  pages/             # 20+ pages (Home, Courses, Dashboard, etc.)
  pages/admin/       # 11 admin pages
  components/        # Shared components (Header, Footer, etc.)
  lib/api.js         # API client
  lib/auth.js        # Auth context
```

## Completed Features (as of April 14, 2026)
- [x] Homepage with hero, features, courses, testimonials
- [x] Course catalog with detail pages
- [x] Google OAuth student authentication
- [x] Multi-step enrollment with payment proof upload
- [x] 2-installment payment system with tracking
- [x] Student dashboard with week-by-week course progress
- [x] Assignment submission system (text + file upload)
- [x] Certificate generation
- [x] Diploma tracks enrollment
- [x] Admin Dashboard with stats, growth chart, quick actions
- [x] Admin: Course CRUD management
- [x] Admin: Course Outline Editor (weeks, lessons, assignments)
- [x] Admin: Student management
- [x] Admin: Payment approval/rejection
- [x] Admin: Admission form management
- [x] Admin: Diploma student management
- [x] Admin: Defaulters tracking
- [x] Admin: Assignment review system
- [x] Admin: Video Testimonials management (add/approve/reject/delete)
- [x] Admin: Expenses tracker with stats, charts, categories
- [x] Public Video Testimonials page
- [x] Contact form, FAQ, About, Reviews pages
- [x] Privacy Policy, Terms of Service, Refund Policy
- [x] WhatsApp floating chat widget
- [x] Backend refactored to modular routers (6 route files)
- [x] 9 courses seeded (incl. Etsy & TikTok Shop Training)

## Testing Status
- Iteration 14: Backend refactor regression tests - PASSED
- Iteration 15: New features (Expenses, Videos, Outline Editor) - ALL PASSED (100%)

## Known Issues / Limitations
- Email notifications: MOCKED (Resend API key not provided)

## Backlog
- P0: Convert full project to Vanilla HTML/CSS/JS (user request for <3s load)
- P1: Integrate Resend API for real email notifications (needs API key from user)
- P2: Mobile responsiveness audit
