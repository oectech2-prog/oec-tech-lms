// Admin Staff Details Page
const STAFF_CATS = ['Principal','Admin','Instructor','Job Holder','Internship with Stipend','Internship without Stipend','Sweeper','Guard'];

function renderAdminStaffPage() {
  let staff = [], filterCat = 'All';

  function render() {
    const filtered = filterCat === 'All' ? staff : staff.filter(s => s.category === filterCat);
    renderDashboardPage(`<div data-testid="admin-staff-page" class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/staff')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/staff')}
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-xl font-bold text-white flex items-center gap-2"><i data-lucide="briefcase" class="w-5 h-5 text-[#D4AF37]"></i>Staff Details (${filtered.length})</h1>
        <button data-testid="add-staff-btn" onclick="document.getElementById('staff-modal').classList.remove('hidden');window._resetStaffForm();initIcons()" class="btn-gold px-4 py-2 text-xs"><i data-lucide="plus" class="w-4 h-4 inline mr-1"></i>Add Staff</button>
      </div>
      <div class="flex flex-wrap gap-2 mb-6">
        ${['All',...STAFF_CATS].map(c => `<button data-scat="${c}" class="px-3 py-1.5 rounded-lg text-[10px] font-medium ${filterCat===c?'bg-[#D4AF37] text-black':'bg-[#111] text-[#A1A1AA] hover:bg-white/5'}">${c} ${c==='All'?`(${staff.length})`:`(${staff.filter(s=>s.category===c).length})`}</button>`).join('')}
      </div>
      ${filtered.length===0?'<div class="text-center py-16"><i data-lucide="briefcase" class="w-12 h-12 text-[#27272A] mx-auto mb-4"></i><p class="text-[#A1A1AA]">No staff members found</p></div>':
      `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${filtered.map(s => `<div data-testid="staff-card-${s.staff_id}" class="bg-[#111] border border-[#27272A] rounded-xl p-5 hover:border-[#D4AF37]/30 transition-colors">
        <div class="flex items-start gap-3 mb-3">
          <div class="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0 overflow-hidden">
            ${s.profile_pic_url ? `<img src="${s.profile_pic_url}" class="w-full h-full object-cover rounded-full" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none" class="text-[#D4AF37] font-bold text-lg items-center justify-center">${(s.name||'S').charAt(0)}</span>` : `<span class="text-[#D4AF37] font-bold text-lg">${(s.name||'S').charAt(0)}</span>`}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold text-white truncate">${s.name}</h3>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] inline-block">${s.category}</span>
          </div>
          <button onclick="if(confirm('Delete ${s.name}?'))Api.deleteStaff('${s.staff_id}').then(()=>{showToast('Deleted');loadStaff()}).catch(()=>showToast('Failed','error'))" class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
        <div class="space-y-1.5 text-[10px]">
          ${s.phone?`<div class="flex items-center gap-2 text-[#A1A1AA]"><i data-lucide="phone" class="w-3 h-3 text-[#D4AF37]"></i>${s.phone}</div>`:''}
          ${s.email?`<div class="flex items-center gap-2 text-[#A1A1AA]"><i data-lucide="mail" class="w-3 h-3 text-[#D4AF37]"></i>${s.email}</div>`:''}
          ${s.cnic?`<div class="flex items-center gap-2 text-[#A1A1AA]"><i data-lucide="credit-card" class="w-3 h-3 text-[#D4AF37]"></i>CNIC: ${s.cnic}</div>`:''}
          ${s.salary?`<div class="flex items-center gap-2 text-[#A1A1AA]"><i data-lucide="dollar-sign" class="w-3 h-3 text-[#D4AF37]"></i>Salary: PKR ${s.salary}</div>`:''}
          ${s.joining_date?`<div class="flex items-center gap-2 text-[#A1A1AA]"><i data-lucide="calendar" class="w-3 h-3 text-[#D4AF37]"></i>Joined: ${s.joining_date}</div>`:''}
        </div>
        <div class="flex gap-2 mt-3 pt-3 border-t border-[#27272A]">
          ${s.id_card_front_url?`<a href="${s.id_card_front_url}" target="_blank" class="text-[9px] px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg">ID Front</a>`:''}
          ${s.id_card_back_url?`<a href="${s.id_card_back_url}" target="_blank" class="text-[9px] px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg">ID Back</a>`:''}
          ${s.letter_url?`<a href="${s.letter_url}" target="_blank" class="text-[9px] px-2 py-1 bg-green-500/10 text-green-400 rounded-lg">Letter</a>`:''}
          <button onclick="window._dlStaffPdf('${s.staff_id}')" class="text-[9px] px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg ml-auto"><i data-lucide="download" class="w-3 h-3 inline"></i> PDF</button>
        </div>
      </div>`).join('')}</div>`}

      <!-- Add/Edit Staff Modal -->
      <div id="staff-modal" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onclick="if(event.target===this)this.classList.add('hidden')">
        <div class="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between mb-5"><h3 class="text-base font-bold text-white">Add Staff Member</h3><button onclick="document.getElementById('staff-modal').classList.add('hidden')"><i data-lucide="x" class="w-5 h-5 text-[#A1A1AA]"></i></button></div>
          <form id="staff-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Full Name *</label><input data-testid="staff-name" name="name" placeholder="Full name" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none" required></div>
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Category *</label><select data-testid="staff-category" name="category" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none" required><option value="">Select</option>${STAFF_CATS.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Father Name</label><input name="father_name" placeholder="Father name" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Phone</label><input name="phone" placeholder="03XXXXXXXXX" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Email</label><input name="email" type="email" placeholder="email@example.com" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">CNIC</label><input name="cnic" placeholder="XXXXX-XXXXXXX-X" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Gender</label><select name="gender" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Date of Birth</label><input name="date_of_birth" type="date" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">City</label><input name="city" placeholder="City" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Qualification</label><input name="qualification" placeholder="Degree" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Salary (PKR)</label><input name="salary" placeholder="Monthly salary" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
            </div>
            <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Address</label><input name="address" placeholder="Full address" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
            <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Joining Date</label><input name="joining_date" type="date" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>

            <div class="border-t border-[#27272A] pt-4"><p class="text-xs font-bold text-[#D4AF37] mb-3">FILE UPLOADS</p>
              <p class="text-[9px] text-[#71717A] mb-3">Supports: Images, PDF, MS Word, MS Excel (max 10MB each)</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Profile Photo</label><input type="file" name="profile_pic" accept="image/*,.pdf" data-testid="staff-profile-pic" class="w-full text-xs text-[#A1A1AA] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:bg-[#D4AF37]/10 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/20"></div>
                <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">ID Card Front</label><input type="file" name="id_card_front" accept="image/*,.pdf" data-testid="staff-id-front" class="w-full text-xs text-[#A1A1AA] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:bg-[#D4AF37]/10 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/20"></div>
                <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">ID Card Back</label><input type="file" name="id_card_back" accept="image/*,.pdf" data-testid="staff-id-back" class="w-full text-xs text-[#A1A1AA] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:bg-[#D4AF37]/10 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/20"></div>
                <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Letter (PDF/Word/Excel)</label><input type="file" name="letter" accept=".pdf,.doc,.docx,.xls,.xlsx,image/*" data-testid="staff-letter" class="w-full text-xs text-[#A1A1AA] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:bg-[#D4AF37]/10 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/20"></div>
              </div>
            </div>
            <button data-testid="save-staff-btn" type="submit" class="btn-gold w-full py-2.5 text-sm">Add Staff Member</button>
          </form>
        </div>
      </div>
    </main></div>`);

    document.querySelectorAll('[data-scat]').forEach(btn => btn.addEventListener('click', () => { filterCat = btn.dataset.scat; render(); }));

    document.getElementById('staff-form')?.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const form = ev.target;
      const fd = new FormData(form);
      const data = {};
      for (const [k, v] of fd.entries()) { if (typeof v === 'string') data[k] = v; }
      if (!data.name || !data.category) { showToast('Name and Category required', 'error'); return; }

      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Uploading...';

      // Upload files
      const fileFields = [['profile_pic','profile_pic_url'],['id_card_front','id_card_front_url'],['id_card_back','id_card_back_url'],['letter','letter_url']];
      for (const [inputName, dataKey] of fileFields) {
        const fileInput = form.querySelector(`input[name="${inputName}"]`);
        if (fileInput?.files?.[0]) {
          try {
            const uf = new FormData(); uf.append('file', fileInput.files[0]);
            const res = await Api._fetch('POST', '/upload', uf, true);
            data[dataKey] = res.url || '';
          } catch { showToast(`Failed to upload ${inputName}`, 'error'); }
        }
      }

      try {
        await Api.addStaff(data);
        showToast('Staff member added!');
        document.getElementById('staff-modal').classList.add('hidden');
        loadStaff();
      } catch (err) { showToast(err.detail || 'Failed', 'error'); }
      btn.disabled = false; btn.textContent = 'Add Staff Member';
    });
  }

  window._resetStaffForm = () => { document.getElementById('staff-form')?.reset(); };

  window._dlStaffPdf = (staffId) => {
    const s = staff.find(x=>x.staff_id===staffId);if(!s)return;
    const docs = [{label:'Profile Photo',url:s.profile_pic_url},{label:'ID Card Front',url:s.id_card_front_url},{label:'ID Card Back',url:s.id_card_back_url},{label:'Letter/Document',url:s.letter_url}];
    const sections = `
      <div class="section"><h3>Staff Information</h3><div class="grid">
        ${pdfField('Full Name',s.name)}${pdfField('Category',s.category)}${pdfField('Staff ID',s.staff_id)}${pdfField('Phone',s.phone)}
        ${pdfField('Email',s.email)}${pdfField('CNIC',s.cnic)}${pdfField('Gender',s.gender)}${pdfField('Date of Birth',s.date_of_birth)}
        ${pdfField('City',s.city)}${pdfField('Address',s.address)}${pdfField('Qualification',s.qualification)}${pdfField('Father Name',s.father_name)}
      </div></div>
      <div class="section"><h3>Employment Details</h3><div class="grid">
        ${pdfField('Salary',s.salary?'PKR '+s.salary:'-')}${pdfField('Joining Date',s.joining_date)}${pdfField('Status',s.status)}
      </div></div>
      ${pdfDocSection(docs)}`;
    generateOecPdf('Staff Admission Form', s.staff_id, s.profile_pic_url, sections);
  };

  function loadStaff() { Api.getStaff().then(d => { staff = d; render(); }).catch(() => render()); }
  loadStaff();
}
