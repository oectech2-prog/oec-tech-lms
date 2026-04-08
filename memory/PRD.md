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
- Admission Form: 13 fields (personal + parent/guardian details)
- Document Uploads: ID Card (front/back), Last Degree, B-Form
- Admin Admissions Page: View all forms with search + detail modal

### Phase 6 - Installment Payment System
- Fee Structure: Course fee split into 2 equal installments (excl. admission fee)
- Checkout Step 3: Shows installment breakdown, two upload areas (Adm Fee + 1st Installment)
- 2nd Installment Due: Notification at course halfway, dashboard modal for upload
- Admin Enrollments: Installment status tracking + approve/reject 2nd installment

### Phase 7 - Profile & Admin Polish (April 8, 2026)
- **Student Profile Edit**: Name change + profile picture upload from /profile page
  - Backend: PUT /api/profile endpoint (auth required)
  - Frontend: Camera button overlay on avatar, inline name edit with Save button
- **Admin Fee Screenshots**: Clickable "Adm Fee", "1st Inst", "2nd Inst" buttons in Enrollments page
  - Opens modal with full screenshot image view
- **Admin OEC Tech Branding**: All 5 admin pages show "OEC Tech" logo (sidebar + mobile nav)
- **Mobile Responsive Admin**: All admin pages have mobile navigation (md:hidden horizontal nav)
  - Responsive padding: p-4 sm:p-6 md:p-8

## Enrollment Flow
1. Student fills admission form (personal + parent details)
2. Student uploads documents (ID, degree, B-form)
3. Student pays Admission Fee + 1st Installment (2 separate screenshot uploads)
4. Admin approves -> Course unlocks, 2nd installment due date set
5. At course halfway -> Email + Dashboard notification for 2nd installment
6. Student uploads 2nd installment screenshot from Dashboard
7. Admin approves 2nd installment

## Backlog
### P1
- Resend email integration (needs API key from user)

### P2
- Refactor server.py (~1050 lines - split into route modules)
- Real payment gateway
- Course progress analytics charts

### P3
- Student messaging, instructor profiles, SEO
