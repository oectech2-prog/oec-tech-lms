import { auth } from './auth.js';
import { addRoute, initRouter, navigate, renderCurrentRoute } from './router.js';

// ==================== TOAST ====================
export function toast(msg, type = 'success') {
  const container = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast-item toast-${type}`;
  el.innerHTML = `<span>${type === 'success' ? '&#10003;' : '&#10007;'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(-10px)'; setTimeout(() => el.remove(), 300); }, 3000);
}
window.toast = toast;

// ==================== SHARED COMPONENTS ====================
const NAV_LINKS = [
  { to: '/', label: 'Home' }, { to: '/courses', label: 'Courses' },
  { to: '/diploma-tracks', label: 'Diplomas' }, { to: '/reviews', label: 'Reviews' },
  { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }, { to: '/faq', label: 'FAQ' },
];

function renderHeader() {
  const u = auth.user;
  const path = window.location.pathname;
  return `
  <header id="main-header" data-testid="main-header" class="fixed top-0 w-full z-50 transition-all duration-300 header-visible bg-[#050505]/95 backdrop-blur-xl border-b border-white/5">
    <div class="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
      <a href="/" data-link class="flex items-center gap-2 group" data-testid="logo-link">
        <i data-lucide="graduation-cap" class="w-8 h-8 text-[#D4AF37]"></i>
        <span class="text-lg font-bold text-white">OEC <span class="text-[#D4AF37]">Tech</span> Institute</span>
      </a>
      <nav class="hidden lg:flex items-center gap-1">
        ${NAV_LINKS.map(l => `<a href="${l.to}" data-link data-testid="nav-${l.label.toLowerCase()}" class="px-3 py-2 rounded-lg text-sm font-medium transition-colors ${path === l.to ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}">${l.label}</a>`).join('')}
      </nav>
      <div class="hidden lg:flex items-center gap-3">
        ${u ? `
          <div class="relative" id="user-dropdown">
            <button data-testid="user-menu-trigger" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors" onclick="document.getElementById('dropdown-menu').classList.toggle('hidden')">
              ${u.picture ? `<img src="${u.picture}" alt="" class="w-8 h-8 rounded-full border border-[#D4AF37]/50">` : `<div class="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-sm font-bold">${u.name?.charAt(0) || '?'}</div>`}
              <span class="text-sm text-white font-medium">${u.name?.split(' ')[0] || ''}</span>
              <i data-lucide="chevron-down" class="w-4 h-4 text-[#A1A1AA]"></i>
            </button>
            <div id="dropdown-menu" class="hidden absolute right-0 top-12 bg-[#111] border border-[#27272A] rounded-xl min-w-[180px] py-2 shadow-xl z-50">
              <a href="/dashboard" data-link class="block px-4 py-2 text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5">Dashboard</a>
              <a href="/profile" data-link class="block px-4 py-2 text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5">Profile</a>
              ${u.role === 'admin' ? `<div class="border-t border-[#27272A] my-1"></div><a href="/admin" data-link class="block px-4 py-2 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10">Admin Panel</a>` : ''}
              <div class="border-t border-[#27272A] my-1"></div>
              <button id="header-logout" class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">Logout</button>
            </div>
          </div>
        ` : `
          <a href="/login" data-link data-testid="login-btn" class="px-5 py-2 text-sm font-semibold text-[#D4AF37] border border-[#D4AF37] rounded-full hover:bg-[#D4AF37]/10 transition-colors">Login</a>
          <a href="/courses" data-link data-testid="enroll-now-header-btn" class="btn-gold px-5 py-2 text-sm">Enroll Now</a>
        `}
      </div>
      <button data-testid="mobile-menu-toggle" id="mobile-toggle" class="lg:hidden p-2 text-white">
        <i data-lucide="menu" class="w-6 h-6"></i>
      </button>
    </div>
    <div id="mobile-menu" class="hidden lg:hidden bg-[#050505]/95 backdrop-blur-xl border-t border-[#27272A] px-4 pb-4">
      <nav class="flex flex-col gap-1 py-2">
        ${NAV_LINKS.map(l => `<a href="${l.to}" data-link class="px-4 py-3 rounded-lg text-sm font-medium ${path === l.to ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#A1A1AA] hover:text-white'}">${l.label}</a>`).join('')}
      </nav>
      <div class="flex flex-col gap-2 pt-2 border-t border-[#27272A]">
        ${u ? `
          <a href="/dashboard" data-link class="px-4 py-3 text-sm text-white hover:bg-white/5 rounded-lg">Dashboard</a>
          ${u.role === 'admin' ? '<a href="/admin" data-link class="px-4 py-3 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg">Admin Panel</a>' : ''}
          <button id="mobile-logout" class="px-4 py-3 text-sm text-red-400 text-left hover:bg-red-500/10 rounded-lg">Logout</button>
        ` : `
          <a href="/login" data-link class="btn-gold-outline text-center px-4 py-3 text-sm">Login</a>
          <a href="/courses" data-link class="btn-gold text-center px-4 py-3 text-sm">Enroll Now</a>
        `}
      </div>
    </div>
  </header>`;
}

function renderFooter() {
  return `
  <footer data-testid="main-footer" class="bg-[#0A0A0A] border-t border-[#27272A]">
    <div class="max-w-7xl mx-auto px-6 md:px-12 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div class="space-y-4">
          <div class="flex items-center gap-2"><i data-lucide="graduation-cap" class="w-7 h-7 text-[#D4AF37]"></i><span class="text-lg font-bold text-white">OEC <span class="text-[#D4AF37]">Tech</span> Institute</span></div>
          <p class="text-[#A1A1AA] text-sm leading-relaxed">Empowering students across Pakistan, UAE, UK & USA with real digital skills to earn online.</p>
          <a href="https://wa.me/923000517616" target="_blank" rel="noopener" data-testid="footer-whatsapp" class="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300"><i data-lucide="message-circle" class="w-4 h-4"></i>Chat on WhatsApp</a>
        </div>
        <div>
          <h4 class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Quick Links</h4>
          <ul class="space-y-3">
            ${[{to:'/courses',l:'All Courses'},{to:'/diploma-tracks',l:'Diploma Tracks'},{to:'/reviews',l:'Student Reviews'},{to:'/about',l:'About Us'},{to:'/faq',l:'FAQ'}].map(x => `<li><a href="${x.to}" data-link class="text-sm text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">${x.l}</a></li>`).join('')}
          </ul>
        </div>
        <div>
          <h4 class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Popular Courses</h4>
          <ul class="space-y-3">
            ${['Social Media Marketing','Graphic Designing','Shopify Dropshipping','WordPress Development','Amazon VA'].map(c => `<li><a href="/courses" data-link class="text-sm text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">${c}</a></li>`).join('')}
          </ul>
        </div>
        <div>
          <h4 class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Contact Us</h4>
          <ul class="space-y-3">
            <li class="flex items-center gap-2 text-sm text-[#A1A1AA]"><i data-lucide="mail" class="w-4 h-4 text-[#D4AF37]"></i>info@oectechs.com</li>
            <li class="flex items-center gap-2 text-sm text-[#A1A1AA]"><i data-lucide="phone" class="w-4 h-4 text-[#D4AF37]"></i>0300-0517616</li>
            <li class="flex items-center gap-2 text-sm text-[#A1A1AA]"><i data-lucide="map-pin" class="w-4 h-4 text-[#D4AF37]"></i>Pakistan | UAE | UK | USA</li>
          </ul>
        </div>
      </div>
      <div class="mt-12 pt-8 border-t border-[#27272A] flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-xs text-[#A1A1AA]">&copy; ${new Date().getFullYear()} OEC Tech Institute. All rights reserved.</p>
        <div class="flex gap-4 text-xs text-[#A1A1AA]">
          <a href="/privacy-policy" data-link class="hover:text-[#D4AF37]">Privacy Policy</a>
          <a href="/terms-of-service" data-link class="hover:text-[#D4AF37]">Terms of Service</a>
          <a href="/refund-policy" data-link class="hover:text-[#D4AF37]">Refund Policy</a>
        </div>
      </div>
    </div>
  </footer>`;
}

function renderWhatsApp() {
  return `<a href="https://wa.me/923000517616" target="_blank" rel="noopener" class="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform hover:scale-110" data-testid="whatsapp-float"><i data-lucide="message-circle" class="w-6 h-6"></i></a>`;
}

// ==================== ADMIN SIDEBAR ====================
export function adminSidebar(active) {
  const items = [
    { to: '/admin', icon: 'bar-chart-3', label: 'Dashboard' },
    { to: '/admin/courses', icon: 'book-open', label: 'Courses' },
    { to: '/admin/students', icon: 'users', label: 'Students' },
    { to: '/admin/enrollments', icon: 'credit-card', label: 'Payments' },
    { to: '/admin/admissions', icon: 'file-text', label: 'Admissions' },
    { to: '/admin/diploma-students', icon: 'award', label: 'Diploma' },
    { to: '/admin/defaulters', icon: 'alert-triangle', label: 'Defaulters' },
    { to: '/admin/assignments', icon: 'file-text', label: 'Assignments' },
  ];
  return `
  <aside class="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col shrink-0">
    <div class="p-5 border-b border-[#27272A]"><a href="/" data-link class="flex items-center gap-2"><i data-lucide="graduation-cap" class="w-6 h-6 text-[#D4AF37]"></i><span class="text-sm font-bold text-white">OEC <span class="text-[#D4AF37]">Tech</span></span></a></div>
    <nav class="flex-1 p-3 space-y-1">
      ${items.map(i => `<a href="${i.to}" data-link class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${i.to === active ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}"><i data-lucide="${i.icon}" class="w-4 h-4"></i>${i.label}</a>`).join('')}
    </nav>
    <div class="p-3 border-t border-[#27272A]"><button id="admin-logout" class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 w-full"><i data-lucide="log-out" class="w-4 h-4"></i>Logout</button></div>
  </aside>`;
}

export function adminMobileNav(active) {
  const items = [
    { to: '/admin', label: 'Dashboard' }, { to: '/admin/courses', label: 'Courses' },
    { to: '/admin/students', label: 'Students' }, { to: '/admin/enrollments', label: 'Payments' },
    { to: '/admin/admissions', label: 'Admissions' }, { to: '/admin/diploma-students', label: 'Diploma' },
    { to: '/admin/defaulters', label: 'Defaulters' }, { to: '/admin/assignments', label: 'Assignments' },
  ];
  return `
  <div class="md:hidden flex items-center justify-between mb-4 overflow-x-auto">
    <div class="flex items-center gap-2 shrink-0"><i data-lucide="graduation-cap" class="w-5 h-5 text-[#D4AF37]"></i><span class="text-sm font-bold text-white">OEC <span class="text-[#D4AF37]">Tech</span></span></div>
    <div class="flex gap-1">${items.map(i => `<a href="${i.to}" data-link class="p-2 rounded-lg text-[10px] whitespace-nowrap ${i.to === active ? 'text-[#D4AF37] bg-white/5' : 'text-[#A1A1AA] hover:bg-white/5'}">${i.label}</a>`).join('')}</div>
  </div>`;
}

// ==================== LAYOUT ====================
function updateLayout() {
  const path = window.location.pathname;
  const isDash = path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/my-course') || path.startsWith('/profile') || path.startsWith('/checkout') || path.startsWith('/certificate');

  const headerEl = document.getElementById('header-root');
  const footerEl = document.getElementById('footer-root');
  const waEl = document.getElementById('whatsapp-root');

  if (isDash) {
    headerEl.innerHTML = '';
    footerEl.innerHTML = '';
  } else {
    headerEl.innerHTML = renderHeader();
    footerEl.innerHTML = renderFooter();
  }
  waEl.innerHTML = renderWhatsApp();

  if (window.lucide) lucide.createIcons();

  // Header event listeners
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.onclick = () => mobileMenu.classList.toggle('hidden');
  }
  const logoutBtn = document.getElementById('header-logout');
  if (logoutBtn) logoutBtn.onclick = async () => { await auth.logout(); navigate('/'); };
  const mobileLogout = document.getElementById('mobile-logout');
  if (mobileLogout) mobileLogout.onclick = async () => { await auth.logout(); navigate('/'); };

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('dropdown-menu');
    const trigger = document.getElementById('user-dropdown');
    if (dd && trigger && !trigger.contains(e.target)) dd.classList.add('hidden');
  });

  // Add pt-16 for header pages
  const appEl = document.getElementById('app');
  if (!isDash) {
    appEl.style.paddingTop = '64px';
  } else {
    appEl.style.paddingTop = '0';
  }
}

// ==================== ROUTE REGISTRATION ====================
async function registerRoutes() {
  const { homePage } = await import('./pages/home.js');
  const { coursesPage } = await import('./pages/courses.js');
  const { courseDetailPage } = await import('./pages/courseDetail.js');
  const { diplomaTracksPage } = await import('./pages/diplomaTracks.js');
  const { reviewsPage } = await import('./pages/reviews.js');
  const { aboutPage } = await import('./pages/about.js');
  const { contactPage } = await import('./pages/contact.js');
  const { faqPage } = await import('./pages/faq.js');
  const { loginPage } = await import('./pages/login.js');
  const { dashboardPage } = await import('./pages/dashboard.js');
  const { myCourseViewPage } = await import('./pages/myCourseView.js');
  const { checkoutPage } = await import('./pages/checkout.js');
  const { trackCheckoutPage } = await import('./pages/trackCheckout.js');
  const { profilePage } = await import('./pages/profile.js');
  const { certificatePage } = await import('./pages/certificate.js');
  const { privacyPage, termsPage, refundPage } = await import('./pages/policies.js');
  const { adminLoginPage } = await import('./pages/admin/login.js');
  const { adminDashboardPage } = await import('./pages/admin/dashboard.js');
  const { adminCoursesPage } = await import('./pages/admin/courses.js');
  const { adminStudentsPage } = await import('./pages/admin/students.js');
  const { adminEnrollmentsPage } = await import('./pages/admin/enrollments.js');
  const { adminAdmissionsPage } = await import('./pages/admin/admissions.js');
  const { adminDiplomaStudentsPage } = await import('./pages/admin/diplomaStudents.js');
  const { adminDefaultersPage } = await import('./pages/admin/defaulters.js');
  const { adminAssignmentsPage } = await import('./pages/admin/assignments.js');

  const protectedRoute = (handler) => async (params) => {
    if (!auth.user) { navigate('/login', true); return; }
    return handler(params);
  };
  const adminRoute = (handler) => async (params) => {
    if (!auth.user || auth.user.role !== 'admin') { navigate('/admin/login', true); return; }
    return handler(params);
  };

  addRoute('/', homePage);
  addRoute('/courses', coursesPage);
  addRoute('/courses/:courseId', courseDetailPage);
  addRoute('/diploma-tracks', diplomaTracksPage);
  addRoute('/reviews', reviewsPage);
  addRoute('/about', aboutPage);
  addRoute('/contact', contactPage);
  addRoute('/faq', faqPage);
  addRoute('/login', loginPage);
  addRoute('/privacy-policy', privacyPage);
  addRoute('/terms-of-service', termsPage);
  addRoute('/refund-policy', refundPage);
  addRoute('/dashboard', protectedRoute(dashboardPage));
  addRoute('/my-course/:enrollmentId', protectedRoute(myCourseViewPage));
  addRoute('/checkout/:courseId', protectedRoute(checkoutPage));
  addRoute('/checkout/track/:trackId', protectedRoute(trackCheckoutPage));
  addRoute('/profile', protectedRoute(profilePage));
  addRoute('/certificate/:enrollmentId', protectedRoute(certificatePage));
  addRoute('/admin/login', adminLoginPage);
  addRoute('/admin', adminRoute(adminDashboardPage));
  addRoute('/admin/courses', adminRoute(adminCoursesPage));
  addRoute('/admin/students', adminRoute(adminStudentsPage));
  addRoute('/admin/enrollments', adminRoute(adminEnrollmentsPage));
  addRoute('/admin/admissions', adminRoute(adminAdmissionsPage));
  addRoute('/admin/diploma-students', adminRoute(adminDiplomaStudentsPage));
  addRoute('/admin/defaulters', adminRoute(adminDefaultersPage));
  addRoute('/admin/assignments', adminRoute(adminAssignmentsPage));
}

// ==================== INIT ====================
async function init() {
  // Show preloader
  document.getElementById('app').innerHTML = '<div class="min-h-screen flex items-center justify-center"><div class="spinner"></div></div>';

  // Handle OAuth callback
  if (window.location.hash?.includes('session_id=')) {
    await auth.handleCallback();
  } else {
    await auth.init();
  }

  await registerRoutes();
  initRouter();

  // Update layout before rendering route
  const origRender = window.addEventListener;
  auth.onChange(() => updateLayout());
  updateLayout();
  await renderCurrentRoute();

  // Scroll-based header hide/show
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (!header) return;
    const y = window.scrollY;
    header.classList.toggle('bg-[#050505]/95', y > 20);
    if (y > 80 && y > lastY + 5) header.classList.replace('header-visible', 'header-hidden');
    else if (y < lastY - 5 || y < 80) header.classList.replace('header-hidden', 'header-visible');
    lastY = y;
  }, { passive: true });

  // Re-render layout on navigation
  const origNavigate = window.history.pushState;
  const origReplace = window.history.replaceState;
  const wrap = (orig) => function() { orig.apply(this, arguments); updateLayout(); };
  window.history.pushState = wrap(origNavigate);
  window.history.replaceState = wrap(origReplace);
  window.addEventListener('popstate', () => updateLayout());
}

init();
