# OEC Tech Institute - Product Requirements Document

## Architecture
- **Frontend**: Vanilla HTML/CSS/JS SPA (Tailwind CDN + Lucide icons)
- **Backend**: FastAPI (Python) with modular routers
- **Database**: MongoDB
- **Auth**: Google OAuth for students, password-based for admin
- **Performance**: TTFB 0.10s, gzip compression, caching headers

## Completed Features

### Core Platform
- Homepage, 9 Courses, Course Detail, 3 Diploma Tracks, Reviews, Video Testimonials
- FAQ, About, Contact, Privacy Policy, Terms, Refund Policy
- Student Dashboard, My Course View, Checkout, Profile, Certificate
- Admin: Dashboard, Courses, Students, Payments, Admissions, Diploma, Defaulters, Assignments, Videos, Expenses

### Latest Changes (April 23, 2026) — All 9 Requested Items
1. ✅ Student Dashboard: OEC Tech Institute logo in sidebar + empty state enrollment prompt
2. ✅ Checkout 4-step flow: Back buttons on steps 2, 3, 4
3. ✅ Checkout validation: All admission form fields mandatory before proceeding
4. ✅ Documents step with file upload fields (photo, CNIC, education, father CNIC)
5. ✅ Admin Course Edit: YouTube Intro Video URL field (auto-converts watch→embed)
6. ✅ Admin Course Edit: Thumbnail URL field (Google Drive link auto-converts to direct image)
7. ✅ Admin Diploma Students: Add Student (by email) + Delete functionality
8. ✅ Google Login: Fixed auth callback race condition (session_id parsed before route guard)
9. ✅ Public access: Courses, Diplomas, Reviews, Testimonials accessible without login

### SEO & Performance
- Title, meta description, OG tags, Twitter Card, JSON-LD, favicon
- Per-page dynamic titles, 0 Emergent branding
- Gzip, 1-year cache on static assets, in-memory file cache
- Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy

## Testing
- Iteration 17: 100% pass (17/17 backend, all frontend verified)

## Backlog
- og:image for social sharing
- Email integration (user declined)
