export async function aboutPage() {
  document.getElementById('app').innerHTML = `<div class="page-transition min-h-screen bg-[#050505]">
    <section class="pt-12 pb-8 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12"><p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">About Us</p><h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">About OEC Tech Institute</h1></div></section>
    <section class="py-16"><div class="max-w-4xl mx-auto px-6 md:px-12 space-y-8">
      <div class="bg-[#111] border border-[#27272A] rounded-2xl p-8"><h2 class="text-2xl font-bold text-white mb-4">Our Mission</h2><p class="text-sm text-[#A1A1AA] leading-relaxed">OEC Tech Institute empowers students across Pakistan, UAE, UK & USA with real digital skills to earn online. We provide practical, weekly-structured courses taught by industry experts with lifetime access and community support.</p></div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${[{n:'2500+',l:'Students Enrolled',i:'users'},{n:'7+',l:'Expert Courses',i:'book-open'},{n:'4',l:'Countries',i:'globe'}].map(s=>`<div class="bg-[#111] border border-[#27272A] rounded-2xl p-8 text-center"><i data-lucide="${s.i}" class="w-10 h-10 text-[#D4AF37] mx-auto mb-4"></i><p class="text-3xl font-bold text-[#D4AF37] mb-2">${s.n}</p><p class="text-sm text-[#A1A1AA]">${s.l}</p></div>`).join('')}
      </div>
      <div class="bg-[#111] border border-[#27272A] rounded-2xl p-8"><h2 class="text-2xl font-bold text-white mb-4">Our Approach</h2><p class="text-sm text-[#A1A1AA] leading-relaxed mb-4">We believe in learning by doing. Every course includes weekly assignments, real-world projects, and a final capstone. Our 2-installment payment system makes quality education accessible to everyone.</p><p class="text-sm text-[#A1A1AA] leading-relaxed">Our diploma tracks provide comprehensive career paths in Digital Marketing, E-Commerce, and Web Design - giving you recognized credentials for your portfolio.</p></div>
    </div></section>
  </div>`;
  if (window.lucide) lucide.createIcons();
}
