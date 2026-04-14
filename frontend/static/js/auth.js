// OEC Tech Institute - Auth State Manager
const Auth = {
  user: null,
  loading: true,
  listeners: [],

  onChange(fn) { this.listeners.push(fn); },
  notify() { this.listeners.forEach(fn => fn(this.user)); },

  async init() {
    // Check if returning from OAuth callback
    if (window.location.hash?.includes('session_id=')) {
      this.loading = false;
      await this.handleCallback();
      return;
    }
    try {
      this.user = await Api.getMe();
    } catch { this.user = null; }
    this.loading = false;
    this.notify();
  },

  async handleCallback() {
    const hash = window.location.hash;
    const sessionId = new URLSearchParams(hash.substring(1)).get('session_id');
    if (!sessionId) { Router.navigate('/login'); return; }
    try {
      const res = await Api.exchangeSession(sessionId);
      this.user = res.user;
      window.history.replaceState(null, '', window.location.pathname);
      this.notify();
      Router.navigate('/dashboard');
    } catch {
      Router.navigate('/login');
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
