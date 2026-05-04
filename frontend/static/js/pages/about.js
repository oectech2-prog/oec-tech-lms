// About page is in login.js (combined)

// Contact Page
function renderContactPage() {
  renderPublicPage(`<div data-testid="contact-page" class="page-transition min-h-screen bg-[#050505]">
    <section class="pt-8 pb-6 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12">
      <p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Get in Touch</p>
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Contact Us</h1>
      <p class="text-base text-[#A1A1AA] max-w-xl">Have questions about our courses? We are here to help.</p>
    </div></section>
    <section class="py-10"><div class="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-5 gap-12">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-[#111111] border border-[#27272A] rounded-2xl p-8 space-y-6">
          <div class="flex items-start gap-4"><i data-lucide="mail" class="w-6 h-6 text-[#D4AF37] shrink-0"></i><div><h4 class="text-sm font-bold text-white mb-1">Email</h4><p class="text-sm text-[#A1A1AA]">info@oectechs.com</p></div></div>
          <div class="flex items-start gap-4"><i data-lucide="phone" class="w-6 h-6 text-[#D4AF37] shrink-0"></i><div><h4 class="text-sm font-bold text-white mb-1">Phone</h4><p class="text-sm text-[#A1A1AA]">0300-0517616</p></div></div>
          <div class="flex items-start gap-4"><i data-lucide="map-pin" class="w-6 h-6 text-[#D4AF37] shrink-0"></i><div><h4 class="text-sm font-bold text-white mb-1">Location</h4><p class="text-sm text-[#A1A1AA]">OEC Tech Institute, Chunian, Pakistan</p></div></div>
        </div>
        <a href="https://wa.me/923000517616" target="_blank" class="block bg-green-600/10 border border-green-600/30 rounded-2xl p-6 hover:bg-green-600/20 transition-colors"><i data-lucide="message-circle" class="w-8 h-8 text-green-400 mb-3"></i><h4 class="text-lg font-bold text-white mb-1">Chat on WhatsApp</h4><p class="text-sm text-[#A1A1AA]">Quick response guaranteed.</p></a>
      </div>
      <div class="lg:col-span-3">
        <form id="contact-form" class="bg-[#111111] border border-[#27272A] rounded-2xl p-8 space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div><label class="text-white text-sm mb-2 block">Full Name *</label><input data-testid="contact-name" name="name" placeholder="Your name" class="w-full bg-[#050505] border border-[#27272A] text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none"></div>
            <div><label class="text-white text-sm mb-2 block">Email *</label><input data-testid="contact-email" name="email" type="email" placeholder="your@email.com" class="w-full bg-[#050505] border border-[#27272A] text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none"></div>
          </div>
          <div><label class="text-white text-sm mb-2 block">Subject</label><input data-testid="contact-subject" name="subject" placeholder="What's this about?" class="w-full bg-[#050505] border border-[#27272A] text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none"></div>
          <div><label class="text-white text-sm mb-2 block">Message *</label><textarea data-testid="contact-message" name="message" rows="5" placeholder="Tell us how we can help..." class="w-full bg-[#050505] border border-[#27272A] text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none resize-none"></textarea></div>
          <button type="submit" data-testid="contact-submit-btn" class="btn-gold px-6 py-2.5 text-sm">Send Message</button>
        </form>
      </div>
    </div></section>
    <section class="py-16 bg-[#0A0A0A]"><div class="max-w-7xl mx-auto px-6 md:px-12"><h2 class="text-2xl font-bold text-white mb-6">Find Us on Map</h2><div class="rounded-2xl overflow-hidden border border-[#27272A]"><iframe src="https://www.google.com/maps?q=OEC+Tech+Institute+Chunian&output=embed" width="100%" height="450" style="border:0;filter:invert(90%) hue-rotate(180deg) brightness(0.95) contrast(0.9)" loading="lazy"></iframe></div></div></section>
  </div>`);

  document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    if (!data.name || !data.email || !data.message) { showToast('Please fill required fields', 'error'); return; }
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending...';
    try { await Api.sendContact(data); showToast('Message sent successfully!'); e.target.reset(); }
    catch { showToast('Failed to send message', 'error'); }
    btn.disabled = false; btn.textContent = 'Send Message';
  });
}
