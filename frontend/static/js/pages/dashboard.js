// Student Dashboard
function renderDashboardPage_() {
  if (!Auth.isLoggedIn()) { Router.navigate('/login'); return; }
  const u = Auth.user;
  renderDashboardPage(Components.loading());

  Promise.all([Api.getMyCourses(), Api.getNotifications().catch(()=>[])]).then(([enrolled, notifs]) => {
    const active = enrolled.filter(e => e.enrollment.payment_status === 'completed');
    const pending = enrolled.filter(e => e.enrollment.payment_status === 'pending');

    renderDashboardPage(`<div data-testid="student-dashboard" class="min-h-screen bg-[#050505] flex">
      <aside class="w-64 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div class="p-5 border-b border-[#27272A]"><a href="/" data-link class="flex items-center gap-2">
          <i data-lucide="graduation-cap" class="w-7 h-7 text-[#D4AF37]"></i>
          <span class="text-sm font-bold text-white">OEC <span class="text-[#D4AF37]">Tech</span> Institute</span>
        </a></div>
        <nav class="flex-1 p-4 space-y-1">
          <a href="/dashboard" data-link class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-[#D4AF37]/10 text-[#D4AF37]"><i data-lucide="bar-chart-3" class="w-5 h-5"></i>Dashboard</a>
          <a href="/profile" data-link class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-white/5"><i data-lucide="user" class="w-5 h-5"></i>Profile</a>
          <a href="/" data-link class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-white/5"><i data-lucide="home" class="w-5 h-5"></i>Home</a>
          ${u?.role==='admin'?'<a href="/admin" data-link class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10"><i data-lucide="shield" class="w-5 h-5"></i>Admin Panel</a>':''}
        </nav>
        <div class="p-4 border-t border-[#27272A]"><button onclick="Auth.logout()" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full"><i data-lucide="log-out" class="w-5 h-5"></i>Logout</button></div>
      </aside>
      <main class="flex-1 p-6 md:p-10 overflow-auto">
        <div class="mb-8"><h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, ${(u?.name||'Student').split(' ')[0]}</h1><p class="text-sm text-[#A1A1AA]">Continue your learning journey.</p></div>

        <!-- Student Info -->
        <div class="bg-[#111111] border border-[#27272A] rounded-xl p-5 mb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              ${u?.picture ? `<img src="${u.picture}" alt="" class="w-12 h-12 rounded-full border-2 border-[#D4AF37] object-cover">` : `<div class="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-xl font-bold">${(u?.name||'U').charAt(0)}</div>`}
              <div><h2 class="text-base font-bold text-white">${u?.name||'Student'}</h2><p class="text-xs text-[#A1A1AA]">${u?.email||''}</p></div>
            </div>
            <span class="text-xs font-semibold px-3 py-1 rounded-full ${active.length>0?'bg-green-500/10 text-green-400':pending.length>0?'bg-yellow-500/10 text-yellow-400':'bg-[#27272A] text-[#A1A1AA]'}" data-testid="student-status">${active.length>0?'Active Student':pending.length>0?'Pending Approval':'Not Enrolled'}</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          ${[{l:'Active Courses',v:active.length,i:'book-open'},{l:'Pending',v:pending.length,i:'clock'},{l:'Completed',v:active.filter(c=>c.enrollment.progress===100).length,i:'check-circle-2'},{l:'Total',v:enrolled.length,i:'bar-chart-3'}].map(x=>`<div class="bg-[#111111] border border-[#27272A] rounded-xl p-5"><i data-lucide="${x.i}" class="w-5 h-5 text-[#D4AF37] mb-2"></i><p class="text-2xl font-bold text-white">${x.v}</p><p class="text-xs text-[#A1A1AA]">${x.l}</p></div>`).join('')}
        </div>

        <!-- Active Courses -->
        ${active.length > 0 ? `<div class="mb-8"><h2 class="text-xl font-bold text-white mb-6">My Courses</h2><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${active.map(({enrollment:e, course:c}) => `<a href="/my-course/${e.enrollment_id}" data-link data-testid="enrolled-course-${e.enrollment_id}" class="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all group">
            <div class="aspect-[3/2] overflow-hidden bg-[#1A1A1A]"><img src="${c.image_url}" alt="${c.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></div>
            <div class="p-5"><h3 class="text-base font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">${c.title}</h3>
              <div class="mb-3"><div class="flex justify-between text-xs text-[#A1A1AA] mb-1"><span>Progress</span><span>${e.progress}%</span></div><div class="w-full h-2 bg-[#27272A] rounded-full overflow-hidden"><div class="h-full bg-[#D4AF37] rounded-full" style="width:${e.progress}%"></div></div></div>
              <span class="text-xs text-[#D4AF37]">Continue Learning &rarr;</span>
            </div></a>`).join('')}</div></div>` : ''}

        <!-- Pending -->
        ${pending.length > 0 ? `<div class="mb-8"><h2 class="text-xl font-bold text-white mb-6">Pending Payment</h2><div class="space-y-4">
          ${pending.map(({enrollment:e, course:c}) => `<div class="bg-[#111111] border border-yellow-600/30 rounded-xl p-5 flex items-center justify-between"><div class="flex items-center gap-4"><i data-lucide="alert-circle" class="w-5 h-5 text-yellow-500"></i><div><h3 class="text-sm font-bold text-white">${c.title}</h3><p class="text-xs text-[#A1A1AA]">Payment via ${e.payment_method} - awaiting confirmation</p></div></div><span class="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">Pending</span></div>`).join('')}</div></div>` : ''}

        ${enrolled.length === 0 ? `<div class="text-center py-16">
          <div class="inline-flex items-center gap-2 mb-6"><i data-lucide="graduation-cap" class="w-10 h-10 text-[#D4AF37]"></i><span class="text-lg font-bold text-white">OEC <span class="text-[#D4AF37]">Tech</span> Institute</span></div>
          <h3 class="text-lg font-bold text-white mb-2">Complete Your Enrollment</h3>
          <p class="text-sm text-[#A1A1AA] mb-6">Start your learning journey with OEC Tech Institute.</p>
          <a href="/courses" data-link class="btn-gold px-6 py-3 text-sm">Browse Courses</a>
        </div>` : ''}
      </main>
    </div>`);
  }).catch(() => renderDashboardPage('<div class="min-h-screen flex items-center justify-center"><p class="text-[#A1A1AA]">Failed to load dashboard</p></div>'));
}
