// Admin Video Testimonials
function renderAdminVideoTestimonialsPage() {
  let vids = [], search = '', filter = 'all';
  function render() {
    const filtered = vids.filter(v => { if (filter !== 'all' && v.status !== filter) return false; if (search) { const q = search.toLowerCase(); return v.student_name?.toLowerCase().includes(q) || v.course_title?.toLowerCase().includes(q); } return true; });
    renderDashboardPage(`<div data-testid="admin-video-testimonials" class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/video-testimonials')}<main class="flex-1 p-6 md:p-8 overflow-auto">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-xl font-bold text-white flex items-center gap-2"><i data-lucide="video" class="w-5 h-5 text-[#D4AF37]"></i>Video Testimonials</h1>
        <div class="flex gap-2">
          <div class="relative"><i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]"></i><input data-testid="video-search" value="${search}" placeholder="Search..." class="bg-[#111] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-white w-48 focus:border-[#D4AF37] focus:outline-none" id="vt-search"></div>
          <button data-testid="add-video-btn" onclick="document.getElementById('vt-add-modal').classList.remove('hidden');initIcons()" class="btn-gold px-4 py-2 text-xs"><i data-lucide="plus" class="w-4 h-4 inline mr-1"></i>Add Video</button>
        </div>
      </div>
      <div class="flex gap-2 mb-6">${['all','pending','approved','rejected'].map(f=>`<button data-vf="${f}" class="px-3 py-1.5 rounded-lg text-xs font-medium ${filter===f?'bg-[#D4AF37] text-black':'bg-[#111] text-[#A1A1AA] hover:bg-white/5'}">${f==='all'?'All':f} (${vids.filter(v=>f==='all'||v.status===f).length})</button>`).join('')}</div>
      ${filtered.length===0?'<div class="text-center py-20 text-[#A1A1AA] text-sm">No video testimonials found</div>':
      `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${filtered.map(v=>{
        const ytId = v.video_url?.match(/(?:embed\/|watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1];
        return `<div data-testid="admin-video-${v.testimonial_id}" class="bg-[#111] border border-[#27272A] rounded-xl overflow-hidden">
        <div class="aspect-video bg-[#0A0A0A] flex items-center justify-center relative">
          ${ytId?`<img src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" class="w-full h-full object-cover">`:'<i data-lucide="video" class="w-10 h-10 text-[#27272A]"></i>'}
          <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status==='approved'?'bg-green-500/20 text-green-400':v.status==='rejected'?'bg-red-500/20 text-red-400':'bg-yellow-500/20 text-yellow-400'}">${v.status}</span>
        </div>
        <div class="p-4">
          <p class="text-sm font-bold text-white mb-1">${v.student_name}</p>
          ${v.course_title?`<p class="text-[10px] text-[#D4AF37] mb-1">${v.course_title}</p>`:''}
          ${v.description?`<p class="text-xs text-[#A1A1AA] line-clamp-2 mb-3">${v.description}</p>`:''}
          <div class="flex gap-2">
            ${v.status==='pending'?`<button onclick="Api.updateAdminVideoTestimonial('${v.testimonial_id}',{status:'approved'}).then(()=>{showToast('Approved!');loadVids()})" class="flex-1 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-semibold">Approve</button><button onclick="Api.updateAdminVideoTestimonial('${v.testimonial_id}',{status:'rejected'}).then(()=>{showToast('Rejected');loadVids()})" class="flex-1 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold">Reject</button>`:''}
            ${v.video_url?`<a href="${v.video_url}" target="_blank" class="py-1.5 px-3 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-xs font-semibold">View</a>`:''}
            <button onclick="if(confirm('Delete?'))Api.deleteAdminVideoTestimonial('${v.testimonial_id}').then(()=>{showToast('Deleted');loadVids()})" class="py-1.5 px-3 bg-red-500/10 text-red-400 rounded-lg text-xs"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
          </div>
        </div>
      </div>`}).join('')}</div>`}

      <!-- Add Modal -->
      <div id="vt-add-modal" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onclick="if(event.target===this)this.classList.add('hidden')">
        <div class="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-md p-6" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between mb-4"><h3 class="text-sm font-bold text-white">Add Video Testimonial</h3><button onclick="document.getElementById('vt-add-modal').classList.add('hidden')"><i data-lucide="x" class="w-5 h-5 text-[#A1A1AA]"></i></button></div>
          <form id="vt-admin-form" class="space-y-3">
            <input data-testid="vt-name" name="student_name" placeholder="Student Name *" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
            <input name="course_title" placeholder="Course Name" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
            <input data-testid="vt-url" name="video_url" placeholder="Video URL *" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
            <textarea name="description" placeholder="Description" rows="2" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none"></textarea>
            <button data-testid="save-video-btn" type="submit" class="btn-gold w-full py-2.5 text-sm">Add Testimonial</button>
          </form>
        </div>
      </div>
    </main></div>`);

    document.getElementById('vt-search')?.addEventListener('input', (e) => { search = e.target.value; render(); });
    document.querySelectorAll('[data-vf]').forEach(btn => btn.addEventListener('click', () => { filter = btn.dataset.vf; render(); }));
    document.getElementById('vt-admin-form')?.addEventListener('submit', async (e) => {
      e.preventDefault(); const fd = new FormData(e.target); const d = Object.fromEntries(fd); d.video_type = 'youtube';
      if (!d.student_name || !d.video_url) { showToast('Name and URL required', 'error'); return; }
      try { await Api.addAdminVideoTestimonial(d); showToast('Added!'); document.getElementById('vt-add-modal').classList.add('hidden'); loadVids(); } catch { showToast('Failed', 'error'); }
    });
  }

  function loadVids() { Api.getAdminVideoTestimonials().then(data => { vids = data; render(); }).catch(() => render()); }
  window.loadVids = loadVids;
  loadVids();
}
