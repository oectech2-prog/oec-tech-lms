import { api } from '../api.js';
export async function reviewsPage() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page-transition min-h-screen bg-[#050505]"><section class="pt-12 pb-8 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12"><p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Student Reviews</p><h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">What Our Students Say</h1></div></section><section class="py-12"><div class="max-w-7xl mx-auto px-6 md:px-12"><div id="reviews-list" class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="col-span-full flex justify-center py-20"><div class="spinner"></div></div></div></div></section></div>`;
  try {
    const reviews = await api.getReviews();
    document.getElementById('reviews-list').innerHTML = reviews.map(r => `<div class="bg-[#111] border border-[#27272A] rounded-2xl p-8 hover:border-[#D4AF37]/30 transition-colors"><div class="flex gap-0.5 mb-4">${[1,2,3,4,5].map(s=>`<i data-lucide="star" class="w-4 h-4 ${s<=r.rating?'fill-[#D4AF37] text-[#D4AF37]':'text-[#27272A]'}"></i>`).join('')}</div><p class="text-[#A1A1AA] text-sm leading-relaxed mb-6 italic">"${r.comment}"</p><div class="flex items-center gap-3 pt-4 border-t border-[#27272A]"><div class="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">${r.user_name?.charAt(0)||'?'}</div><div><span class="text-white font-medium text-sm block">${r.user_name}</span><span class="text-[#A1A1AA] text-xs">Verified Student</span></div></div></div>`).join('');
  } catch { document.getElementById('reviews-list').innerHTML = '<p class="text-[#A1A1AA] text-center py-20">Failed to load reviews</p>'; }
  if (window.lucide) lucide.createIcons();
}
