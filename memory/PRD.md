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
- Admin Password Login (bcrypt), Dashboard stats, Student/Payment/Course management
- Security: All admin routes protected with session cookies

### Phase 5 - Admission Form & Document Uploads (April 8, 2026)
- Multi-Step Checkout: 4 steps - Admission Form, Documents, Payment, Confirm
- Admission Form: 13 fields (personal + parent/guardian details)
- Document Uploads: ID Card (front/back), Last Degree, B-Form
- Admin Admissions Page: View all forms with search + detail modal

### Phase 6 - Installment Payment System (April 8, 2026)
- **Fee Structure**: Course fee split into 2 equal installments (excl. admission fee)
  - Example: PKR 6000 course → 2x PKR 3000 installments
- **Checkout Step 3**: Shows installment breakdown with "Pay Now" amount
  - Two separate upload areas: "Admission Fee Screenshot" + "Fees Screenshot (1st Installment)"
  - Pay Now = Admission Fee + 1st Installment
- **2nd Installment Due**: Calculated at course halfway (when admin approves first payment)
  - Due date = approval date + (course weeks / 2)
- **Dashboard Notifications**: Yellow banner when 2nd installment is due
  - Modal to upload fee screenshot with payment method and reference
- **Admin Enrollments**: Shows installment status per enrollment (1st/2nd)
  - Approve/Reject buttons for 2nd installment when submitted
- **Email Notifications**: Sent on 2nd installment approval (MOCKED - needs Resend API key)

## Enrollment Flow
1. Student fills admission form (personal + parent details)
2. Student uploads documents (ID, degree, B-form)
3. Student pays Admission Fee + 1st Installment → uploads screenshots
4. Admin approves → Course unlocks, 2nd installment due date set
5. At course halfway → Email + Dashboard notification for 2nd installment
6. Student uploads 2nd installment screenshot from Dashboard
7. Admin approves 2nd installment

## Backlog
### P1
- Resend email integration (needs API key from user)

### P2
- Refactor server.py (~1000 lines - split into route modules)
- Real payment gateway
- Course progress analytics charts

### P3
- Student messaging, instructor profiles, SEO
