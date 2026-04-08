# OEC Tech Institute - PRD

## Architecture
- Frontend: React + Tailwind CSS + Shadcn UI + Framer Motion + Swiper
- Backend: FastAPI + MongoDB (Motor async driver)
- Student Auth: Google OAuth (Emergent-managed)
- Admin Auth: Phone OTP (03000517616) with SHA256 hashed codes
- Theme: Black (#050505), White, Gold (#D4AF37)

## What's Been Implemented

### Phase 1 - MVP
- 8 courses with weekly structure, assignments, final projects
- 3 diploma tracks with career roadmaps
- Student dashboard, Google OAuth

### Phase 2 - Brand & UI
- Brand: OEC Tech Institute
- 3D Hero Image, Framer Motion animations, Swiper reviews carousel
- Fee Receipt Upload, Certificate PDF (jsPDF)
- Preloader, ScrollToTop, WhatsApp chat widget, Sticky header

### Phase 3 - Pricing & Policies
- Course fee + Admission fee for all 8 courses
- Enroll Now + View Details buttons on all course cards
- Diploma Track Checkout with total investment breakdown
- Privacy Policy, Terms of Service, Refund Policy pages
- Google Maps on Home and Contact pages

### Phase 4 - Admin Panel (April 8, 2026)
- **Admin OTP Login**: Phone number verification (03000517616) with 6-digit OTP
- **Dashboard**: Total students, courses, enrollments, pending payments, monthly revenue, new students this month
- **Student Management**: View all students with search, view lesson progress/attendance modal, remove students, joining date tracking
- **Payment Verification**: Filter by All/Pending/Approved/Rejected, one-click approve/reject, approved_at timestamp
- **Course Management**: Full CRUD - add new courses with form, edit existing, delete, enrollment counts
- **Security**: All admin routes protected with OTP session, redirect to /admin/login if unauthorized

## Enrollment Flow
1. Student browses courses → clicks "Enroll Now"
2. Student selects payment method → transfers money → uploads receipt
3. Admin sees enrollment in Payments panel with student details
4. Admin approves → `approved_at` timestamp set → course unlocks for student
5. Email notification sent to student (MOCKED - needs Resend API key)

## Backlog
### P1
- Real WhatsApp OTP delivery (currently logs to console)
- Resend email integration (needs API key)

### P2
- Real payment gateway
- Course progress analytics charts
- Student messaging, instructor profiles, SEO
