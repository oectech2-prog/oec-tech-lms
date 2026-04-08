# OEC Tech Institute - PRD

## Architecture
- Frontend: React + Tailwind CSS + Shadcn UI + Framer Motion + Swiper
- Backend: FastAPI + MongoDB (Motor async driver)
- Student Auth: Google OAuth (Emergent-managed)
- Admin Auth: Password-based (bcrypt hashed)
- Theme: Black (#050505), White, Gold (#D4AF37)

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

### Phase 10: Assignment System & Week Locking (April 8, 2026)
- **Assignment Submission Options**: 
  - Text (textarea answer)
  - Link (URL - Google Docs, GitHub, Drive, etc.)
  - File upload (MS Word, Excel, PDF, PPT, images - max 10MB)
- **Week Locking System**:
  - Week 1 always unlocked
  - Student submits week assignment → status: "submitted"
  - Admin approves → enrollment.approved_weeks updated → next week unlocks
  - Admin rejects with feedback → student can resubmit
  - Locked weeks show lock icon + "Complete previous week first"
- **Weekly Progress**: Percentage bar (approved weeks / total weeks)
- **MyCourseView Enhanced**:
  - Week sidebar with lock/unlock status + assignment status indicators
  - Assignment submission form with Text/Link/File tabs
  - Lesson progress + weekly progress bars
  - Assignment status (submitted/approved/rejected) per week
- **Admin Assignments Page** (`/admin/assignments`):
  - All submissions with student name, course, week, type
  - Filter: All/Pending/Approved/Rejected
  - View modal: full submission content, download file link, feedback textarea
  - Approve/Reject with feedback
- **Admin Nav**: 8 items (Dashboard, Courses, Students, Payments, Admissions, Diploma, Defaulters, Assignments)

## Admin Panel Pages
1. `/admin` - Dashboard (stats, chart, quick actions)
2. `/admin/courses` - Course CRUD
3. `/admin/students` - Student management
4. `/admin/enrollments` - Payment verification + installment management
5. `/admin/admissions` - Admission form review + fee screenshots
6. `/admin/diploma-students` - Diploma enrollment management
7. `/admin/defaulters` - Overdue 2nd installment students
8. `/admin/assignments` - Student assignment review + approval

## Backlog
### P1
- Resend email integration (needs API key from user)
### P2
- Refactor server.py (~1400 lines - split into route modules)
### P3
- Student messaging, instructor profiles, SEO
