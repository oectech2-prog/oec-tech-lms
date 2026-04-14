// Admin Dashboard
function renderAdminDashboardPage() {
  renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin')}
    <h1 class="text-xl font-bold text-white mb-6">Dashboard</h1>${Components.spinner()}</main></div>`);

  Api.getAdminStats().then(s => {
    document.querySelector('main').innerHTML = Components.adminMobileNav('/admin') + `
    <h1 class="text-xl font-bold text-white mb-6">Dashboard</h1>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      ${[{i:'book-open',v:s.total_courses,l:'Courses',c:'text-[#D4AF37]'},{i:'users',v:s.total_students,l:'Students',c:'text-blue-400'},{i:'credit-card',v:s.total_enrollments,l:'Enrollments',c:'text-green-400'},{i:'clock',v:s.total_pending_approval||s.pending_payments,l:'Pending',c:'text-yellow-400'},{i:'alert-triangle',v:s.defaulters_count,l:'Defaulters',c:'text-red-400'}].map(x=>`<div class="bg-[#111111] border border-[#27272A] rounded-xl p-5"><i data-lucide="${x.i}" class="w-5 h-5 ${x.c} mb-2"></i><p class="text-2xl font-bold text-white">${x.v}</p><p class="text-xs text-[#A1A1AA]">${x.l}</p></div>`).join('')}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-[#111111] border border-[#27272A] rounded-xl p-5"><i data-lucide="dollar-sign" class="w-5 h-5 text-[#D4AF37] mb-2"></i><p class="text-xl font-bold text-green-400">PKR ${(s.admission_plus_inst1||0).toLocaleString()}</p><p class="text-[10px] text-[#A1A1AA]">Admission + 1st Installment</p></div>
      <div class="bg-[#111111] border border-[#27272A] rounded-xl p-5"><i data-lucide="dollar-sign" class="w-5 h-5 text-green-400 mb-2"></i><p class="text-xl font-bold text-green-400">PKR ${(s.inst2_total||0).toLocaleString()}</p><p class="text-[10px] text-[#A1A1AA]">2nd Installment Total</p></div>
      <div class="bg-[#111111] border border-[#27272A] rounded-xl p-5"><i data-lucide="trending-up" class="w-5 h-5 text-blue-400 mb-2"></i><p class="text-xl font-bold text-blue-400">PKR ${(s.monthly_revenue||0).toLocaleString()}</p><p class="text-[10px] text-[#A1A1AA]">Monthly Revenue (${s.month_name||''})</p></div>
    </div>
    <h2 class="text-base font-bold text-white mb-4">Quick Actions</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      ${[{to:'/admin/courses',i:'book-open',t:'Manage Courses',d:'Add, edit or remove'},{to:'/admin/diploma-students',i:'award',t:'Manage Diploma Tracks',d:'Diploma enrollments'},{to:'/admin/students',i:'users',t:'Manage Students',d:'View & manage'},{to:'/admin/enrollments',i:'credit-card',t:'Manage Payments',d:'Approve or reject'}].map(x=>`<a href="${x.to}" data-link class="bg-[#111111] border border-[#27272A] rounded-xl p-5 hover:border-[#D4AF37]/30 transition-colors"><i data-lucide="${x.i}" class="w-6 h-6 text-[#D4AF37] mb-3"></i><h3 class="text-sm font-bold text-white">${x.t}</h3><p class="text-[10px] text-[#A1A1AA]">${x.d}</p></a>`).join('')}
    </div>`;
    initIcons();
  }).catch(() => { document.querySelector('main').innerHTML = '<p class="text-red-400 p-8">Failed to load stats</p>'; });
}
