// Courses Page
function renderCoursesPage() {
  let courses = [], search = '', category = 'All';
  const CATS = ['All','Technology','Design','Marketing','E-Commerce','Web Development'];

  function render() {
    const filtered = courses.filter(c => {
      const ms = !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.short_description||'').toLowerCase().includes(search.toLowerCase());
      const mc = category === 'All' || c.category === category;
      return ms && mc;
    });
    renderPublicPage(`<div class="page-transition min-h-screen bg-[#050505]">
      <section class="pt-12 pb-8 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12">
        <p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Our Courses</p>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">All Courses</h1>
        <p class="text-base text-[#A1A1AA] max-w-xl mb-8">Choose from our expert-led courses.</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative flex-1 max-w-md"><i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]"></i><input data-testid="course-search" placeholder="Search courses..." value="${search}" class="w-full pl-10 bg-[#111111] border border-[#27272A] text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-[#A1A1AA] focus:border-[#D4AF37] focus:outline-none" id="courses-search-input"></div>
          <div class="flex gap-2 flex-wrap">${CATS.map(c => `<button data-cat="${c}" class="px-4 py-2 rounded-full text-xs font-semibold transition-colors ${category === c ? 'bg-[#D4AF37] text-black' : 'bg-[#111111] text-[#A1A1AA] border border-[#27272A] hover:border-[#D4AF37]/50'}">${c}</button>`).join('')}</div>
        </div>
      </div></section>
      <section class="py-12"><div class="max-w-7xl mx-auto px-6 md:px-12">
        ${filtered.length === 0 ? '<div class="text-center py-20"><i data-lucide="book-open" class="w-16 h-16 text-[#27272A] mx-auto mb-4"></i><p class="text-[#A1A1AA]">No courses found.</p></div>' :
        `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">${filtered.map(c => `
          <a href="/courses/${c.course_id}" data-link data-testid="course-card-${c.course_id}" class="course-card block bg-[#111111] border border-[#27272A] rounded-2xl overflow-hidden group">
            <div class="relative aspect-[4/3] overflow-hidden bg-[#1A1A1A]">
              <img src="${c.image_url}" alt="${c.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute top-3 left-3"><span class="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">${c.category}</span></div>
              <div class="absolute top-3 right-3 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full">${c.level}</div>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">${c.title}</h3>
              <p class="text-sm text-[#A1A1AA] mb-4 line-clamp-2">${c.short_description||''}</p>
              <div class="flex items-center gap-4 text-xs text-[#A1A1AA] mb-4"><span><i data-lucide="clock" class="w-3.5 h-3.5 inline"></i> ${c.duration}</span><span><i data-lucide="book-open" class="w-3.5 h-3.5 inline"></i> ${c.weeks?.length||0} weeks</span></div>
              <div class="flex items-center justify-between pt-4 border-t border-[#27272A]">
                <div><span class="text-xl font-bold text-[#D4AF37]">PKR ${(c.price||0).toLocaleString()}</span>${c.admission_fee > 0 ? `<span class="text-[10px] text-[#A1A1AA] block">+ PKR ${c.admission_fee.toLocaleString()} admission</span>` : ''}</div>
              </div>
            </div>
          </a>`).join('')}</div>`}
      </div></section>
    </div>`);

    // Event listeners
    document.getElementById('courses-search-input')?.addEventListener('input', (e) => { search = e.target.value; render(); });
    document.querySelectorAll('[data-cat]').forEach(btn => btn.addEventListener('click', () => { category = btn.dataset.cat; render(); }));
  }

  Api.getCourses().then(data => { courses = data; render(); }).catch(() => render());
}
