// OEC Tech Institute - Main App Initialization
(async function() {
  // Route with SEO title support
  function route(path, handler, opts = {}) {
    Router.add(path, (params) => {
      if (opts.title) setPageTitle(opts.title);
      return handler(params);
    }, opts);
  }

  // Public routes
  route('/', () => { setPageTitle(); renderHomePage(); }, {});
  route('/courses', () => renderCoursesPage(), { title: 'All Courses' });
  route('/courses/:courseId', (p) => renderCourseDetailPage(p), { title: 'Course Details' });
  route('/diploma-tracks', () => renderDiplomaTracksPage(), { title: 'Diploma Tracks' });
  route('/reviews', () => renderReviewsPage(), { title: 'Student Reviews' });
  route('/about', () => renderAboutPage(), { title: 'About Us' });
  route('/contact', () => renderContactPage(), { title: 'Contact Us' });
  route('/faq', () => renderFaqPage(), { title: 'FAQ' });
  route('/login', () => renderLoginPage(), { title: 'Login' });
  route('/video-testimonials', () => renderVideoTestimonialsPage(), { title: 'Video Testimonials' });
  route('/privacy-policy', () => renderPrivacyPage(), { title: 'Privacy Policy' });
  route('/terms-of-service', () => renderTermsPage(), { title: 'Terms of Service' });
  route('/refund-policy', () => renderRefundPage(), { title: 'Refund Policy' });

  // Student routes (auth required)
  route('/dashboard', () => renderDashboardPage_(), { requireAuth: true, title: 'Dashboard' });
  route('/my-course/:enrollmentId', (p) => renderMyCourseViewPage(p), { requireAuth: true, title: 'My Course' });
  route('/checkout/:courseId', (p) => renderCheckoutPage(p), { requireAuth: true, title: 'Checkout' });
  route('/checkout/track/:trackId', (p) => renderTrackCheckoutPage(p), { requireAuth: true, title: 'Diploma Checkout' });
  route('/profile', () => renderProfilePage(), { requireAuth: true, title: 'Profile' });
  route('/certificate/:enrollmentId', (p) => renderCertificatePage(p), { requireAuth: true, title: 'Certificate' });

  // Admin routes
  route('/admin/login', () => renderAdminLoginPage(), { title: 'Admin Login' });
  route('/admin', () => renderAdminDashboardPage(), { requireAdmin: true, title: 'Admin Dashboard' });
  route('/admin/courses', () => renderAdminCoursesPage(), { requireAdmin: true, title: 'Admin - Courses' });
  route('/admin/students', () => renderAdminStudentsPage(), { requireAdmin: true, title: 'Admin - Students' });
  route('/admin/enrollments', () => renderAdminEnrollmentsPage(), { requireAdmin: true, title: 'Admin - Payments' });
  route('/admin/admissions', () => renderAdminAdmissionsPage(), { requireAdmin: true, title: 'Admin - Admissions' });
  route('/admin/diploma-students', () => renderAdminDiplomaStudentsPage(), { requireAdmin: true, title: 'Admin - Diploma' });
  route('/admin/defaulters', () => renderAdminDefaultersPage(), { requireAdmin: true, title: 'Admin - Defaulters' });
  route('/admin/assignments', () => renderAdminAssignmentsPage(), { requireAdmin: true, title: 'Admin - Assignments' });
  route('/admin/video-testimonials', () => renderAdminVideoTestimonialsPage(), { requireAdmin: true, title: 'Admin - Videos' });
  route('/admin/expenses', () => renderAdminExpensesPage(), { requireAdmin: true, title: 'Admin - Expenses' });

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

  // Remove any injected branding on mutation
  const observer = new MutationObserver(() => {
    document.querySelectorAll('body > div:not(#app):not(#toast-container)').forEach(el => {
      if (el.textContent?.includes('Made with') || el.textContent?.includes('Emergent')) el.remove();
    });
  });
  observer.observe(document.body, { childList: true });

  console.log('OEC Tech Institute LMS loaded');
})();
