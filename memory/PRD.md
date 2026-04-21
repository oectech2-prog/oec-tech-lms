# OEC Tech Institute - Product Requirements Document

## Original Problem Statement
Build a complete modern and professional e-learning website for "OEC Tech Institute". The platform sells online courses, provides student dashboard with structured learning, and an advanced admin panel.

## Architecture
- **Frontend**: Vanilla HTML/CSS/JS SPA (converted from React for performance)
- **Backend**: FastAPI (Python) with modular routers
- **Database**: MongoDB
- **Auth**: Google OAuth (Emergent-managed) for students, password-based for admin
- **Serving**: Node.js static server with gzip compression on port 3000

## Completed Features (as of April 21, 2026)
- [x] Full Vanilla JS SPA conversion (from React) - 0.13s TTFB, 0.54s full load
- [x] SEO optimized: title, meta description, OG tags, Twitter cards, JSON-LD structured data
- [x] No third-party branding (Emergent branding removed)
- [x] Public access: Courses, Diplomas, Reviews, Testimonials (no auth required)
- [x] Gzip compression + caching headers + security headers
- [x] Dynamic page titles per route
- [x] MutationObserver to remove injected badges
- [x] Homepage with hero, animated counters, courses grid, reviews, FAQ, map
- [x] Course catalog with search & category filter
- [x] Course detail with weekly outline, requirements, learning outcomes
- [x] Diploma tracks with roadmap and course listings
- [x] Video Testimonials (public + admin management)
- [x] Student Dashboard with course progress, installment tracking
- [x] My Course View with video player, lesson tracking, assignment submission
- [x] Multi-step Checkout with admission form, documents, payment
- [x] Profile, Certificate pages
- [x] Admin Dashboard with stats, revenue, quick actions
- [x] Admin: Courses + Outline Editor, Students, Payments, Admissions
- [x] Admin: Diploma Students, Defaulters, Assignments review
- [x] Admin: Video Testimonials management, Expenses tracker
- [x] WhatsApp floating chat widget
- [x] Contact form, FAQ, About, Reviews, Policy pages
- [x] Responsive design (mobile + desktop)
- [x] Accessibility: focus-visible states on all interactive elements

## Performance Metrics
- TTFB: 0.13s
- Full page load: 0.54s
- Target: < 3s (achieved)

## Auth Requirements (kept minimal)
- Admin dashboard: Password-based auth
- Student dashboard: Google OAuth
- Public pages: No auth required (courses, diplomas, reviews, testimonials)

## Backlog
- P1: Integrate Resend API for real email notifications (needs API key)
- P2: Add og:image for social sharing
- P3: Service Worker for offline support
