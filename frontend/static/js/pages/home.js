// Home Page
function renderHomePage() {
  const app = document.getElementById('app');
  app.innerHTML = Components.header() + `<main class="pt-16">
    <div class="page-transition overflow-hidden">
      <!-- Hero -->
      <section data-testid="hero-section" class="relative min-h-screen flex items-center">
        <div class="absolute inset-0 bg-[#050505]"><div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)]"></div></div>
        <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-28">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-2 mb-6">
                <i data-lucide="sparkles" class="w-4 h-4 text-[#D4AF37]"></i>
                <span class="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">OEC Tech Institute</span>
              </div>
              <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">Learn High-Income Skills & <span class="text-gold-gradient">Start Earning Online</span></h1>
              <p class="text-base md:text-lg text-[#A1A1AA] leading-relaxed mb-8 max-w-xl">Master in-demand digital skills with practical, weekly-structured courses. Join thousands of students from Pakistan, UAE, UK & USA.</p>
              <div class="flex flex-wrap gap-3 mb-10">
                <a href="/courses" data-link data-testid="hero-enroll-btn" class="btn-gold px-6 py-3 text-sm">Enroll Now</a>
                <a href="/courses" data-link data-testid="hero-view-courses-btn" class="btn-gold-outline px-6 py-3 text-sm">View Courses</a>
              </div>
              <div class="grid grid-cols-4 gap-4 pt-8 border-t border-[#27272A]">
                <div class="text-center"><p class="text-2xl font-bold text-[#D4AF37]" id="stat-students">0</p><p class="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-1">Students</p></div>
                <div class="text-center"><p class="text-2xl font-bold text-[#D4AF37]" id="stat-courses">0</p><p class="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-1">Courses</p></div>
                <div class="text-center"><p class="text-2xl font-bold text-[#D4AF37]" id="stat-diplomas">0</p><p class="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-1">Diplomas</p></div>
                <div class="text-center"><p class="text-2xl font-bold text-[#D4AF37]" id="stat-rate">0</p><p class="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-1">Success Rate</p></div>
              </div>
            </div>
            <div class="relative hidden lg:block">
              <div class="animate-float relative z-10">
                <img src="https://static.prod-images.emergentagent.com/jobs/9d749137-e5fd-4883-acd9-df8b19d7973e/images/ae3c6654a4654a0ca0c8dc38f24e04b047b0b5460528ae9d5babb12e845cd333.png" alt="3D Tech Education" class="w-full max-w-[500px] mx-auto drop-shadow-[0_20px_60px_rgba(212,175,55,0.15)]">
              </div>
              <div class="absolute top-10 right-0 glass-panel rounded-xl px-4 py-3 z-20 animate-float">
                <div class="flex items-center gap-2"><i data-lucide="trending-up" class="w-5 h-5 text-green-400"></i><div><p class="text-[10px] text-[#A1A1AA]">Earning Potential</p><p class="text-sm font-bold text-white">$500-$2000/mo</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Strip -->
      <section class="py-8 bg-[#0A0A0A] border-y border-[#27272A]">
        <div class="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap justify-center gap-8 md:gap-16">
          ${[{i:'shield',t:'Secure Payments'},{i:'clock',t:'Lifetime Access'},{i:'award',t:'Certified Diplomas'},{i:'zap',t:'Practical Training'},{i:'users',t:'Community Support'}].map(x=>`<div class="flex items-center gap-2 text-sm text-[#A1A1AA]"><i data-lucide="${x.i}" class="w-4 h-4 text-[#D4AF37]"></i>${x.t}</div>`).join('')}
        </div>
      </section>

      <!-- Featured Courses -->
      <section data-testid="featured-courses" class="py-24 bg-[#050505]">
        <div class="max-w-7xl mx-auto px-6 md:px-12">
          <div class="text-center mb-16">
            <p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Our Courses</p>
            <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Featured Courses</h2>
            <p class="text-base text-[#A1A1AA] max-w-xl mx-auto">Start your career with our expert-led courses.</p>
          </div>
          <div id="home-courses-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">${Components.spinner()}</div>
          <div class="text-center mt-12"><a href="/courses" data-link class="btn-gold-outline px-6 py-2.5 text-sm">View All Courses</a></div>
        </div>
      </section>

      <!-- Benefits -->
      <section data-testid="benefits-section" class="py-24 bg-[#0A0A0A]">
        <div class="max-w-7xl mx-auto px-6 md:px-12">
          <div class="text-center mb-16"><p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Why Choose Us</p><h2 class="text-3xl sm:text-4xl font-bold text-white">Why OEC Tech Institute?</h2></div>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            ${[{i:'zap',t:'Practical Training',d:'No boring theory. Learn by doing real projects.',s:'md:col-span-8'},{i:'clock',t:'Lifetime Access',d:'Pay once, learn forever.',s:'md:col-span-4'},{i:'award',t:'Diploma Tracks',d:'Earn recognized diplomas.',s:'md:col-span-4'},{i:'shield',t:'Weekly Structure',d:'Organized weekly modules.',s:'md:col-span-4'},{i:'users',t:'Community Support',d:'Join WhatsApp groups.',s:'md:col-span-4'}].map(x=>`<div class="${x.s}"><div class="h-full bg-[#111111] border border-[#27272A] rounded-2xl p-8 hover:border-[#D4AF37]/30 transition-all duration-500 hover:-translate-y-1"><i data-lucide="${x.i}" class="w-10 h-10 text-[#D4AF37] mb-4"></i><h3 class="text-xl font-bold text-white mb-2">${x.t}</h3><p class="text-sm text-[#A1A1AA]">${x.d}</p></div></div>`).join('')}
          </div>
        </div>
      </section>

      <!-- Reviews Preview -->
      <section data-testid="reviews-preview" class="py-24 bg-[#050505]" id="home-reviews-section"></section>

      <!-- CTA -->
      <section data-testid="cta-section" class="py-24 bg-[#050505] relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06),transparent_70%)]"></div>
        <div class="relative z-10 max-w-3xl mx-auto px-6 md:px-12 text-center">
          <div class="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-6">
            <span class="relative flex h-2 w-2"><span class="animate-ping-custom absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
            <span class="text-xs font-semibold text-red-400 uppercase tracking-wider">Limited Seats Available</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-6">Start Your Career Today</h2>
          <p class="text-base text-[#A1A1AA] mb-8">Don't wait. Join 2,500+ students already earning online.</p>
          <div class="flex flex-wrap justify-center gap-4">
            <a href="/courses" data-link class="btn-gold px-6 py-3 text-sm">Enroll Now</a>
            <a href="https://wa.me/923000517616" target="_blank" class="btn-gold-outline px-6 py-3 text-sm">Ask on WhatsApp</a>
          </div>
        </div>
      </section>

      <!-- Location Map -->
      <section class="py-24 bg-[#050505]">
        <div class="max-w-7xl mx-auto px-6 md:px-12">
          <div class="text-center mb-16"><p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Find Us</p><h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Our Location</h2></div>
          <div class="rounded-2xl overflow-hidden border border-[#27272A]">
            <iframe src="https://www.google.com/maps?q=OEC+Tech+Institute+Chunian&output=embed" width="100%" height="400" style="border:0;filter:invert(90%) hue-rotate(180deg) brightness(0.95) contrast(0.9)" loading="lazy"></iframe>
          </div>
        </div>
      </section>

      <!-- FAQ Preview -->
      <section class="py-24 bg-[#0A0A0A]">
        <div class="max-w-3xl mx-auto px-6 md:px-12">
          <div class="text-center mb-16"><p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Common Questions</p><h2 class="text-3xl sm:text-4xl font-bold text-white">Frequently Asked Questions</h2></div>
          <div class="space-y-4" id="home-faq-list">
            ${[{q:"Who are these courses for?",a:"Our courses are designed for complete beginners who want to learn digital skills and start earning online."},{q:"Do I get lifetime access?",a:"Yes! Once you enroll, you get lifetime access to all course materials and updates."},{q:"What payment methods do you accept?",a:"We accept JazzCash, EasyPaisa, and Bank Transfer."},{q:"How long does each course take?",a:"Most courses are 5-6 weeks long with weekly modules."}].map((f,i)=>`<div class="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden"><button onclick="this.nextElementSibling.classList.toggle('hidden');this.querySelector('i').style.transform=this.nextElementSibling.classList.contains('hidden')?'':'rotate(180deg)'" class="w-full flex items-center justify-between px-6 py-5 text-left"><span class="text-sm font-semibold text-white">${f.q}</span><i data-lucide="chevron-down" class="w-5 h-5 text-[#A1A1AA] transition-transform"></i></button><div class="hidden px-6 pb-5"><p class="text-sm text-[#A1A1AA] leading-relaxed">${f.a}</p></div></div>`).join('')}
          </div>
          <div class="text-center mt-8"><a href="/faq" data-link class="text-sm text-[#D4AF37] hover:text-[#FBBF24]">View All FAQs</a></div>
        </div>
      </section>
    </div>
  </main>` + Components.footer() + Components.whatsapp();
  initIcons();

  // Animate counters
  const animateCounter = (el, target, suffix = '') => {
    let current = 0; const inc = target / 60;
    const timer = setInterval(() => { current += inc; if (current >= target) { el.textContent = target.toLocaleString() + suffix; clearInterval(timer); } else el.textContent = Math.floor(current).toLocaleString() + suffix; }, 16);
  };
  animateCounter(document.getElementById('stat-students'), 2500, '+');
  animateCounter(document.getElementById('stat-courses'), 7, '');
  animateCounter(document.getElementById('stat-diplomas'), 3, '');
  animateCounter(document.getElementById('stat-rate'), 95, '%');

  // Load courses
  Api.getCourses().then(courses => {
    const grid = document.getElementById('home-courses-grid');
    grid.innerHTML = courses.slice(0, 6).map(c => `
      <a href="/courses/${c.course_id}" data-link class="course-card block bg-[#111111] border border-[#27272A] rounded-2xl overflow-hidden group">
        <div class="relative aspect-[4/3] overflow-hidden bg-[#1A1A1A]">
          <img src="${c.image_url}" alt="${c.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div class="absolute top-3 right-3 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full">${c.level}</div>
          <div class="absolute bottom-3 left-3"><span class="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">${c.category}</span></div>
        </div>
        <div class="p-6">
          <h3 class="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">${c.title}</h3>
          <p class="text-sm text-[#A1A1AA] mb-4 line-clamp-2">${c.short_description || ''}</p>
          <div class="flex items-center justify-between pt-4 border-t border-[#27272A]">
            <div class="flex items-center gap-3 text-xs text-[#A1A1AA]"><span><i data-lucide="clock" class="w-3.5 h-3.5 inline"></i> ${c.duration}</span></div>
            <span class="text-lg font-bold text-[#D4AF37]">PKR ${(c.price||0).toLocaleString()}</span>
          </div>
        </div>
      </a>`).join('');
    initIcons();
  }).catch(() => {});

  // Load reviews
  Api.getReviews().then(reviews => {
    const section = document.getElementById('home-reviews-section');
    if (reviews.length === 0) return;
    const top4 = reviews.slice(0, 4);
    section.innerHTML = `<div class="max-w-7xl mx-auto px-6 md:px-12">
      <div class="text-center mb-16"><p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Success Stories</p><h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">What Our Students Say</h2></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">${top4.map(r => `<div class="bg-[#111111] border border-[#27272A] rounded-2xl p-8 hover:border-[#D4AF37]/30 transition-colors">
        <div class="flex gap-0.5 mb-4">${[1,2,3,4,5].map(s=>`<i data-lucide="star" class="w-4 h-4 ${s<=r.rating?'fill-[#D4AF37] text-[#D4AF37]':'text-[#27272A]'}"></i>`).join('')}</div>
        <p class="text-[#A1A1AA] text-sm leading-relaxed mb-6 italic">"${r.comment}"</p>
        <div class="flex items-center gap-3 pt-4 border-t border-[#27272A]">
          <div class="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">${(r.user_name||'U').charAt(0)}</div>
          <div><span class="text-white font-medium text-sm block">${r.user_name}</span><span class="text-[#A1A1AA] text-xs">Verified Student</span></div>
        </div>
      </div>`).join('')}</div>
      <div class="text-center mt-12"><a href="/reviews" data-link class="btn-gold-outline px-6 py-2.5 text-sm">View All Reviews</a></div>
    </div>`;
    initIcons();
  }).catch(() => {});
}
