// Reviews Page
function renderReviewsPage() {
  let reviews = [], filter = 'all';
  function render() {
    const filtered = filter === 'all' ? reviews : reviews.filter(r => r.user_country === filter);
    const count = { all: reviews.length, PK: reviews.filter(r=>r.user_country==='PK').length, AE: reviews.filter(r=>r.user_country==='AE').length, GB: reviews.filter(r=>r.user_country==='GB').length, US: reviews.filter(r=>r.user_country==='US').length };

    const card = (r) => `<div class="h-full bg-[#111111] border border-[#27272A] rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-all hover:-translate-y-1 flex flex-col">
      <div class="flex gap-0.5 mb-3">${[1,2,3,4,5].map(s=>`<i data-lucide="star" class="w-3.5 h-3.5 ${s<=r.rating?'fill-[#D4AF37] text-[#D4AF37]':'text-[#27272A]'}"></i>`).join('')}</div>
      <p class="text-sm text-[#A1A1AA] leading-relaxed flex-1 italic">"${r.comment}"</p>
      <div class="flex items-center gap-3 pt-4 mt-4 border-t border-[#27272A]">
        <div class="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-xs">${(r.user_name||'U').charAt(0)}</div>
        <div><p class="text-sm font-semibold text-white">${r.user_name}</p><p class="text-[10px] text-[#A1A1AA]">Verified Student</p></div>
      </div>
    </div>`;

    renderPublicPage(`<div data-testid="reviews-page" class="page-transition min-h-screen bg-[#050505]">
      <section class="pt-12 pb-8 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12">
        <p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Testimonials</p>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Student Reviews</h1>
        <p class="text-base text-[#A1A1AA] max-w-xl mb-6">${reviews.length}+ students sharing their success stories.</p>
        <div class="flex flex-wrap gap-2">${[{k:'all',l:'All Reviews'},{k:'PK',l:'Pakistan'},{k:'AE',l:'UAE'},{k:'GB',l:'UK'},{k:'US',l:'USA'}].map(f=>`<button data-filter="${f.k}" class="px-4 py-2 rounded-full text-xs font-semibold transition-colors ${filter===f.k?'bg-[#D4AF37] text-black':'bg-[#111111] text-[#A1A1AA] border border-[#27272A]'}">${f.l} (${count[f.k]||0})</button>`).join('')}</div>
      </div></section>
      <section class="py-12"><div class="max-w-7xl mx-auto px-6 md:px-12">
        <h2 class="text-lg font-bold text-white mb-6">All Reviews (${filtered.length})</h2>
        ${filtered.length === 0 ? '<div class="text-center py-20"><p class="text-[#A1A1AA]">No reviews found.</p></div>' :
        `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">${filtered.map(r => card(r)).join('')}</div>`}
      </div></section>
    </div>`);

    document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => { filter = btn.dataset.filter; render(); }));
  }
  Api.getReviews().then(data => { reviews = data; render(); }).catch(() => render());
}
