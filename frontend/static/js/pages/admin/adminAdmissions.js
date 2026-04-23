// Admin Admissions - with Student IDs and PDF Download
function renderAdminAdmissionsPage() {
  let forms = [], search = '';
  function render() {
    const filtered = search ? forms.filter(f => (f.full_name||'').toLowerCase().includes(search.toLowerCase()) || (f.student_id||'').toLowerCase().includes(search.toLowerCase())) : forms;
    renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/admissions')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/admissions')}
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-xl font-bold text-white">Admission Forms (${forms.length})</h1>
        <div class="relative"><i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]"></i><input data-testid="admission-search" value="${search}" placeholder="Search name or ID..." class="bg-[#111] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-white w-56 focus:border-[#D4AF37] focus:outline-none" id="adm-search"></div>
      </div>
      ${filtered.length===0?'<div class="text-center py-16"><i data-lucide="file-text" class="w-12 h-12 text-[#27272A] mx-auto mb-4"></i><p class="text-[#A1A1AA]">No admission forms</p></div>':`<div class="space-y-3">${filtered.map(f=>`<div data-testid="admission-${f.student_id}" class="bg-[#111111] border border-[#27272A] rounded-xl p-5">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-start gap-3">
            ${f.profile_pic_url ? `<img src="${f.profile_pic_url}" class="w-12 h-12 rounded-full object-cover border border-[#D4AF37]/30 shrink-0">` : `<div class="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold shrink-0">${(f.full_name||'?').charAt(0)}</div>`}
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-sm font-bold text-white">${f.full_name||'Unknown'}</h3>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37]">${f.student_id||'N/A'}</span>
              </div>
              <p class="text-[10px] text-[#A1A1AA]">${f.course_title||''} | ${f.phone||''} | ${f.city||''}</p>
              <div class="flex flex-wrap gap-3 mt-1.5 text-[10px] text-[#71717A]">
                ${f.gender?`<span>${f.gender}</span>`:''}${f.date_of_birth?`<span>DOB: ${f.date_of_birth}</span>`:''}${f.session_type?`<span>${f.session_type}</span>`:''}${f.learning_type?`<span>${f.learning_type}</span>`:''}
              </div>
              ${f.father_name?`<p class="text-[10px] text-[#71717A] mt-1">Father: ${f.father_name} | ${f.father_phone||''}</p>`:''}
            </div>
          </div>
          <button data-testid="download-pdf-${f.student_id}" onclick="window._downloadAdmPdf('${f.form_id}')" class="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-xs font-semibold hover:bg-[#D4AF37]/20 shrink-0">
            <i data-lucide="download" class="w-4 h-4"></i>Download PDF
          </button>
        </div>
      </div>`).join('')}</div>`}
    </main></div>`);

    document.getElementById('adm-search')?.addEventListener('input', (e) => { search = e.target.value; render(); });
  }

  Api.getAdminAdmissions().then(data => { forms = data; render(); }).catch(() => render());

  // PDF Download - generates client-side printable admission form
  window._downloadAdmPdf = (formId) => {
    const f = forms.find(x => x.form_id === formId);
    if (!f) return;
    const w = window.open('', '_blank', 'width=800,height=1000');
    w.document.write(`<!DOCTYPE html><html><head><title>Admission Form - ${f.student_id}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:30px;color:#222;font-size:12px}
    .header{text-align:center;border-bottom:3px solid #D4AF37;padding-bottom:15px;margin-bottom:20px}
    .header h1{font-size:22px;color:#D4AF37;margin-bottom:4px}.header p{color:#666;font-size:11px}
    .id-badge{display:inline-block;background:#D4AF37;color:#000;font-weight:bold;padding:4px 12px;border-radius:4px;font-size:13px;margin-top:8px}
    .section{margin-bottom:18px}.section h3{font-size:13px;color:#D4AF37;border-bottom:1px solid #eee;padding-bottom:5px;margin-bottom:10px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px}.field{margin-bottom:6px}.field label{font-weight:bold;color:#555;font-size:10px;text-transform:uppercase}.field span{display:block;font-size:12px;color:#222;padding:3px 0;border-bottom:1px dotted #ddd}
    .photo{float:right;width:100px;height:120px;border:2px solid #D4AF37;border-radius:8px;object-fit:cover}
    @media print{body{padding:20px}button{display:none!important}}
    </style></head><body>
    <div class="header">
      <h1>OEC TECH INSTITUTE</h1><p>Student Admission Form</p>
      <div class="id-badge">${f.student_id||'N/A'}</div>
    </div>
    ${f.profile_pic_url?`<img src="${f.profile_pic_url}" class="photo" onerror="this.style.display='none'">`:''}
    <div class="section"><h3>Student Information</h3><div class="grid">
      <div class="field"><label>Full Name</label><span>${f.full_name||'-'}</span></div>
      <div class="field"><label>Student ID</label><span>${f.student_id||'-'}</span></div>
      <div class="field"><label>Phone</label><span>${f.phone||'-'}</span></div>
      <div class="field"><label>Date of Birth</label><span>${f.date_of_birth||'-'}</span></div>
      <div class="field"><label>Gender</label><span>${f.gender||'-'}</span></div>
      <div class="field"><label>City</label><span>${f.city||'-'}</span></div>
      <div class="field"><label>Address</label><span>${f.address||'-'}</span></div>
      <div class="field"><label>Session</label><span>${f.session_type||'-'}</span></div>
      <div class="field"><label>Learning Type</label><span>${f.learning_type||'-'}</span></div>
      <div class="field"><label>Qualification</label><span>${f.qualification||'-'}</span></div>
      <div class="field"><label>Religion</label><span>${f.religion||'-'}</span></div>
      <div class="field"><label>Joining Date</label><span>${f.joining_date?new Date(f.joining_date).toLocaleDateString():'-'}</span></div>
    </div></div>
    <div class="section"><h3>Parent / Guardian</h3><div class="grid">
      <div class="field"><label>Father Name</label><span>${f.father_name||'-'}</span></div>
      <div class="field"><label>Father Phone</label><span>${f.father_phone||'-'}</span></div>
      <div class="field"><label>Father CNIC</label><span>${f.father_cnic||'-'}</span></div>
    </div></div>
    <div class="section"><h3>Course Details</h3><div class="grid">
      <div class="field"><label>Course</label><span>${f.course_title||'-'}</span></div>
      <div class="field"><label>Course ID</label><span>${f.course_id||'-'}</span></div>
    </div></div>
    <div style="margin-top:40px;text-align:center;color:#999;font-size:10px;border-top:1px solid #eee;padding-top:10px">OEC Tech Institute | info@oectechs.com | 0300-0517616</div>
    <div style="text-align:center;margin-top:15px"><button onclick="window.print()" style="background:#D4AF37;color:#000;border:none;padding:10px 30px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px">Print / Save as PDF</button></div>
    </body></html>`);
    w.document.close();
  };
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
      <div class="flex-1"><p class="text-sm font-bold text-white">${u?.name||'Unknown'}</p><p class="text-[10px] text-[#A1A1AA]">${u?.email||''}</p><p class="text-[10px] text-[#D4AF37]">${t?.title||''} - ${e.payment_method||''}</p></div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3 py-1 rounded-full ${e.payment_status==='completed'?'bg-green-500/10 text-green-400':e.payment_status==='pending'?'bg-yellow-500/10 text-yellow-400':'bg-red-500/10 text-red-400'}">${e.payment_status}</span>
        ${e.payment_status==='pending'?`<button onclick="Api.updateDiplomaStatus('${e.enrollment_id}',{payment_status:'completed'}).then(()=>{showToast('Approved!');renderAdminDiplomaStudentsPage()}).catch(()=>showToast('Failed','error'))" class="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs">Approve</button>`:''}
        <button onclick="if(confirm('Delete?'))Api.deleteDiplomaEnrollment('${e.enrollment_id}').then(()=>{showToast('Deleted');renderAdminDiplomaStudentsPage()}).catch(()=>showToast('Failed','error'))" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
      </div>
    </div>`).join('')}</div>`}
    <div id="add-dip-modal" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onclick="if(event.target===this)this.classList.add('hidden')">
      <div class="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-md p-6" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between mb-4"><h3 class="text-base font-bold text-white">Add Diploma Student</h3><button onclick="document.getElementById('add-dip-modal').classList.add('hidden')"><i data-lucide="x" class="w-5 h-5 text-[#A1A1AA]"></i></button></div>
        <form id="add-dip-form" class="space-y-3">
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Student Email *</label><input name="email" type="email" placeholder="student@email.com" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"><p class="text-[9px] text-[#71717A] mt-1">Student must have a Google login account</p></div>
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Diploma Track *</label><select name="track_id" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"><option value="">Select</option>${tracks.map(t=>`<option value="${t.track_id}">${t.title}</option>`).join('')}</select></div>
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Payment Method</label><select name="payment_method" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"><option value="jazzcash">JazzCash</option><option value="easypaisa">EasyPaisa</option><option value="bank_transfer">Bank Transfer</option></select></div>
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Status</label><select name="status" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"><option value="completed">Approved</option><option value="pending">Pending</option></select></div>
          <button type="submit" class="btn-gold w-full py-2.5 text-sm">Add Student</button>
        </form>
      </div>
    </div>`;
    initIcons();
    document.getElementById('add-dip-form')?.addEventListener('submit', async (ev) => {
      ev.preventDefault(); const fd = new FormData(ev.target); const email = fd.get('email')?.trim(); const track_id = fd.get('track_id');
      if (!email || !track_id) { showToast('Email and Track required', 'error'); return; }
      try { await Api.post('/admin/diploma-enrollments/manual', { email, track_id, payment_method: fd.get('payment_method'), payment_status: fd.get('status') }); showToast('Added!'); document.getElementById('add-dip-modal').classList.add('hidden'); renderAdminDiplomaStudentsPage(); }
      catch (err) { showToast(err.detail || 'Failed', 'error'); }
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
