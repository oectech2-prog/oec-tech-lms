// Video Testimonials Page
function renderVideoTestimonialsPage() {
  let videos = [], playingId = null;
  function getYtId(url) { const m = url?.match(/(?:embed\/|watch\?v=|youtu\.be\/)([^&?/]+)/); return m ? m[1] : null; }

  Api.getVideoTestimonials().then(data => { videos = data; render(); }).catch(() => render());

  function render() {
    renderPublicPage(`<div class="page-transition min-h-screen bg-[#050505]">
      <section class="relative py-20 overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_60%)]"></div>
        <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div class="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-2 mb-6"><i data-lucide="video" class="w-4 h-4 text-[#D4AF37]"></i><span class="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Video Testimonials</span></div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">Real Students, <span class="text-gold-gradient">Real Results</span></h1>
          <p class="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto mb-8">Watch our students share their success stories.</p>
          ${Auth.isLoggedIn() ? `<button data-testid="submit-video-btn" onclick="document.getElementById('vt-modal').classList.remove('hidden');initIcons()" class="btn-gold px-6 py-3 text-sm"><i data-lucide="send" class="w-4 h-4 inline mr-1"></i>Share Your Story</button>` : ''}
        </div>
      </section>
      <section class="py-10" data-testid="video-testimonials-grid"><div class="max-w-7xl mx-auto px-6 md:px-12">
        ${videos.length === 0 ? '<div class="text-center py-20"><i data-lucide="video" class="w-16 h-16 text-[#27272A] mx-auto mb-4"></i><h3 class="text-lg font-bold text-white mb-2">No Video Testimonials Yet</h3><p class="text-sm text-[#A1A1AA]">Be the first to share your success story!</p></div>' :
        `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">${videos.map(v => {
          const ytId = getYtId(v.video_url);
          const thumb = v.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '');
          return `<div data-testid="video-card-${v.testimonial_id}" class="bg-[#111] border border-[#27272A] rounded-2xl overflow-hidden group hover:border-[#D4AF37]/50 transition-all duration-500 hover:-translate-y-2">
            <div class="relative aspect-video bg-[#0A0A0A]" id="vt-player-${v.testimonial_id}">
              ${playingId === v.testimonial_id && ytId ? `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1" class="w-full h-full" allow="autoplay" allowfullscreen></iframe>` :
              `${thumb ? `<img src="${thumb}" alt="" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center"><i data-lucide="video" class="w-12 h-12 text-[#27272A]"></i></div>'}
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="document.getElementById('vt-player-${v.testimonial_id}').innerHTML='<iframe src=\\'https://www.youtube.com/embed/${ytId}?autoplay=1\\' class=\\'w-full h-full\\' allow=\\'autoplay\\' allowfullscreen></iframe>'" class="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><i data-lucide="play" class="w-7 h-7 text-black ml-1"></i></button>
              </div>
              ${v.video_type === 'youtube' ? '<div class="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">YouTube</div>' : ''}`}
            </div>
            <div class="p-5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-sm">${v.user_picture ? `<img src="${v.user_picture}" class="w-full h-full rounded-full object-cover">` : (v.student_name||'U').charAt(0).toUpperCase()}</div>
                <div><p class="text-sm font-bold text-white">${v.student_name}</p>${v.course_title ? `<p class="text-[10px] text-[#D4AF37]">${v.course_title}</p>` : ''}</div>
              </div>
              ${v.description ? `<p class="text-xs text-[#A1A1AA] leading-relaxed line-clamp-3">"${v.description}"</p>` : ''}
              <div class="flex gap-0.5 mt-3">${[1,2,3,4,5].map(()=>'<i data-lucide="star" class="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]"></i>').join('')}</div>
            </div>
          </div>`; }).join('')}</div>`}
      </div></section>
      <section class="py-12 bg-[#0A0A0A]"><div class="max-w-3xl mx-auto px-6 md:px-12 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Ready to Write Your Success Story?</h2>
        <p class="text-base text-[#A1A1AA] mb-8">Join thousands of students and start earning online.</p>
        <a href="/courses" data-link class="btn-gold px-6 py-3 text-sm">Explore Courses</a>
      </div></section>

      <!-- Submit Modal -->
      <div id="vt-modal" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onclick="if(event.target===this)this.classList.add('hidden')">
        <div class="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-md p-6" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between mb-6"><h3 class="text-lg font-bold text-white">Submit Video Testimonial</h3><button onclick="document.getElementById('vt-modal').classList.add('hidden')" class="text-[#A1A1AA] hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button></div>
          <form id="vt-form" class="space-y-4">
            <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Video URL *</label><input data-testid="video-url-input" name="video_url" placeholder="https://youtube.com/watch?v=..." class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
            <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Course Name</label><input name="course_title" placeholder="Which course?" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
            <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Your Message</label><textarea name="description" rows="3" placeholder="Share your experience..." class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none"></textarea></div>
            <button type="submit" data-testid="submit-testimonial-btn" class="btn-gold w-full py-3 text-sm">Submit Testimonial</button>
          </form>
        </div>
      </div>
    </div>`);

    document.getElementById('vt-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = { video_type: 'youtube', video_url: fd.get('video_url'), course_title: fd.get('course_title'), description: fd.get('description') };
      if (!data.video_url) { showToast('Video URL required', 'error'); return; }
      try { await Api.submitVideoTestimonial(data); showToast('Submitted for review!'); document.getElementById('vt-modal').classList.add('hidden'); }
      catch (err) { showToast(err.detail || 'Failed', 'error'); }
    });
  }
}
