// FAQ Page
const FAQ_DATA = [
  { cat:'General', qs:[{q:'Who are these courses for?',a:'Our courses are designed for complete beginners who want to learn digital skills and start earning online.'},{q:'What makes OEC Tech Institute different?',a:'We focus on practical, skills-based learning with weekly structured modules, real assignments, and final projects.'},{q:'Do I get a certificate or diploma?',a:'Yes! Upon completing courses you receive a certificate. Full diploma tracks earn you a professional diploma.'}]},
  { cat:'Courses & Content', qs:[{q:'How are courses structured?',a:'Each course is organized in weekly modules (typically 5-6 weeks). Each week includes video lessons and an assignment.'},{q:'Do I get lifetime access?',a:'Yes! Once you enroll, you get lifetime access to all course materials and updates.'},{q:'Can I learn at my own pace?',a:'Absolutely. While courses are structured in weekly formats, you can go at your own speed.'},{q:'What courses do you offer?',a:'We offer 7+ courses including Computer Applications, Graphic Designing, Social Media Marketing, WordPress, Shopify, Amazon VA, eBay, Etsy, and TikTok Shop.'}]},
  { cat:'Payment & Enrollment', qs:[{q:'What payment methods do you accept?',a:'We accept JazzCash, EasyPaisa, and Bank Transfer.'},{q:'How much do courses cost?',a:'Course prices range from PKR 5,000 to PKR 15,000.'},{q:'Is there a refund policy?',a:'We offer a 7-day satisfaction guarantee.'},{q:'How do I enroll?',a:'Create an account, choose your course, select payment method, and complete the payment.'}]},
  { cat:'Technical & Support', qs:[{q:'What do I need to get started?',a:'A laptop or desktop with internet access.'},{q:'How do I access courses after payment?',a:'Log into your dashboard. All enrolled courses appear in "My Courses".'},{q:'How can I contact support?',a:'Via WhatsApp (fastest), email, or contact form.'}]}
];

function renderFaqPage() {
  renderPublicPage(`<div data-testid="faq-page" class="page-transition min-h-screen bg-[#050505]">
    <section class="pt-12 pb-8 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12">
      <p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Help Center</p>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
      <p class="text-base text-[#A1A1AA] max-w-xl">Everything you need to know about our courses, payments, and platform.</p>
    </div></section>
    <section class="py-16"><div class="max-w-4xl mx-auto px-6 md:px-12 space-y-12">
      ${FAQ_DATA.map(s => `<div><h2 class="text-xl font-bold text-[#D4AF37] mb-6">${s.cat}</h2><div class="space-y-3">
        ${s.qs.map((f,i) => `<div class="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden">
          <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors">
            <span class="text-sm font-semibold text-white pr-4">${f.q}</span><i data-lucide="chevron-down" class="w-5 h-5 text-[#A1A1AA] shrink-0"></i>
          </button><div class="hidden px-6 pb-5"><p class="text-sm text-[#A1A1AA] leading-relaxed">${f.a}</p></div>
        </div>`).join('')}
      </div></div>`).join('')}
    </div></section>
  </div>`);
}
