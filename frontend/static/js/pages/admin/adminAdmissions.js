// Admin Admissions - Student IDs, PDF Download (branded), Manual Add Student
function renderAdminAdmissionsPage() {
  let forms = [], search = '', courses = [];
  const I = "w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none";
  const L = "text-[10px] font-medium text-[#A1A1AA] mb-1 block";

  function render() {
    const filtered = search ? forms.filter(f => (f.full_name||'').toLowerCase().includes(search.toLowerCase()) || (f.student_id||'').toLowerCase().includes(search.toLowerCase())) : forms;
    renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/admissions')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/admissions')}
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-xl font-bold text-white">Admission Forms (${forms.length})</h1>
        <div class="flex gap-2">
          <div class="relative"><i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]"></i><input value="${search}" placeholder="Search name or ID..." class="bg-[#111] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-white w-48 focus:border-[#D4AF37] focus:outline-none" id="adm-search"></div>
          <button data-testid="add-student-btn" onclick="document.getElementById('add-student-modal').classList.remove('hidden');initIcons()" class="btn-gold px-4 py-2 text-xs"><i data-lucide="plus" class="w-4 h-4 inline mr-1"></i>Add Student</button>
        </div>
      </div>
      ${filtered.length===0?'<div class="text-center py-16"><i data-lucide="file-text" class="w-12 h-12 text-[#27272A] mx-auto mb-4"></i><p class="text-[#A1A1AA]">No admission forms</p></div>':`<div class="space-y-3">${filtered.map(f=>`<div class="bg-[#111] border border-[#27272A] rounded-xl p-5">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-start gap-3">
            ${f.profile_pic_url?`<img src="${f.profile_pic_url}" class="w-12 h-12 rounded-full object-cover border border-[#D4AF37]/30 shrink-0">`:`<div class="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold shrink-0">${(f.full_name||'?').charAt(0)}</div>`}
            <div>
              <div class="flex items-center gap-2 mb-1"><h3 class="text-sm font-bold text-white">${f.full_name||'Unknown'}</h3><span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37]">${f.student_id||'N/A'}</span></div>
              <p class="text-[10px] text-[#A1A1AA]">${f.course_title||''} | ${f.phone||''} | ${f.city||''}</p>
              <div class="flex flex-wrap gap-3 mt-1 text-[10px] text-[#71717A]">${f.gender?`<span>${f.gender}</span>`:''}${f.date_of_birth?`<span>DOB: ${f.date_of_birth}</span>`:''}${f.session_type?`<span>${f.session_type}</span>`:''}${f.learning_type?`<span>${f.learning_type}</span>`:''}</div>
              ${f.father_name?`<p class="text-[10px] text-[#71717A] mt-1">Father: ${f.father_name} | ${f.father_phone||''}</p>`:''}
            </div>
          </div>
          <button onclick="window._dlStudentPdf('${f.form_id}')" class="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-xs font-semibold hover:bg-[#D4AF37]/20 shrink-0"><i data-lucide="download" class="w-4 h-4"></i>Download PDF</button>
        </div>
      </div>`).join('')}</div>`}

      <!-- Manual Add Student Modal -->
      <div id="add-student-modal" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onclick="if(event.target===this)this.classList.add('hidden')">
        <div class="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between mb-4"><h3 class="text-base font-bold text-white">Add Student (Manual)</h3><button onclick="document.getElementById('add-student-modal').classList.add('hidden')"><i data-lucide="x" class="w-5 h-5 text-[#A1A1AA]"></i></button></div>
          <form id="manual-student-form" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div><label class="${L}">Full Name *</label><input name="full_name" class="${I}" required></div>
              <div><label class="${L}">Phone *</label><input name="phone" class="${I}" placeholder="03XXXXXXXXX" required></div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div><label class="${L}">Date of Birth *</label><input name="date_of_birth" type="date" class="${I}" required></div>
              <div><label class="${L}">Gender *</label><select name="gender" class="${I}" required><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
              <div><label class="${L}">City *</label><input name="city" class="${I}" required></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="${L}">Session *</label><select name="session_type" class="${I}" required><option value="">Select</option><option>Morning</option><option>Evening</option></select></div>
              <div><label class="${L}">Learning Type *</label><select name="learning_type" class="${I}" required><option value="">Select</option><option>Online</option><option>Physical</option></select></div>
            </div>
            <div><label class="${L}">Address</label><input name="address" class="${I}" placeholder="Full address"></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="${L}">Qualification</label><input name="qualification" class="${I}"></div>
              <div><label class="${L}">Course *</label><select name="course_id" class="${I}" required><option value="">Select Course</option>${courses.map(c=>`<option value="${c.course_id}">${c.title}</option>`).join('')}</select></div>
            </div>
            <div class="border-t border-[#27272A] pt-3"><p class="text-xs font-bold text-[#D4AF37] mb-2">PARENT / GUARDIAN</p>
              <div class="grid grid-cols-3 gap-3">
                <div><label class="${L}">Father Name *</label><input name="father_name" class="${I}" required></div>
                <div><label class="${L}">Father Phone *</label><input name="father_phone" class="${I}" required></div>
                <div><label class="${L}">Father CNIC</label><input name="father_cnic" class="${I}" placeholder="XXXXX-XXXXXXX-X"></div>
              </div>
            </div>
            <button type="submit" class="btn-gold w-full py-2.5 text-sm">Add Student</button>
          </form>
        </div>
      </div>
    </main></div>`);

    document.getElementById('adm-search')?.addEventListener('input',(e)=>{search=e.target.value;render()});
    document.getElementById('manual-student-form')?.addEventListener('submit',async(ev)=>{
      ev.preventDefault();const fd=new FormData(ev.target);const d=Object.fromEntries(fd);
      if(!d.full_name||!d.phone||!d.course_id){showToast('Fill required fields','error');return;}
      try{await Api.post('/admin/admission-forms/manual',d);showToast('Student added!');document.getElementById('add-student-modal').classList.add('hidden');loadData();}
      catch(err){showToast(err.detail||'Failed','error');}
    });
  }

  window._dlStudentPdf = (formId) => {
    const f = forms.find(x=>x.form_id===formId);if(!f)return;
    const sections = `
      <div class="section"><h3>Student Information</h3><div class="grid">
        ${pdfField('Full Name',f.full_name)}${pdfField('Student ID',f.student_id)}${pdfField('Phone',f.phone)}${pdfField('Date of Birth',f.date_of_birth)}
        ${pdfField('Gender',f.gender)}${pdfField('City',f.city)}${pdfField('Address',f.address)}${pdfField('Session',f.session_type)}
        ${pdfField('Learning Type',f.learning_type)}${pdfField('Qualification',f.qualification)}${pdfField('Religion',f.religion)}
      </div></div>
      <div class="section"><h3>Parent / Guardian</h3><div class="grid">
        ${pdfField('Father Name',f.father_name)}${pdfField('Father Phone',f.father_phone)}${pdfField('Father CNIC',f.father_cnic)}
      </div></div>
      <div class="section"><h3>Course Details</h3><div class="grid">
        ${pdfField('Course',f.course_title)}${pdfField('Course ID',f.course_id)}${pdfField('Enrollment Date',f.joining_date?new Date(f.joining_date).toLocaleDateString():'-')}
      </div></div>`;
    generateOecPdf('Student Admission Form', f.student_id, f.profile_pic_url, sections);
  };

  function loadData(){Promise.all([Api.getAdminAdmissions(),Api.getCourses()]).then(([f,c])=>{forms=f;courses=c;render()}).catch(()=>render());}
  loadData();
}

// Admin Diploma Students - with Add/Delete + PDF Download
function renderAdminDiplomaStudentsPage() {
  let diplomaData=[],tracks=[];

  function renderDiploma() {
    renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/diploma-students')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/diploma-students')}
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-white">Diploma Enrollments (${diplomaData.length})</h1>
      <button onclick="document.getElementById('add-dip-modal').classList.remove('hidden');initIcons()" class="btn-gold px-4 py-2 text-xs"><i data-lucide="plus" class="w-4 h-4 inline mr-1"></i>Add Student</button>
    </div>
    ${diplomaData.length===0?'<div class="text-center py-16"><i data-lucide="award" class="w-12 h-12 text-[#27272A] mx-auto mb-4"></i><p class="text-[#A1A1AA]">No diploma enrollments</p></div>':
    `<div class="space-y-3">${diplomaData.map(({enrollment:e,user:u,track:t})=>`<div class="bg-[#111] border border-[#27272A] rounded-xl p-4 flex items-center justify-between">
      <div class="flex-1"><p class="text-sm font-bold text-white">${u?.name||'Unknown'}</p><p class="text-[10px] text-[#A1A1AA]">${u?.email||''}</p><p class="text-[10px] text-[#D4AF37]">${t?.title||''}</p></div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3 py-1 rounded-full ${e.payment_status==='completed'?'bg-green-500/10 text-green-400':'bg-yellow-500/10 text-yellow-400'}">${e.payment_status}</span>
        <button onclick="window._dlDipPdf('${e.enrollment_id}')" class="px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-[10px]"><i data-lucide="download" class="w-3 h-3 inline"></i></button>
        ${e.payment_status==='pending'?`<button onclick="Api.updateDiplomaStatus('${e.enrollment_id}',{payment_status:'completed'}).then(()=>{showToast('Approved!');loadDip()}).catch(()=>showToast('Failed','error'))" class="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-[10px]">Approve</button>`:''}
        <button onclick="if(confirm('Delete?'))Api.deleteDiplomaEnrollment('${e.enrollment_id}').then(()=>{showToast('Deleted');loadDip()}).catch(()=>showToast('Failed','error'))" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
      </div>
    </div>`).join('')}</div>`}
    <div id="add-dip-modal" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onclick="if(event.target===this)this.classList.add('hidden')">
      <div class="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-md p-6" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between mb-4"><h3 class="text-base font-bold text-white">Add Diploma Student</h3><button onclick="document.getElementById('add-dip-modal').classList.add('hidden')"><i data-lucide="x" class="w-5 h-5 text-[#A1A1AA]"></i></button></div>
        <form id="add-dip-form" class="space-y-3">
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Student Email *</label><input name="email" type="email" placeholder="student@email.com" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Diploma Track *</label><select name="track_id" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"><option value="">Select</option>${tracks.map(t=>`<option value="${t.track_id}">${t.title}</option>`).join('')}</select></div>
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Payment Method</label><select name="payment_method" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"><option value="jazzcash">JazzCash</option><option value="easypaisa">EasyPaisa</option><option value="bank_transfer">Bank Transfer</option></select></div>
          <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Status</label><select name="status" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"><option value="completed">Approved</option><option value="pending">Pending</option></select></div>
          <button type="submit" class="btn-gold w-full py-2.5 text-sm">Add Student</button>
        </form>
      </div>
    </div>
    </main></div>`);
    initIcons();
    document.getElementById('add-dip-form')?.addEventListener('submit',async(ev)=>{
      ev.preventDefault();const fd=new FormData(ev.target);const email=fd.get('email')?.trim();const track_id=fd.get('track_id');
      if(!email||!track_id){showToast('Email and Track required','error');return;}
      try{await Api.post('/admin/diploma-enrollments/manual',{email,track_id,payment_method:fd.get('payment_method'),payment_status:fd.get('status')});showToast('Added!');document.getElementById('add-dip-modal').classList.add('hidden');loadDip();}
      catch(err){showToast(err.detail||'Failed','error');}
    });
  }

  window._dlDipPdf = (enrollmentId) => {
    const item = diplomaData.find(d=>d.enrollment.enrollment_id===enrollmentId);if(!item)return;
    const {enrollment:e,user:u,track:t} = item;
    const sections = `
      <div class="section"><h3>Student Information</h3><div class="grid">
        ${pdfField('Name',u?.name)}${pdfField('Email',u?.email)}${pdfField('Enrollment ID',e.enrollment_id)}
      </div></div>
      <div class="section"><h3>Diploma Track</h3><div class="grid">
        ${pdfField('Track',t?.title)}${pdfField('Payment Method',e.payment_method)}${pdfField('Status',e.payment_status)}${pdfField('Enrolled',e.enrolled_at?new Date(e.enrolled_at).toLocaleDateString():'-')}
      </div></div>`;
    generateOecPdf('Diploma Enrollment Form', e.enrollment_id, u?.picture, sections);
  };

  function loadDip(){Promise.all([Api.getAdminDiplomaEnrollments(),Api.getDiplomaTracks()]).then(([d,t])=>{diplomaData=d;tracks=t;renderDiploma()}).catch(()=>renderDiploma());}
  loadDip();
}

