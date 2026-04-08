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

### Phase 4 - Admin Panel (April 8, 2026)
- **Admin Password Login**: bcrypt-protected password auth
- **Dashboard**: Total students, courses, enrollments, pending payments, monthly revenue, new students this month
- **Student Management**: View all students with search, view lesson progress/attendance modal, remove students, joining date tracking
- **Payment Verification**: Filter by All/Pending/Approved/Rejected, one-click approve/reject, approved_at timestamp
- **Course Management**: Full CRUD - add new courses with form, edit existing, delete, enrollment counts
- **Security**: All admin routes protected with session cookies, redirect to /admin/login if unauthorized

### Phase 5 - Admission Form & Document Uploads (April 8, 2026)
- **Multi-Step Checkout**: 4 steps - Admission Form, Documents, Payment, Confirm
- **Admission Form Fields**: full_name, phone, dob, gender, religion, qualification, city, address, session_type, learning_type, father_name, father_phone, father_cnic
- **Document Uploads**: ID Card (front/back), Last Degree/Certificate, B-Form (via Emergent Object Storage)
- **Payment Step**: 3 methods (JazzCash, EasyPaisa, Bank Transfer) with account details, receipt upload, transaction ID
- **Admin Admissions Page**: View all admission forms with search, detail modal showing student info, parent info, documents, receipt
- **Navigation**: Admissions link added to all 5 admin pages (Dashboard, Courses, Students, Payments, Admissions)
- **Student ID**: Auto-generated (OEC-YYYY-XXXX format)

## Enrollment Flow
1. Student browses courses -> clicks "Enroll Now"
2. Step 1: Fills admission form (personal + parent details)
3. Step 2: Uploads documents (ID, degree, B-form)
4. Step 3: Selects payment method -> transfers money -> uploads receipt
5. Step 4: Confirms enrollment
6. Admin sees admission form in Admissions panel + enrollment in Payments panel
7. Admin approves -> course unlocks for student
8. Email notification sent to student (MOCKED - needs Resend API key)

## Backlog
### P1
- Resend email integration (needs API key from user)

### P2
- Refactor server.py (890 lines - split into route modules)
- Real payment gateway
- Course progress analytics charts

### P3
- Student messaging, instructor profiles, SEO
