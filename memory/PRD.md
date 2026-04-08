# OEC Tech Institute - PRD

## Architecture
- Frontend: React + Tailwind CSS + Shadcn UI + Framer Motion + Swiper
- Backend: FastAPI + MongoDB (Motor async driver)
- Student Auth: Google OAuth (Emergent-managed)
- Admin Auth: Password-based (bcrypt hashed)
- Theme: Black (#050505), White, Gold (#D4AF37)
- File Storage: Emergent Object Storage

## What's Been Implemented

### Phase 1-3: MVP, Brand, Pricing, Policies
- 8 courses + 3 diploma tracks, Google OAuth, Certificate PDF
- 3D Hero, Framer Motion, WhatsApp chat, Google Maps
- Course/Admission fees, Policy pages

### Phase 4: Admin Panel
- Password login (bcrypt), Dashboard, Student/Payment/Course CRUD

### Phase 5-6: Admission Form & Installments
- 4-step checkout (Form → Documents → Payment → Confirm)
- 2-installment system: Admission Fee + 1st Inst upfront, 2nd Inst at halfway
- Dashboard notifications for 2nd installment

### Phase 7: Profile & Polish
- Student profile edit (name + picture upload)
- OEC Tech branding, mobile responsive admin nav

### Phase 8: Diploma Track Checkout
- Same 4-step process for diploma tracks
- Auto-enrollment in all track courses on approval

### Phase 9: Advanced Admin Dashboard & Defaulters (April 8, 2026)
- **Dashboard Stats (12 cards):**
  - Row 1: Courses, Students, Diploma Students, Enrollments, Pending, Defaulters
  - Row 2: Admission+1st Installment revenue, 2nd Installment revenue, Monthly Revenue (month name), New Students (month name)
  - Row 3: Approved Students, Pending Approval
- **Growth Chart**: 6-month bar chart (students vs enrollments)
- **Quick Actions**: Manage Courses, Manage Diploma Tracks, Manage Students, Manage Payments
- **Defaulters Page** (`/admin/defaulters`):
  - Lists students with overdue 2nd installment
  - Deactivate (removes course access) / Re-activate actions
  - Search functionality
- **Admissions Modal**: Shows 3 fee screenshots (Admission Fee, 1st Installment, 2nd Installment)
- **Student Dashboard**: Status badge (Active/Pending/Not Enrolled) + overall learning progress % bar
- **Admin Nav**: 7 items (Dashboard, Courses, Students, Payments, Admissions, Diploma, Defaulters)
- Mobile responsive across all pages

## Admin Panel Pages
1. `/admin` - Dashboard (stats, chart, quick actions)
2. `/admin/courses` - Course CRUD
3. `/admin/students` - Student management
4. `/admin/enrollments` - Payment verification + installment management
5. `/admin/admissions` - Admission form review + fee screenshots
6. `/admin/diploma-students` - Diploma enrollment management
7. `/admin/defaulters` - Overdue 2nd installment students

## Backlog
### P1
- Resend email integration (needs API key from user)
### P2
- Refactor server.py (~1350 lines - split into route modules)
### P3
- Student messaging, instructor profiles, SEO
