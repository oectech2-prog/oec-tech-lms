import { api } from './api.js';

export const auth = {
  user: null,
  loading: true,
  listeners: [],

  onChange(fn) { this.listeners.push(fn); },
  notify() { this.listeners.forEach(fn => fn(this.user)); },

  async init() {
    if (window.location.hash?.includes('session_id=')) {
      this.loading = false;
      return;
    }
    try {
      this.user = await api.getMe();
    } catch {
      this.user = null;
    }
    this.loading = false;
    this.notify();
  },

  async handleCallback() {
    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) return false;
    try {
      const res = await api.createSession({ session_id: match[1] });
      this.user = res.user;
      this.notify();
      window.history.replaceState(null, '', '/dashboard');
      return true;
    } catch (e) {
      console.error('Auth callback failed:', e);
      window.history.replaceState(null, '', '/login');
      return false;
    }
  },

  login(userData) {
    this.user = userData;
    this.notify();
  },

  async logout() {
    try { await api.logout(); } catch {}
    this.user = null;
    this.notify();
  },

  async refresh() {
    try {
      this.user = await api.getMe();
      this.notify();
    } catch {
      this.user = null;
      this.notify();
    }
  },

  isAdmin() { return this.user?.role === 'admin'; },
  isLoggedIn() { return !!this.user; },
};
