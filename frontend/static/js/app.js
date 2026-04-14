// OEC Tech Institute - Main App Initialization
(async function() {
  // Register routes
  Router.add('/', () => renderHomePage());
  Router.add('/courses', () => renderCoursesPage());
  Router.add('/courses/:courseId', (p) => renderCourseDetailPage(p));
  Router.add('/diploma-tracks', () => renderDiplomaTracksPage());
  Router.add('/reviews', () => renderReviewsPage());
  Router.add('/about', () => renderAboutPage());
  Router.add('/contact', () => renderContactPage());
  Router.add('/faq', () => renderFaqPage());
  Router.add('/login', () => renderLoginPage());
  Router.add('/video-testimonials', () => renderVideoTestimonialsPage());
  Router.add('/privacy-policy', () => renderPrivacyPage());
  Router.add('/terms-of-service', () => renderTermsPage());
  Router.add('/refund-policy', () => renderRefundPage());

  // Student routes (auth required)
  Router.add('/dashboard', () => renderDashboardPage_(), { requireAuth: true });
  Router.add('/my-course/:enrollmentId', (p) => renderMyCourseViewPage(p), { requireAuth: true });
  Router.add('/checkout/:courseId', (p) => renderCheckoutPage(p), { requireAuth: true });
  Router.add('/checkout/track/:trackId', (p) => renderTrackCheckoutPage(p), { requireAuth: true });
  Router.add('/profile', () => renderProfilePage(), { requireAuth: true });
  Router.add('/certificate/:enrollmentId', (p) => renderCertificatePage(p), { requireAuth: true });

  // Admin routes
  Router.add('/admin/login', () => renderAdminLoginPage());
  Router.add('/admin', () => renderAdminDashboardPage(), { requireAdmin: true });
  Router.add('/admin/courses', () => renderAdminCoursesPage(), { requireAdmin: true });
  Router.add('/admin/students', () => renderAdminStudentsPage(), { requireAdmin: true });
  Router.add('/admin/enrollments', () => renderAdminEnrollmentsPage(), { requireAdmin: true });
  Router.add('/admin/admissions', () => renderAdminAdmissionsPage(), { requireAdmin: true });
  Router.add('/admin/diploma-students', () => renderAdminDiplomaStudentsPage(), { requireAdmin: true });
  Router.add('/admin/defaulters', () => renderAdminDefaultersPage(), { requireAdmin: true });
  Router.add('/admin/assignments', () => renderAdminAssignmentsPage(), { requireAdmin: true });
  Router.add('/admin/video-testimonials', () => renderAdminVideoTestimonialsPage(), { requireAdmin: true });
  Router.add('/admin/expenses', () => renderAdminExpensesPage(), { requireAdmin: true });

  // Show loading
  document.getElementById('app').innerHTML = `<div class="min-h-screen bg-[#050505] flex items-center justify-center"><div class="text-center"><div class="spinner mx-auto mb-4"></div><p class="text-[#A1A1AA] text-sm">Loading OEC Tech Institute...</p></div></div>`;

  // Init auth
  await Auth.init();

  // Init router
  Router.init();
  Router.resolve();

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('user-dropdown');
    if (dd && !e.target.closest('#user-dropdown-wrap')) dd.classList.add('hidden');
  });

  console.log('OEC Tech Institute - Vanilla JS SPA loaded');
})();
