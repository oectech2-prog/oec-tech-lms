import { api } from '../api.js';

export async function diplomaTracksPage() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page-transition min-h-screen bg-[#050505]">
    <section class="pt-12 pb-8 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12"><p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Career Paths</p><h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Diploma Tracks</h1><p class="text-base text-[#A1A1AA] max-w-xl">Complete structured career paths and earn your diploma.</p></div></section>
    <section class="py-12"><div class="max-w-7xl mx-auto px-6 md:px-12"><div id="tracks-list" class="space-y-8"><div class="flex justify-center py-20"><div class="spinner"></div></div></div></div></section>
  </div>`;
  try {
    const tracks = await api.getDiplomaTracks();
    const allCourses = await api.getCourses();
    const courseMap = {};
    allCourses.forEach(c => courseMap[c.course_id] = c);
    document.getElementById('tracks-list').innerHTML = tracks.map(t => {
      const tCourses = (t.courses || []).map(cid => courseMap[cid]).filter(Boolean);
      const totalPrice = tCourses.reduce((s, c) => s + (c.price || 0), 0);
      return `<div class="bg-[#111] border border-[#27272A] rounded-2xl p-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div><div class="flex items-center gap-3 mb-2"><i data-lucide="award" class="w-8 h-8 text-[#D4AF37]"></i><h2 class="text-2xl font-bold text-white">${t.title}</h2></div><p class="text-sm text-[#A1A1AA]">${t.description}</p></div>
          <div class="text-right shrink-0"><span class="text-2xl font-bold text-[#D4AF37]">PKR ${totalPrice.toLocaleString()}</span><span class="text-xs text-[#A1A1AA] block">${tCourses.length} courses included</span><a href="/checkout/track/${t.track_id}" data-link class="btn-gold px-6 py-2 text-xs mt-3 inline-block">Enroll in Diploma</a></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${tCourses.map(c => `
          <a href="/courses/${c.course_id}" data-link class="bg-[#0A0A0A] border border-[#27272A] rounded-xl p-4 hover:border-[#D4AF37]/30 transition-colors group">
            <h4 class="text-sm font-bold text-white mb-1 group-hover:text-[#D4AF37]">${c.title}</h4>
            <p class="text-xs text-[#A1A1AA] mb-2">${c.duration} | ${c.level}</p>
            <span class="text-xs text-[#D4AF37]">PKR ${c.price?.toLocaleString()}</span>
          </a>`).join('')}
        </div>
      </div>`;
    }).join('');
  } catch { document.getElementById('tracks-list').innerHTML = '<p class="text-center text-[#A1A1AA] py-20">Failed to load tracks</p>'; }
  if (window.lucide) lucide.createIcons();
}
