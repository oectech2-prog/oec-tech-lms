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

  // Aggressively remove any injected third-party branding/badges
  function removeBranding() {
    // Remove the "Made with Emergent" badge
    const badge = document.getElementById('emergent-badge');
    if (badge) badge.remove();
    // Remove any fixed-position badges at bottom
    document.querySelectorAll('body > a[style*="fixed"], body > div[style*="fixed"]').forEach(el => {
      const txt = el.textContent || '';
      if (txt.includes('Made with') || txt.includes('Emergent') || txt.includes('Powered by')) el.remove();
    });
    // Remove emergent scripts
    document.querySelectorAll('script[src*="emergent"]').forEach(s => s.remove());
  }
  removeBranding();

  // Watch for dynamically injected elements
  const observer = new MutationObserver(() => removeBranding());
  observer.observe(document.body, { childList: true, subtree: false });

  console.log('OEC Tech Institute LMS loaded');
})();
