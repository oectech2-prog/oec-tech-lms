# OEC Tech Institute - Product Requirements Document

## Architecture
- Frontend: Vanilla HTML/CSS/JS SPA | Backend: FastAPI | DB: MongoDB
- Performance: TTFB 0.08s | Auth: Google OAuth (students) + Password (admin)

## All Completed Features

### Admin Panel (13 pages)
- Dashboard, Courses (Full Edit + Outline + Assignments), Students, Payments
- Admissions (Student IDs + PDF + Manual Add), Diploma Students (Add/Delete + PDF)
- Defaulters, Assignments, Video Testimonials, Expenses, Staff Details (8 categories)

### Latest (April 23, 2026 - Iteration 19)
1. **Full Course Edit**: Title, Category, Short/Full Description, Requirements, What You'll Learn, Price, Admission Fee, Thumbnail URL (Google Drive), YouTube Video URL
2. **Course Outline Assignments**: Per-week assignment with file_url (PDF/Word/Excel/Image) for students to download
3. **Manual Student Add**: Admin adds students directly with full admission form, auto-generates OEC-YYYY-XXXX ID
4. **Branded PDF Template**: All downloads (Student, Staff, Diploma) have:
   - Header: Graduation cap logo + OEC TECH INSTITUTE - CHUNIAN + Form title + Student ID badge
   - Footer: info@oectechs.com | 0300-0517616 | www.oectechs.com | Founder/CEO: Sadam Zargar

## Testing: Iteration 19 — 100% pass (14/14 backend + all frontend verified)

## Backlog
- og:image for social sharing | Email integration (user declined)
