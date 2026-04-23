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

// Admin Diploma Students - with Add/Delete
function renderAdminDiplomaStudentsPage() {
  renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/diploma-students')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/diploma-students')}<h1 class="text-xl font-bold text-white mb-6">Diploma Enrollments</h1>${Components.spinner()}</main></div>`);

  let diplomaData = [], tracks = [];
  Promise.all([Api.getAdminDiplomaEnrollments(), Api.getDiplomaTracks()]).then(([data, t]) => {
    diplomaData = data; tracks = t;
    renderDiploma();
  }).catch(() => { document.querySelector('main').innerHTML = '<p class="text-red-400 p-8">Failed to load</p>'; });

  function renderDiploma() {
    document.querySelector('main').innerHTML = Components.adminMobileNav('/admin/diploma-students') + `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-white">Diploma Enrollments (${diplomaData.length})</h1>
      <button data-testid="add-diploma-student-btn" onclick="document.getElementById('add-dip-modal').classList.remove('hidden');initIcons()" class="btn-gold px-4 py-2 text-xs"><i data-lucide="plus" class="w-4 h-4 inline mr-1"></i>Add Student</button>
    </div>
    ${diplomaData.length===0?'<div class="text-center py-16"><i data-lucide="award" class="w-12 h-12 text-[#27272A] mx-auto mb-4"></i><p class="text-[#A1A1AA]">No diploma enrollments</p></div>':
    `<div class="space-y-3">${diplomaData.map(({enrollment:e,user:u,track:t})=>`<div class="bg-[#111111] border border-[#27272A] rounded-xl p-4 flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-bold text-white">${u?.name||'Unknown'}</p>
        <p class="text-[10px] text-[#A1A1AA]">${u?.email||''}</p>
        <p class="text-[10px] text-[#D4AF37]">${t?.title||''} - ${e.payment_method||''}</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3 py-1 rounded-full ${e.payment_status==='completed'?'bg-green-500/10 text-green-400':e.payment_status==='pending'?'bg-yellow-500/10 text-yellow-400':'bg-red-500/10 text-red-400'}">${e.payment_status}</span>
        ${e.payment_status==='pending'?`<button onclick="Api.updateDiplomaStatus('${e.enrollment_id}',{payment_status:'completed'}).then(()=>{showToast('Approved!');renderAdminDiplomaStudentsPage()}).catch(()=>showToast('Failed','error'))" class="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs">Approve</button>`:''}
        <button data-testid="delete-diploma-${e.enrollment_id}" onclick="if(confirm('Delete this diploma enrollment?'))Api.deleteDiplomaEnrollment('${e.enrollment_id}').then(()=>{showToast('Deleted');renderAdminDiplomaStudentsPage()}).catch(()=>showToast('Failed','error'))" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
      </div>
    </div>`).join('')}</div>`}

    <!-- Add Diploma Student Modal -->
    <div id="add-dip-modal" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onclick="if(event.target===this)this.classList.add('hidden')">
      <div class="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-md p-6" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between mb-4"><h3 class="text-base font-bold text-white">Add Diploma Student</h3><button onclick="document.getElementById('add-dip-modal').classList.add('hidden')"><i data-lucide="x" class="w-5 h-5 text-[#A1A1AA]"></i></button></div>
        <form id="add-dip-form" class="space-y-3">
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Student Email *</label>
            <input data-testid="dip-email" name="email" type="email" placeholder="student@email.com" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
            <p class="text-[9px] text-[#71717A] mt-1">Student must already have an account (Google login)</p></div>
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Diploma Track *</label>
            <select data-testid="dip-track" name="track_id" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
              <option value="">Select Track</option>
              ${tracks.map(t=>`<option value="${t.track_id}">${t.title}</option>`).join('')}
            </select></div>
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Payment Method</label>
            <select name="payment_method" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
              <option value="jazzcash">JazzCash</option><option value="easypaisa">EasyPaisa</option><option value="bank_transfer">Bank Transfer</option>
            </select></div>
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Status</label>
            <select name="status" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
              <option value="completed">Approved</option><option value="pending">Pending</option>
            </select></div>
          <button data-testid="save-diploma-btn" type="submit" class="btn-gold w-full py-2.5 text-sm">Add Student</button>
        </form>
      </div>
    </div>`;
    initIcons();

    document.getElementById('add-dip-form')?.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const fd = new FormData(ev.target);
      const email = fd.get('email')?.trim();
      const track_id = fd.get('track_id');
      const payment_method = fd.get('payment_method');
      const status = fd.get('status');
      if (!email || !track_id) { showToast('Email and Track required', 'error'); return; }
      try {
        await Api.post('/admin/diploma-enrollments/manual', { email, track_id, payment_method, payment_status: status });
        showToast('Diploma student added!');
        document.getElementById('add-dip-modal').classList.add('hidden');
        renderAdminDiplomaStudentsPage();
      } catch (err) { showToast(err.detail || 'Failed to add', 'error'); }
    });
  }
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
