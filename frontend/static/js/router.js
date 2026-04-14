const routes = [];
let currentCleanup = null;

export function addRoute(pattern, handler) {
  const paramNames = [];
  const regexStr = pattern.replace(/:(\w+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  routes.push({ regex: new RegExp(`^${regexStr}$`), paramNames, handler });
}

export function matchRoute(path) {
  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
      return { handler: route.handler, params };
    }
  }
  return null;
}

export async function navigate(path, replace = false) {
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }

  if (replace) {
    window.history.replaceState(null, '', path);
  } else {
    window.history.pushState(null, '', path);
  }
  await renderCurrentRoute();
}

export async function renderCurrentRoute() {
  const path = window.location.pathname;
  const matched = matchRoute(path);

  if (!matched) {
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center"><h1 class="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <a href="/" data-link class="btn-gold px-6 py-3 text-sm">Go Home</a></div>
      </div>`;
    return;
  }

  try {
    const result = await matched.handler(matched.params);
    if (result && typeof result.cleanup === 'function') {
      currentCleanup = result.cleanup;
    }
  } catch (e) {
    console.error('Route error:', e);
  }

  window.scrollTo(0, 0);
  if (window.lucide) lucide.createIcons();
}

export function initRouter() {
  window.addEventListener('popstate', () => renderCurrentRoute());

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href') || link.dataset.href;
      if (href) navigate(href);
    }
  });
}
