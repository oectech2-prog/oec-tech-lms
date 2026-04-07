# Hussnain Digital Academy - PRD

## Problem Statement
Complete e-learning website with student dashboard, admin panel, Google auth, and payment system for selling online courses.

## Architecture
- Frontend: React + Tailwind CSS + Shadcn UI + Framer Motion
- Backend: FastAPI + MongoDB (Motor async driver)
- Auth: Google OAuth (Emergent-managed)
- Storage: Emergent Object Storage
- Theme: Black (#050505), White, Gold (#D4AF37)

## User Personas
1. **Students** (Pakistan, UAE, UK, USA) - Learn digital skills, access courses, submit assignments
2. **Admin** - Manage courses, students, enrollments, approve payments

## Core Requirements
- 7 courses with weekly structure (lessons, assignments, final project)
- 3 diploma career tracks
- Student dashboard with progress tracking
- Admin panel for course/student/payment management
- MOCKED payment (JazzCash, EasyPaisa, Bank Transfer - manual admin approval)

## What's Been Implemented (April 7, 2026)

### Public Pages
- Home (hero, featured courses, benefits, reviews, diploma tracks, FAQ)
- All Courses (search, filter by category)
- Course Detail (intro video, requirements, what you'll learn, weekly outline)
- Diploma Tracks (career paths with roadmaps)
- Student Reviews (testimonials with ratings)
- About Us (mission, vision, why choose us)
- Contact Us (form + WhatsApp)
- FAQ (categorized questions)

### Student System
- Google OAuth login/signup
- Student Dashboard (my courses, stats, progress)
- Course Learning View (video player, lesson tracking, assignments)
- Assignment submission system
- Profile page
- Checkout flow (JazzCash/EasyPaisa/Bank Transfer selection)

### Admin Panel
- Admin Dashboard (stats overview)
- Manage Courses (list, delete)
- View Students (table)
- Manage Enrollments (approve/reject payments)

### Backend APIs
- Auth: /api/auth/session, /api/auth/me, /api/auth/logout
- Courses: /api/courses, /api/courses/:id
- Enrollments: /api/enrollments, /api/enrollments/my-courses, progress, assignments
- Diploma Tracks: /api/diploma-tracks
- Reviews: /api/reviews
- Contact: /api/contact
- Admin: /api/admin/stats, students, enrollments, courses, messages
- Upload: /api/upload, /api/files/:path

## Prioritized Backlog
### P0 (Done)
- All public pages ✅
- Student dashboard ✅
- Admin panel ✅
- Auth system ✅
- Course structure ✅

### P1 (Next Phase)
- Admin course creation form (UI for adding/editing courses)
- Admin course editing with week/lesson builder
- Real payment integration when APIs available
- Email notifications for payment confirmations
- Certificate generation upon course completion

### P2 (Future)
- Course progress analytics/charts
- Student-to-student messaging
- Instructor profiles
- Mobile app (React Native)
- Advanced SEO with meta tags per page
