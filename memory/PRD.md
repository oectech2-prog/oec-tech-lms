# OEC Tech Institute - PRD

## Problem Statement
Complete e-learning website with student dashboard, admin panel, Google auth, and payment system for selling online courses.

## Architecture
- Frontend: React + Tailwind CSS + Shadcn UI + Framer Motion + Swiper
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
- **3D Hero Image**: Animated 3D laptop PNG with floating glass badges
- **Fee Receipt Upload**: Students upload payment screenshot for admin verification
- **Enhanced Animations**: Framer Motion throughout all pages
- **CSS Polish**: Button shimmer, smooth transitions, glass hover glow

### Phase 3 (April 7, 2026) - Latest Enhancements
- **Sticky Header**: Scroll-aware header that hides on scroll down, shows on scroll up
- **100+ Student Reviews**: 104 seeded reviews (80 PK, 9 AE, 8 GB, 7 US) with Swiper carousel
- **Certificate System**: PDF generation for completed courses via jsPDF
- **Email Framework**: Resend-based payment approval emails (MOCKED - awaiting API key)
- **Preloader**: Branded loading screen with gold spinner
- **ScrollToTop**: Floating button appears after 400px scroll
- **Button Styling**: Added btn-gold and btn-gold-outline CSS utility classes
- **Lazy Loading**: All images use loading="lazy" (hero uses "eager")
- **Performance**: Optimized image rendering across all pages

## Prioritized Backlog

### P0 (Done)
- All public pages (Home, Courses, CourseDetail, DiplomaTracks, Reviews, About, Contact, FAQ)
- Student dashboard with course progress tracking
- Admin panel (Dashboard, Courses, Students, Enrollments)
- Auth system (Google OAuth)
- Course structure (weekly modules, assignments, final projects)
- Brand rename to OEC Tech Institute
- 3D hero section with floating badges
- Fee receipt upload
- Enhanced animations (Framer Motion)
- Sticky header navigation
- 100+ student reviews with Swiper carousel
- Certificate generation (PDF)
- Preloader and ScrollToTop
- Button styling (btn-gold, btn-gold-outline)
- Lazy loading on images
- Performance optimizations

### P1 (Next)
- Resend email integration (needs API key from user)
- Admin course creation/editing form UI

### P2 (Future)
- Real payment integration
- Course progress analytics/charts
- Student-to-student messaging
- Instructor profiles
- Advanced SEO (meta tags per page)