// Admin Defaulters
function renderAdminDefaultersPage() {
  renderDashboardPage(`<div class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/defaulters')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/defaulters')}<h1 class="text-xl font-bold text-white mb-6">Defaulters</h1>${Components.spinner()}</main></div>`);
  Api.getDefaulters().then(data=>{
    document.querySelector('main').innerHTML=Components.adminMobileNav('/admin/defaulters')+`<h1 class="text-xl font-bold text-white mb-6">Defaulters (${data.length})</h1>
    ${data.length===0?'<div class="text-center py-16"><i data-lucide="check-circle-2" class="w-12 h-12 text-green-400 mx-auto mb-4"></i><p class="text-[#A1A1AA]">No defaulters</p></div>':`<div class="space-y-3">${data.map(d=>`<div class="bg-[#111] border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
      <div><p class="text-sm font-bold text-white">${d.user?.name||'Unknown'}</p><p class="text-[10px] text-[#A1A1AA]">${d.type==='course'?d.course?.title:d.track?.title} | Due: PKR ${(d.amount||0).toLocaleString()}</p></div>
      <button onclick="Api.deactivateStudent('${d.enrollment.enrollment_id}').then(()=>{showToast('Deactivated');renderAdminDefaultersPage()}).catch(()=>showToast('Failed','error'))" class="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs">Deactivate</button>
    </div>`).join('')}</div>`}`;
    initIcons();
  }).catch(()=>{document.querySelector('main').innerHTML='<p class="text-red-400 p-8">Failed</p>';});
}
