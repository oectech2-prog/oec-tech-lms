# OEC Tech Institute - PRD

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

## What's Been Implemented

### Phase 1 (April 7, 2026) - MVP
- 7 courses with weekly structure
- 3 diploma tracks
- Student dashboard, admin panel
- Google OAuth, payment (MOCKED)

### Phase 2 (April 7, 2026) - Enhancements
- **Brand rename**: Hussnain Digital Academy -> OEC Tech Institute
- **3D Hero Image**: Animated 3D laptop PNG with floating glass badges (earning potential, countries)
- **Fee Receipt Upload**: Students can upload payment screenshot in checkout, sent to admin for verification
- **Enhanced Animations**: Framer Motion animations throughout all pages, animated counters, hover effects, stagger reveals
- **CSS Polish**: Button shimmer effects, smooth transitions, glass hover glow

## Prioritized Backlog
### P0 (Done)
- All public pages ✅
- Student dashboard ✅
- Admin panel ✅
- Auth system ✅
- Course structure ✅
- Brand rename ✅
- 3D hero section ✅
- Fee receipt upload ✅
- Enhanced animations ✅

### P1 (Next Phase)
- Admin course creation form (UI for adding/editing courses)
- Real payment integration when APIs available
- Email notifications for payment confirmations
- Certificate generation upon course completion

### P2 (Future)
- Course progress analytics/charts
- Student-to-student messaging
- Instructor profiles
- Advanced SEO with meta tags per page
