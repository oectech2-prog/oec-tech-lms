// Admin Login
function renderAdminLoginPage() {
  renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex items-center justify-center px-4">
    <div class="glass-panel rounded-2xl p-10 max-w-md w-full text-center">
      <i data-lucide="shield" class="w-14 h-14 text-[#D4AF37] mx-auto mb-4"></i>
      <h1 class="text-2xl font-bold text-white mb-2">Admin Panel</h1>
      <p class="text-sm text-[#A1A1AA] mb-6">Enter admin password to continue</p>
      <form id="admin-login-form" class="space-y-4">
        <input type="password" name="password" data-testid="admin-password" placeholder="Enter password" class="w-full bg-[#050505] border border-[#27272A] rounded-lg px-4 py-3 text-sm text-white text-center focus:border-[#D4AF37] focus:outline-none">
        <button type="submit" data-testid="admin-login-btn" class="btn-gold w-full py-3 text-sm">Login</button>
      </form>
    </div>
  </div>`);
  document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = e.target.querySelector('input[name=password]').value;
    if (!pw) { showToast('Enter password', 'error'); return; }
    try {
      const res = await Api.adminLogin(pw);
      if (res.user) Auth.login(res.user);
      else await Auth.refreshUser();
      showToast('Welcome, Admin!');
      Router.navigate('/admin');
    } catch { showToast('Invalid password', 'error'); }
  });
}
