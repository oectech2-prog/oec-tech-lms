# OEC Tech Institute - Product Requirements Document

## Architecture
- Frontend: Vanilla HTML/CSS/JS SPA | Backend: FastAPI | DB: MongoDB
- Performance: TTFB 0.08s | Auth: Google OAuth (students) + Password (admin)

## All Completed Features

### Core Platform
- Homepage, 9 Courses, Course Detail, 3 Diploma Tracks, Reviews, Video Testimonials
- FAQ, About, Contact, Privacy Policy, Terms, Refund Policy
- Student Dashboard, My Course View, Checkout (4-step), Profile, Certificate

### Admin Panel (12 pages)
- Dashboard, Courses (Edit/Outline/Delete), Students, Payments, Admissions, Diploma Students
- Defaulters, Assignments, Video Testimonials, Expenses, **Staff Details (NEW)**

### Latest (April 23, 2026) — All 4 Tasks Done
1. **Unique Student IDs**: Auto-generated OEC-YYYY-XXXX format, displayed as gold badges in admin
2. **Admission Form PDF Download**: One-click PDF with all student data, OEC branding, print-ready
3. **Staff Details Page**: 8 categories (Principal, Admin, Instructor, Job Holder, Internship w/wo stipend, Sweeper, Guard). Full form: profile pic, ID card front/back, letter upload (PDF/Word/Excel)
4. **Student Profile Photo Upload**: Added to enrollment Step 2, uploads to server, saved in admission form

### Previous Implementations
- SEO: Title, meta, OG tags, JSON-LD, favicon, dynamic page titles
- Performance: Gzip, caching, security headers
- Admin Course Edit: YouTube video URL + Google Drive thumbnail
- Admin Diploma: Add/Delete students
- Google Login: Fixed auth callback race condition
- Public Access: Courses, Diplomas, Reviews accessible without login

## Testing: Iteration 18 — 100% pass (13/13 backend, all frontend verified)

## Backlog
- og:image for social sharing
- Email integration (user declined)
