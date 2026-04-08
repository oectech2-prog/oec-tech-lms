# OEC Tech Institute - PRD

## Architecture
- Frontend: React + Tailwind CSS + Shadcn UI + Framer Motion + Swiper
- Backend: FastAPI + MongoDB (Motor async driver)
- Student Auth: Google OAuth (Emergent-managed)
- Admin Auth: Password-based (bcrypt hashed)
- Theme: Black (#050505), White, Gold (#D4AF37)
- File Storage: Emergent Object Storage

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

### Phase 4 - Admin Panel
- Admin Password Login (bcrypt), Dashboard stats, Student/Payment/Course management
- Security: All admin routes protected with session cookies

### Phase 5 - Admission Form & Document Uploads
- Multi-Step Checkout: 4 steps - Admission Form, Documents, Payment, Confirm
- Document Uploads: ID Card (front/back), Last Degree, B-Form
- Admin Admissions Page: View all forms with search + detail modal

### Phase 6 - Installment Payment System
- Fee Structure: Course fee split into 2 equal installments
- Checkout Step 3: Two upload areas (Admission Fee + 1st Installment)
- Dashboard Notifications: 2nd installment due alerts
- Admin Enrollments: Installment tracking + approve/reject

### Phase 7 - Profile & Admin Polish
- Student Profile Edit: Name change + profile picture upload
- Admin Fee Screenshots: Clickable view modal for all proof images
- OEC Tech branding on all admin pages
- Mobile responsive admin navigation on all pages

### Phase 8 - Diploma Track Checkout & Admin (April 8, 2026)
- **Diploma 4-Step Checkout**: Same process as courses at `/checkout/track/:trackId`
  - Step 1: Admission Form (personal + parent details)
  - Step 2: Document uploads (ID, degree, B-form)
  - Step 3: Payment with installment breakdown + 2 screenshot uploads
  - Step 4: Review & confirm
- **Installment Calculation**: Total course fees across all diploma courses / 2
  - Pay Now = Total Admission Fees + 1st Installment
  - 2nd Installment due at halfway through total course weeks
- **Admin Diploma Students Page** (`/admin/diploma-students`):
  - List all diploma enrollments with student info
  - Filter tabs: All, Pending, Approved, Rejected
  - Approve/Reject payments, 2nd installment management
  - Fee screenshot viewing (Adm Fee, 1st Inst, 2nd Inst)
- **Admin Sidebar**: Now 6 items (Dashboard, Courses, Students, Payments, Admissions, Diploma)
- **Auto-Course-Enrollment**: When admin approves diploma payment, student automatically gets enrolled in all track courses

## Enrollment Flows

### Course Enrollment
1. Student fills admission form → uploads documents → pays admission + 1st installment
2. Admin approves → course unlocks
3. At halfway → 2nd installment notification → student pays → admin approves

### Diploma Enrollment
1. Student fills admission form → uploads documents → pays admission + 1st installment (total across all courses)
2. Admin approves → all track courses unlock automatically
3. At halfway → 2nd installment notification → student pays → admin approves

## Backlog
### P1
- Resend email integration (needs API key from user)

### P2
- Refactor server.py (~1200 lines - split into route modules)
- Course progress analytics charts

### P3
- Student messaging, instructor profiles, SEO
