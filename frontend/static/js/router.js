// OEC Tech Institute - Router (pushState SPA)
const Router = {
  routes: [],
  currentCleanup: null,

  add(path, handler, opts = {}) {
    this.routes.push({ path, handler, ...opts });
  },

  navigate(path) {
    window.history.pushState(null, '', path);
    this.resolve();
  },

  resolve() {
    if (this.currentCleanup) { this.currentCleanup(); this.currentCleanup = null; }
    const path = window.location.pathname;
    for (const route of this.routes) {
      const match = this._match(route.path, path);
      if (match) {
        // Auth guards
        if (route.requireAuth && !Auth.isLoggedIn()) { this.navigate('/login'); return; }
        if (route.requireAdmin && !Auth.isAdmin()) { this.navigate('/admin/login'); return; }
        const cleanup = route.handler(match.params);
        if (typeof cleanup === 'function') this.currentCleanup = cleanup;
        window.scrollTo(0, 0);
        return;
      }
    }
    // 404 fallback
    document.getElementById('app').innerHTML = `<div class="min-h-screen flex items-center justify-center"><div class="text-center"><h1 class="text-4xl font-bold text-white mb-4">404</h1><p class="text-mutedText mb-6">Page not found</p><a href="/" data-link class="btn-gold px-6 py-3 text-sm">Go Home</a></div></div>`;
    initIcons();
  },

  _match(routePath, actualPath) {
    const routeParts = routePath.split('/').filter(Boolean);
    const pathParts = actualPath.split('/').filter(Boolean);
    if (routeParts.length !== pathParts.length) return null;
    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return { params };
  },

  init() {
    // Intercept link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== window.location.pathname) {
          this.navigate(href);
        } else if (href === window.location.pathname) {
          this.resolve();
        }
      }
    });
    window.addEventListener('popstate', () => this.resolve());
  }
};

// Helper to reinitialize Lucide icons after DOM updates
function initIcons() {
  if (window.lucide) lucide.createIcons();
  // Remove any injected third-party branding badges
  document.querySelectorAll('[data-emergent], [class*="emergent"], a[href*="emergent"]').forEach(el => {
    if (!el.closest('#app') || el.tagName === 'A' && el.href?.includes('emergent') && !el.closest('form')) el.remove();
  });
  const badge = document.querySelector('div[style*="position: fixed"][style*="bottom"]');
  if (badge && badge.textContent?.includes('Made with')) badge.remove();
}

// SEO: Update page title based on route
function setPageTitle(subtitle) {
  document.title = subtitle
    ? `${subtitle} | OEC Tech Institute`
    : 'OEC Tech Institute LMS | Courses, Diplomas, Reviews & Testimonials';
}

// Toast system
function showToast(msg, type = 'success') {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  const bg = type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-yellow-600' : 'bg-green-600';
  el.className = `toast-enter ${bg} text-white text-sm px-4 py-3 rounded-lg shadow-lg max-w-sm`;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => { el.classList.replace('toast-enter', 'toast-exit'); setTimeout(() => el.remove(), 300); }, 3000);
}

// Render helper for layout pages
function renderPublicPage(content) {
  const app = document.getElementById('app');
  const isDashboard = ['/dashboard', '/admin', '/my-course', '/profile', '/checkout', '/certificate'].some(p => window.location.pathname.startsWith(p));
  if (isDashboard) {
    app.innerHTML = content;
  } else {
    app.innerHTML = Components.header() + `<main class="pt-16">${content}</main>` + Components.footer() + Components.whatsapp();
  }
  initIcons();
}

function renderDashboardPage(content) {
  document.getElementById('app').innerHTML = content;
  initIcons();
}
