# OEC Tech Institute - PRD

## Problem Statement
Complete e-learning website with student dashboard, admin panel, Google auth, and payment system for selling online courses.

## Architecture
- Frontend: React + Tailwind CSS + Shadcn UI + Framer Motion + Swiper
- Backend: FastAPI + MongoDB (Motor async driver)
- Auth: Google OAuth (Emergent-managed)
- Theme: Black (#050505), White, Gold (#D4AF37)

## What's Been Implemented

### Phase 1 - MVP
- 8 courses with weekly structure, assignments, and final projects
- 3 diploma tracks with career roadmaps
- Student dashboard, admin panel
- Google OAuth, payment flow (JazzCash, EasyPaisa, Soneri Bank)

### Phase 2 - Brand & UI
- Brand: OEC Tech Institute
- 3D Hero Image with floating glass badges
- Fee Receipt Upload for admin verification
- Framer Motion animations throughout

### Phase 3 - Features
- Sticky header (scroll-aware show/hide)
- 104 student reviews with Swiper carousel
- Certificate PDF generation (jsPDF)
- Email framework (Resend - MOCKED, awaiting API key)
- Preloader, ScrollToTop, WhatsApp chat widget

### Phase 4 - Pricing & Policies (April 8, 2026)
- **Course Pricing**: Course fee + Admission fee for all 8 courses
- **Enroll Now Button**: Added to all course cards on Courses page
- **Diploma Track Checkout**: /checkout/track/{id} with total investment breakdown
- **Privacy Policy**: /privacy-policy
- **Terms of Service**: /terms-of-service
- **Refund Policy**: /refund-policy with bank details and refund rules
- **Footer**: Links to all policy pages

## Course Pricing
| Course | Course Fee | Admission Fee | Total |
|--------|-----------|---------------|-------|
| Computer Applications | 6,000 | 1,000 | 7,000 |
| Graphic Designing | 12,000 | 1,000 | 13,000 |
| Social Media Marketing | 12,000 | 1,000 | 13,000 |
| WordPress Web Dev | 12,000 | 1,000 | 13,000 |
| Shopify Dropshipping | 16,000 | 2,000 | 18,000 |
| Amazon Virtual Assistant | 20,000 | 2,000 | 22,000 |
| eBay Virtual Assistant | 20,000 | 2,000 | 22,000 |
| YouTube & TikTok Automation | 12,000 | 1,000 | 13,000 |

## Bank Details
- JazzCash: 983012259 (OEC Tech Institute)
- EasyPaisa: 0300-1413747 (Sadam Mubarak)
- Soneri Bank: 20016289664 (Sadam Mubarak)

## Contact
- Email: info@oectechs.com
- Phone: 0300-0517616
- Location: OEC Tech Institute, Chunian, Pakistan

## Backlog
### P1
- Resend email integration (needs API key)
- Admin course creation/editing form

### P2
- Real payment gateway integration
- Course progress analytics
- Student messaging
- Instructor profiles
- Advanced SEO
