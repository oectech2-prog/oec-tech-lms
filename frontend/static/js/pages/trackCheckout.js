// Track Checkout (simplified - follows same pattern as Checkout)
function renderTrackCheckoutPage(params) {
  renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex items-center justify-center px-4"><div class="text-center"><p class="text-[#A1A1AA] mb-4">Diploma Track Checkout</p><p class="text-sm text-[#A1A1AA] mb-6">Track ID: ${params.trackId}</p><a href="/diploma-tracks" data-link class="btn-gold-outline px-6 py-3 text-sm mr-2">Back to Tracks</a><a href="/login" data-link class="btn-gold px-6 py-3 text-sm">Login to Enroll</a></div></div>`);
  initIcons();
}

// Profile Page
function renderProfilePage() {
  if (!Auth.isLoggedIn()) { Router.navigate('/login'); return; }
  const u = Auth.user;
  renderDashboardPage(`<div data-testid="profile-page" class="min-h-screen bg-[#050505] py-8 px-4"><div class="max-w-2xl mx-auto">
    <a href="/dashboard" data-link class="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-8"><i data-lucide="arrow-left" class="w-4 h-4"></i>Back to Dashboard</a>
    <h1 class="text-2xl font-bold text-white mb-8">Profile Settings</h1>
    <div class="bg-[#111111] border border-[#27272A] rounded-2xl p-6 sm:p-8">
      <div class="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-[#27272A]">
        <div class="relative">${u?.picture ? `<img src="${u.picture}" alt="" class="w-24 h-24 rounded-full border-2 border-[#D4AF37] object-cover">` : `<div class="w-24 h-24 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-3xl font-bold">${(u?.name||'U').charAt(0)}</div>`}</div>
        <div class="flex-1 w-full sm:w-auto">
          <label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Full Name</label>
          <div class="flex gap-2">
            <input data-testid="profile-name-input" id="profile-name" value="${u?.name||''}" class="flex-1 bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none">
            <button data-testid="save-name-btn" onclick="window._saveName()" class="px-4 py-2.5 bg-[#D4AF37] text-black rounded-lg text-xs font-bold hover:bg-[#c4a030] shrink-0"><i data-lucide="save" class="w-3.5 h-3.5 inline mr-1"></i>Save</button>
          </div>
          <p class="text-xs text-[#A1A1AA] mt-2">${u?.email||''}</p>
          <span class="text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block ${u?.role==='admin'?'bg-[#D4AF37]/10 text-[#D4AF37]':'bg-blue-500/10 text-blue-400'}">${u?.role==='admin'?'Admin':'Student'}</span>
        </div>
      </div>
      <div class="space-y-5">
        <div class="flex items-center gap-4"><i data-lucide="mail" class="w-5 h-5 text-[#D4AF37] shrink-0"></i><div><p class="text-xs text-[#A1A1AA]">Email</p><p class="text-sm text-white font-medium">${u?.email||''}</p></div></div>
        <div class="flex items-center gap-4"><i data-lucide="shield" class="w-5 h-5 text-[#D4AF37] shrink-0"></i><div><p class="text-xs text-[#A1A1AA]">Role</p><p class="text-sm text-white font-medium capitalize">${u?.role||''}</p></div></div>
        <div class="flex items-center gap-4"><i data-lucide="calendar" class="w-5 h-5 text-[#D4AF37] shrink-0"></i><div><p class="text-xs text-[#A1A1AA]">Member Since</p><p class="text-sm text-white font-medium">${u?.created_at ? new Date(u.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : 'N/A'}</p></div></div>
      </div>
    </div>
  </div></div>`);

  window._saveName = async () => {
    const name = document.getElementById('profile-name')?.value?.trim();
    if (!name) { showToast('Name cannot be empty', 'error'); return; }
    try { await Api.updateProfile({ name }); await Auth.refreshUser(); showToast('Name updated!'); } catch { showToast('Failed', 'error'); }
  };
}

// Certificate Page
function renderCertificatePage(params) {
  renderDashboardPage(Components.loading());
  Api.getMyCourses().then(enrolled => {
    const data = enrolled.find(e => e.enrollment.enrollment_id === params.enrollmentId);
    if (!data || data.enrollment.progress < 100) {
      renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex items-center justify-center px-4"><div class="text-center glass-panel rounded-2xl p-10 max-w-md"><i data-lucide="award" class="w-16 h-16 text-[#27272A] mx-auto mb-4"></i><h2 class="text-xl font-bold text-white mb-3">Certificate Not Available</h2><p class="text-sm text-[#A1A1AA] mb-6">Complete all lessons to earn your certificate.</p><a href="/dashboard" data-link class="btn-gold px-6 py-3 text-sm">Back to Dashboard</a></div></div>`);
      initIcons(); return;
    }
    const { enrollment: enr, course } = data;
    const certId = `OEC-${enr.enrollment_id.slice(-8).toUpperCase()}`;

    renderDashboardPage(`<div data-testid="certificate-page" class="min-h-screen bg-[#050505] py-8 px-4"><div class="max-w-4xl mx-auto">
      <a href="/dashboard" data-link class="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-8"><i data-lucide="arrow-left" class="w-4 h-4"></i>Back to Dashboard</a>
      <div class="bg-[#111111] border-2 border-[#D4AF37] rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
        <div class="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-[#D4AF37]"></div>
        <div class="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-[#D4AF37]"></div>
        <div class="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-[#D4AF37]"></div>
        <div class="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-[#D4AF37]"></div>
        <p class="text-sm uppercase tracking-[0.3em] text-[#D4AF37] mb-2">OEC Tech Institute</p>
        <h1 class="text-3xl sm:text-4xl font-bold text-white mb-1">CERTIFICATE</h1>
        <p class="text-sm text-[#A1A1AA] mb-8">OF COMPLETION</p>
        <div class="w-20 h-[1px] bg-[#D4AF37] mx-auto mb-8"></div>
        <p class="text-sm text-[#A1A1AA] mb-2">This certificate is proudly presented to</p>
        <h2 class="text-2xl sm:text-3xl font-bold text-gold-gradient mb-2">${enr.user_name || Auth.user?.name || 'Student'}</h2>
        <div class="w-48 h-[1px] bg-[#D4AF37]/50 mx-auto mb-8"></div>
        <p class="text-sm text-[#A1A1AA] mb-2">for successfully completing the course</p>
        <h3 class="text-xl font-bold text-white mb-2">${course.title}</h3>
        <p class="text-xs text-[#A1A1AA] mb-10">${course.duration} | ${course.level} | ${course.weeks?.length||0} Weeks</p>
        <div class="flex flex-wrap justify-center gap-8 pt-8 border-t border-[#27272A]">
          <div class="flex items-center gap-2 text-sm"><i data-lucide="calendar" class="w-4 h-4 text-[#D4AF37]"></i><span class="text-[#A1A1AA]">${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span></div>
          <div class="flex items-center gap-2 text-sm"><i data-lucide="hash" class="w-4 h-4 text-[#D4AF37]"></i><span class="text-[#A1A1AA]">${certId}</span></div>
          <div class="flex items-center gap-2 text-sm"><i data-lucide="award" class="w-4 h-4 text-[#D4AF37]"></i><span class="text-[#A1A1AA]">OEC Tech Institute</span></div>
        </div>
      </div>
      <div class="text-center mt-8"><button data-testid="download-certificate-btn" onclick="showToast('Certificate download requires jsPDF library')" class="btn-gold px-6 py-2.5 text-sm">Download Certificate (PDF)</button></div>
    </div></div>`);
  }).catch(() => renderDashboardPage('<div class="min-h-screen flex items-center justify-center"><p class="text-[#A1A1AA]">Failed to load certificate</p></div>'));
}
