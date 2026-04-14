export async function faqPage() {
  const faqs = [
    { q: "Who are these courses for?", a: "Our courses are designed for complete beginners who want to learn digital skills and start earning online. No prior experience needed." },
    { q: "Do I get lifetime access?", a: "Yes! Once you enroll and complete payment, you get lifetime access to all course materials, updates, and community support." },
    { q: "What payment methods do you accept?", a: "We accept JazzCash, EasyPaisa, and Bank Transfer. Upload your fee receipt and our admin will verify within 24 hours." },
    { q: "How long does each course take?", a: "Most courses are 5-6 weeks long with weekly modules. You can learn at your own pace with lifetime access." },
    { q: "How does the payment plan work?", a: "We offer a 2-installment plan: Pay admission fee + 1st installment to start, and the 2nd installment when your course is halfway complete." },
    { q: "What if I miss the 2nd installment?", a: "If you miss the 2nd installment deadline, your account may be temporarily deactivated until payment is resolved." },
    { q: "Do I get a certificate?", a: "Yes! Upon completing 100% of your course including all assignments, you can download your OEC Tech Institute certificate." },
    { q: "How do assignments work?", a: "Each week has an assignment. Submit it (text, link, or file upload), and once admin approves it, the next week's content unlocks." },
    { q: "Can I enroll in multiple courses?", a: "Absolutely! You can enroll in individual courses or choose a Diploma Track which bundles multiple related courses." },
    { q: "How do I contact support?", a: "You can reach us via WhatsApp at 0300-0517616 or email info@oectechs.com." },
  ];
  document.getElementById('app').innerHTML = `<div class="page-transition min-h-screen bg-[#050505]">
    <section class="pt-12 pb-8 border-b border-[#27272A]"><div class="max-w-3xl mx-auto px-6 md:px-12"><p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Help Center</p><h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1></div></section>
    <section class="py-12"><div class="max-w-3xl mx-auto px-6 md:px-12 space-y-4">${faqs.map(f => `
      <div class="bg-[#111] border border-[#27272A] rounded-xl overflow-hidden hover:border-[#D4AF37]/20 transition-colors">
        <button onclick="this.nextElementSibling.classList.toggle('hidden');this.querySelector('i').classList.toggle('rotate-180')" class="w-full flex items-center justify-between px-6 py-5 text-left"><span class="text-sm font-semibold text-white">${f.q}</span><i data-lucide="chevron-down" class="w-5 h-5 text-[#A1A1AA] transition-transform shrink-0 ml-4"></i></button>
        <div class="hidden px-6 pb-5"><p class="text-sm text-[#A1A1AA] leading-relaxed">${f.a}</p></div>
      </div>`).join('')}
    </div></section>
  </div>`;
  if (window.lucide) lucide.createIcons();
}
