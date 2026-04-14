// Admin Assignments
function renderAdminAssignmentsPage() {
  renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/assignments')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/assignments')}<h1 class="text-xl font-bold text-white mb-6">Assignments</h1>${Components.spinner()}</main></div>`);
  Api.getAdminAssignments().then(subs => {
    document.querySelector('main').innerHTML = Components.adminMobileNav('/admin/assignments') + `<h1 class="text-xl font-bold text-white mb-6">Assignments (${subs.length})</h1>
    ${subs.length===0?'<p class="text-[#A1A1AA]">No submissions</p>':`<div class="space-y-3">${subs.map(s=>`<div class="bg-[#111111] border border-[#27272A] rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <div><p class="text-sm font-bold text-white">${s.user_name||'Unknown'}</p><p class="text-[10px] text-[#A1A1AA]">${s.course_title||''} | Week ${s.week_number||'?'}</p></div>
        <span class="text-xs font-semibold px-3 py-1 rounded-full ${s.status==='approved'?'bg-green-500/10 text-green-400':s.status==='submitted'?'bg-yellow-500/10 text-yellow-400':s.status==='rejected'?'bg-red-500/10 text-red-400':'bg-[#27272A] text-[#A1A1AA]'}">${s.status}</span>
      </div>
      <p class="text-xs text-[#A1A1AA] mb-2">${s.submission_type}: ${s.content?.slice(0,100)||'No content'}</p>
      ${s.file_url?`<a href="/api/files/${s.file_url.replace('/api/files/','')}" target="_blank" class="text-xs text-[#D4AF37] hover:underline">View File</a>`:''}
      ${s.status==='submitted'?`<div class="flex gap-2 mt-3">
        <button onclick="Api.reviewAssignment('${s.submission_id}',{status:'approved',feedback:'Good work!'}).then(()=>{showToast('Approved!');renderAdminAssignmentsPage()}).catch(()=>showToast('Failed','error'))" class="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs">Approve</button>
        <button onclick="Api.reviewAssignment('${s.submission_id}',{status:'rejected',feedback:'Please revise.'}).then(()=>{showToast('Rejected');renderAdminAssignmentsPage()}).catch(()=>showToast('Failed','error'))" class="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs">Reject</button>
      </div>`:''}
    </div>`).join('')}</div>`}`;
    initIcons();
  }).catch(() => { document.querySelector('main').innerHTML = '<p class="text-red-400 p-8">Failed to load</p>'; });
}
