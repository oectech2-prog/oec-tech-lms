# OEC Tech Institute - Product Requirements Document

## Original Problem Statement
Build a complete modern and professional e-learning website for "OEC Tech Institute". The platform sells online courses, provides student dashboard with structured learning, and an advanced admin panel.

## Architecture
- **Frontend**: Vanilla HTML/CSS/JS SPA (converted from React for performance)
- **Backend**: FastAPI (Python) with modular routers
- **Database**: MongoDB
- **Auth**: Google OAuth for students, password-based for admin
- **Serving**: Node.js static server with gzip compression on port 3000

## Completed Features (as of April 21, 2026)

### Core Platform
- [x] Full Vanilla JS SPA conversion from React — 0.15s TTFB
- [x] Homepage, Courses, Course Detail, Diploma Tracks, Reviews, Video Testimonials
- [x] FAQ, About, Contact, Privacy Policy, Terms of Service, Refund Policy
- [x] Student Dashboard, My Course View, Checkout, Profile, Certificate
- [x] Admin Dashboard, Courses+Outline Editor, Students, Payments, Admissions
- [x] Admin Diploma Students, Defaulters, Assignments, Video Testimonials, Expenses

### SEO & Branding (April 21, 2026)
- [x] Title: "OEC Tech Institute LMS | Courses, Diplomas, Reviews & Testimonials"
- [x] Meta description, OG tags, Twitter Card, JSON-LD structured data, favicon
- [x] Dynamic per-page titles via setPageTitle()
- [x] Zero Emergent branding — old public/index.html cleaned, MutationObserver removes injected badges
- [x] Robots meta, canonical, author, keywords tags

### UI/UX (April 21, 2026)
- [x] Tightened section spacing: py-24 → py-12/py-16 (responsive)
- [x] Hero section: reduced from min-h-screen to responsive py-12/py-20
- [x] Smaller WhatsApp button on mobile (w-12 h-12)
- [x] Responsive text sizing throughout
- [x] Footer spacing reduced
- [x] Focus-visible states for accessibility

### Performance & Security
- [x] Gzip compression on all text assets
- [x] 1-year cache for static assets, no-cache for HTML
- [x] In-memory file cache in serve.js
- [x] Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- [x] Public access: Courses, Diplomas, Reviews, Testimonials (no auth required)
- [x] Auth only on: Admin dashboard, Student dashboard

## Backlog
- P1: Add og:image for social sharing preview
- P2: Service Worker for offline PWA support
- P3: Mobile responsiveness fine-tuning
- SKIPPED: Email integration (user declined)
