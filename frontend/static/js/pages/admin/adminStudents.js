// Admin Students
function renderAdminStudentsPage() {
  renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/students')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/students')}<h1 class="text-xl font-bold text-white mb-6">Students</h1>${Components.spinner()}</main></div>`);
  Api.getAdminStudents().then(students => {
    document.querySelector('main').innerHTML = Components.adminMobileNav('/admin/students') + `<h1 class="text-xl font-bold text-white mb-6">Students (${students.length})</h1>
    ${students.length===0?'<p class="text-[#A1A1AA]">No students yet</p>':`<div class="space-y-3">${students.map(s=>`<div class="bg-[#111111] border border-[#27272A] rounded-xl p-4 flex items-center justify-between">
      <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-sm">${s.picture?`<img src="${s.picture}" class="w-full h-full rounded-full object-cover">`:(s.name||'U').charAt(0)}</div>
      <div><p class="text-sm font-bold text-white">${s.name||'Unknown'}</p><p class="text-[10px] text-[#A1A1AA]">${s.email||''}</p><p class="text-[10px] text-[#71717A]">${s.approved_courses||0} courses | ${s.completed_lessons||0}/${s.total_lessons||0} lessons</p></div></div>
      <button onclick="if(confirm('Remove this student?'))Api.removeStudent('${s.user_id}').then(()=>{showToast('Removed');renderAdminStudentsPage()}).catch(()=>showToast('Failed','error'))" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    </div>`).join('')}</div>`}`;
    initIcons();
  }).catch(() => { document.querySelector('main').innerHTML = '<p class="text-red-400 p-8">Failed to load students</p>'; });
}

// Admin Enrollments (Payments)
function renderAdminEnrollmentsPage() {
  renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/enrollments')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/enrollments')}<h1 class="text-xl font-bold text-white mb-6">Payments</h1>${Components.spinner()}</main></div>`);
  Api.getAdminEnrollments().then(data => {
    document.querySelector('main').innerHTML = Components.adminMobileNav('/admin/enrollments') + `<h1 class="text-xl font-bold text-white mb-6">Payments (${data.length})</h1>
    <div class="space-y-3">${data.map(({enrollment:e,user:u,course:c})=>`<div class="bg-[#111111] border border-[#27272A] rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <div><p class="text-sm font-bold text-white">${u?.name||'Unknown'}</p><p class="text-[10px] text-[#A1A1AA]">${c?.title||''} - ${e.payment_method}</p></div>
        <span class="text-xs font-semibold px-3 py-1 rounded-full ${e.payment_status==='completed'?'bg-green-500/10 text-green-400':e.payment_status==='pending'?'bg-yellow-500/10 text-yellow-400':'bg-red-500/10 text-red-400'}">${e.payment_status}</span>
      </div>
      <div class="flex items-center gap-3 text-[10px] text-[#A1A1AA]">
        <span>Adm: PKR ${(e.admission_fee||0).toLocaleString()}</span><span>1st: PKR ${(e.installment_1_amount||0).toLocaleString()}</span><span>2nd: PKR ${(e.installment_2_amount||0).toLocaleString()} (${e.installment_2_status||'pending'})</span>
      </div>
      ${e.payment_status==='pending'?`<div class="flex gap-2 mt-3">
        <button onclick="Api.updateEnrollmentStatus('${e.enrollment_id}',{payment_status:'completed'}).then(()=>{showToast('Approved!');renderAdminEnrollmentsPage()}).catch(()=>showToast('Failed','error'))" class="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs hover:bg-green-500/20">Approve</button>
        <button onclick="Api.updateEnrollmentStatus('${e.enrollment_id}',{payment_status:'rejected'}).then(()=>{showToast('Rejected');renderAdminEnrollmentsPage()}).catch(()=>showToast('Failed','error'))" class="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20">Reject</button>
      </div>`:''}
    </div>`).join('')}</div>`;
    initIcons();
  }).catch(() => { document.querySelector('main').innerHTML = '<p class="text-red-400 p-8">Failed to load</p>'; });
}
