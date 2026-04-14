// Admin Admissions
function renderAdminAdmissionsPage() {
  renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/admissions')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/admissions')}<h1 class="text-xl font-bold text-white mb-6">Admissions</h1>${Components.spinner()}</main></div>`);
  Api.getAdminAdmissions().then(forms => {
    document.querySelector('main').innerHTML = Components.adminMobileNav('/admin/admissions') + `<h1 class="text-xl font-bold text-white mb-6">Admission Forms (${forms.length})</h1>
    ${forms.length===0?'<p class="text-[#A1A1AA]">No admission forms</p>':`<div class="space-y-3">${forms.map(f=>`<div class="bg-[#111111] border border-[#27272A] rounded-xl p-4">
      <div class="flex items-center justify-between"><div><p class="text-sm font-bold text-white">${f.full_name||'Unknown'}</p><p class="text-[10px] text-[#A1A1AA]">${f.course_title||''} | ${f.phone||''} | ${f.city||''}</p><p class="text-[10px] text-[#71717A]">Student ID: ${f.student_id||''}</p></div></div>
    </div>`).join('')}</div>`}`;
    initIcons();
  }).catch(() => { document.querySelector('main').innerHTML = '<p class="text-red-400 p-8">Failed to load</p>'; });
}

// Admin Diploma Students
function renderAdminDiplomaStudentsPage() {
  renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/diploma-students')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/diploma-students')}<h1 class="text-xl font-bold text-white mb-6">Diploma Enrollments</h1>${Components.spinner()}</main></div>`);
  Api.getAdminDiplomaEnrollments().then(data => {
    document.querySelector('main').innerHTML = Components.adminMobileNav('/admin/diploma-students') + `<h1 class="text-xl font-bold text-white mb-6">Diploma Enrollments (${data.length})</h1>
    <div class="space-y-3">${data.map(({enrollment:e,user:u,track:t})=>`<div class="bg-[#111111] border border-[#27272A] rounded-xl p-4 flex items-center justify-between">
      <div><p class="text-sm font-bold text-white">${u?.name||'Unknown'}</p><p class="text-[10px] text-[#A1A1AA]">${t?.title||''} - ${e.payment_method||''}</p></div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3 py-1 rounded-full ${e.payment_status==='completed'?'bg-green-500/10 text-green-400':'bg-yellow-500/10 text-yellow-400'}">${e.payment_status}</span>
        ${e.payment_status==='pending'?`<button onclick="Api.updateDiplomaStatus('${e.enrollment_id}',{payment_status:'completed'}).then(()=>{showToast('Approved!');renderAdminDiplomaStudentsPage()}).catch(()=>showToast('Failed','error'))" class="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs">Approve</button>`:''}
      </div>
    </div>`).join('')}</div>`;
    initIcons();
  }).catch(() => { document.querySelector('main').innerHTML = '<p class="text-red-400 p-8">Failed to load</p>'; });
}

// Admin Defaulters
function renderAdminDefaultersPage() {
  renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/defaulters')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/defaulters')}<h1 class="text-xl font-bold text-white mb-6">Defaulters</h1>${Components.spinner()}</main></div>`);
  Api.getDefaulters().then(data => {
    document.querySelector('main').innerHTML = Components.adminMobileNav('/admin/defaulters') + `<h1 class="text-xl font-bold text-white mb-6">Defaulters (${data.length})</h1>
    ${data.length===0?'<div class="text-center py-16"><i data-lucide="check-circle-2" class="w-12 h-12 text-green-400 mx-auto mb-4"></i><p class="text-[#A1A1AA]">No defaulters</p></div>':`<div class="space-y-3">${data.map(d=>`<div class="bg-[#111111] border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
      <div><p class="text-sm font-bold text-white">${d.user?.name||'Unknown'}</p><p class="text-[10px] text-[#A1A1AA]">${d.type==='course'?d.course?.title:d.track?.title} | Due: PKR ${(d.amount||0).toLocaleString()}</p><p class="text-[10px] text-red-400">Due since: ${d.due_date ? new Date(d.due_date).toLocaleDateString() : 'N/A'}</p></div>
      <button onclick="Api.deactivateStudent('${d.enrollment.enrollment_id}').then(()=>{showToast('Deactivated');renderAdminDefaultersPage()}).catch(()=>showToast('Failed','error'))" class="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs">Deactivate</button>
    </div>`).join('')}</div>`}`;
    initIcons();
  }).catch(() => { document.querySelector('main').innerHTML = '<p class="text-red-400 p-8">Failed to load</p>'; });
}
