// Diploma Tracks Page
function renderDiplomaTracksPage() {
  renderPublicPage(Components.loading());
  Promise.all([Api.getDiplomaTracks(), Api.getCourses()]).then(([tracks, courses]) => {
    const getCourse = (id) => courses.find(c => c.course_id === id);
    const getTotal = (t) => (t.courses||[]).reduce((s, cId) => { const c = getCourse(cId); return s + (c?.price||0) + (c?.admission_fee||0); }, 0);

    renderPublicPage(`<div data-testid="diploma-tracks-page" class="page-transition min-h-screen bg-[#050505]">
      <section class="pt-8 pb-6 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12">
        <p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Career Paths</p>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Diploma Tracks</h1>
        <p class="text-base text-[#A1A1AA] max-w-xl">Follow structured career paths to master complete skill sets.</p>
      </div></section>
      <section class="py-10"><div class="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        ${tracks.map(t => { const total = getTotal(t); return `<div class="bg-[#111111] border border-[#27272A] rounded-2xl overflow-hidden">
          <div class="p-8 md:p-10 border-b border-[#27272A]">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center shrink-0"><i data-lucide="award" class="w-7 h-7 text-[#D4AF37]"></i></div>
              <div class="flex-1"><h2 class="text-2xl font-bold text-white mb-2">${t.title}</h2><p class="text-sm text-[#A1A1AA]">${t.description}</p></div>
              <div class="hidden md:block text-right shrink-0"><p class="text-xs text-[#A1A1AA] mb-1">Total Investment</p><p class="text-2xl font-bold text-[#D4AF37]">PKR ${total.toLocaleString()}</p><p class="text-[10px] text-[#A1A1AA]">${t.courses?.length||0} courses</p></div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="p-8 md:p-10 border-b md:border-b-0 md:border-r border-[#27272A]">
              <h3 class="text-lg font-bold text-white mb-6">Roadmap</h3>
              <div class="space-y-4">${(t.roadmap||[]).map(s=>`<div class="flex gap-4"><div class="w-8 h-8 bg-[#D4AF37]/10 rounded-full flex items-center justify-center shrink-0 text-[#D4AF37] text-sm font-bold">${s.step}</div><div><h4 class="text-sm font-bold text-white">${s.title}</h4><p class="text-xs text-[#A1A1AA]">${s.description}</p></div></div>`).join('')}</div>
              <div class="mt-8 space-y-3"><h4 class="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider">Included Courses</h4>
                ${(t.courses||[]).map(cId => { const c = getCourse(cId); return `<a href="/courses/${cId}" data-link class="flex items-center gap-3 p-3 bg-[#0A0A0A] rounded-lg hover:bg-white/5 transition-colors"><i data-lucide="book-open" class="w-4 h-4 text-[#D4AF37]"></i><span class="text-sm text-[#A1A1AA] flex-1">${c?.title||cId}</span><span class="text-xs text-[#D4AF37]">PKR ${(c?.price||0).toLocaleString()}</span></a>`; }).join('')}
              </div>
            </div>
            <div class="p-8 md:p-10">
              <h3 class="text-lg font-bold text-white mb-6">Career Outcomes</h3>
              <ul class="space-y-4">${(t.outcomes||[]).map(o=>`<li class="flex items-start gap-3"><i data-lucide="check-circle-2" class="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5"></i><span class="text-sm text-[#A1A1AA]">${o}</span></li>`).join('')}</ul>
              <div class="mt-8"><a href="/checkout/track/${t.track_id}" data-link data-testid="track-enroll-${t.track_id}" class="btn-gold px-5 py-2.5 text-sm">Start This Track</a></div>
            </div>
          </div>
        </div>`; }).join('')}
      </div></section>
    </div>`);
  }).catch(() => renderPublicPage('<div class="min-h-screen flex items-center justify-center"><p class="text-[#A1A1AA]">Failed to load tracks</p></div>'));
}
