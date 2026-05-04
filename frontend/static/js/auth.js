// OEC Tech Institute - Auth State Manager
const Auth = {
  user: null,
  loading: true,
  listeners: [],

  onChange(fn) { this.listeners.push(fn); },
  notify() { this.listeners.forEach(fn => fn(this.user)); },

  async init() {
    // Check if returning from OAuth callback - handle BEFORE anything else
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const sessionId = new URLSearchParams(hash.substring(1)).get('session_id') || new URLSearchParams(search).get('session_id');

    if (sessionId) {
      await this.handleCallback(sessionId);
      this.loading = false;
      return;
    }

    // Normal session check
    try {
      this.user = await Api.getMe();
    } catch { this.user = null; }
    this.loading = false;
    this.notify();
  },

  async handleCallback(sessionId) {
    try {
      const res = await Api.exchangeSession(sessionId);
      this.user = res.user;
      // Clean URL
      window.history.replaceState(null, '', '/dashboard');
      this.notify();
    } catch (err) {
      console.error('Auth callback failed:', err);
      this.user = null;
      this.notify();
      window.history.replaceState(null, '', '/login');
    }
  },

  login(userData) { this.user = userData; this.notify(); },

  async logout() {
    try { await Api.logout(); } catch {}
    this.user = null;
    this.notify();
    Router.navigate('/');
  },

  async refreshUser() {
    try { this.user = await Api.getMe(); this.notify(); } catch { this.user = null; this.notify(); }
  },

  isAdmin() { return this.user?.role === 'admin'; },
  isLoggedIn() { return !!this.user; }
};
