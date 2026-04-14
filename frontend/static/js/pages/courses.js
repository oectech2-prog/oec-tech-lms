import { api } from '../api.js';

export async function coursesPage() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page-transition min-h-screen bg-[#050505]">
    <section class="pt-12 pb-8 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12">
      <p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Our Courses</p>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">All Courses</h1>
      <p class="text-base text-[#A1A1AA] max-w-xl mb-8">Choose from our expert-led courses and start your journey.</p>
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1 max-w-md"><i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]"></i><input id="course-search" data-testid="course-search" placeholder="Search courses..." class="input-dark pl-10"></div>
        <div id="cat-filters" class="flex gap-2 flex-wrap"></div>
      </div>
    </div></section>
    <section class="py-12"><div class="max-w-7xl mx-auto px-6 md:px-12"><div id="courses-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"><div class="col-span-full flex justify-center py-20"><div class="spinner"></div></div></div></div></section>
  </div>`;

  const CATS = ['All','Technology','Design','Marketing','E-Commerce','Web Development'];
  let courses = [], search = '', category = 'All';

  document.getElementById('cat-filters').innerHTML = CATS.map(c => `<button data-cat="${c}" class="px-4 py-2 rounded-full text-xs font-semibold transition-colors ${c==='All'?'bg-[#D4AF37] text-black':'bg-[#111] text-[#A1A1AA] border border-[#27272A] hover:border-[#D4AF37]/50'}">${c}</button>`).join('');

  function render() {
    const filtered = courses.filter(c => {
      const ms = c.title.toLowerCase().includes(search) || c.short_description.toLowerCase().includes(search);
      const mc = category === 'All' || c.category === category;
      return ms && mc;
    });
    if (!filtered.length) {
      document.getElementById('courses-list').innerHTML = '<div class="col-span-full text-center py-20"><i data-lucide="book-open" class="w-16 h-16 text-[#27272A] mx-auto mb-4"></i><p class="text-[#A1A1AA]">No courses found.</p></div>';
    } else {
      document.getElementById('courses-list').innerHTML = filtered.map(c => `
        <a href="/courses/${c.course_id}" data-link data-testid="course-card-${c.course_id}" class="course-card block bg-[#111] border border-[#27272A] rounded-2xl overflow-hidden group">
          <div class="relative aspect-[4/3] overflow-hidden bg-[#1A1A1A]"><img src="${c.image_url}" alt="${c.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy"><div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div><div class="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">${c.category}</div><div class="absolute top-3 right-3 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full">${c.level}</div></div>
          <div class="p-6"><h3 class="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">${c.title}</h3><p class="text-sm text-[#A1A1AA] mb-4 line-clamp-2">${c.short_description}</p>
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-4 text-xs text-[#A1A1AA]"><span class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5"></i>${c.duration}</span><span class="flex items-center gap-1"><i data-lucide="book-open" class="w-3.5 h-3.5"></i>${c.weeks?.length||0} weeks</span></div></div>
            <div class="flex items-center justify-between pt-4 border-t border-[#27272A]"><div><span class="text-xl font-bold text-[#D4AF37]">PKR ${c.price?.toLocaleString()}</span>${c.admission_fee>0?`<span class="text-[10px] text-[#A1A1AA] block">+ PKR ${c.admission_fee?.toLocaleString()} admission</span>`:''}</div></div>
            <div class="flex gap-2 mt-4"><span class="btn-gold-outline flex-1 text-center py-2 text-xs font-bold">View Details</span><a href="/checkout/${c.course_id}" data-link onclick="event.stopPropagation()" class="btn-gold flex-1 text-center py-2 text-xs font-bold">Enroll Now</a></div>
          </div>
        </a>`).join('');
    }
    if (window.lucide) lucide.createIcons();
  }

  document.getElementById('course-search').addEventListener('input', e => { search = e.target.value.toLowerCase(); render(); });
  document.getElementById('cat-filters').addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    category = btn.dataset.cat;
    document.querySelectorAll('[data-cat]').forEach(b => { b.className = `px-4 py-2 rounded-full text-xs font-semibold transition-colors ${b.dataset.cat===category?'bg-[#D4AF37] text-black':'bg-[#111] text-[#A1A1AA] border border-[#27272A]'}`; });
    render();
  });

  try { courses = await api.getCourses(); render(); } catch { document.getElementById('courses-list').innerHTML = '<p class="text-[#A1A1AA] text-center py-20">Failed to load courses</p>'; }
  if (window.lucide) lucide.createIcons();
}
