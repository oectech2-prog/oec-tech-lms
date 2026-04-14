import { api } from '../api.js';
export async function contactPage() {
  document.getElementById('app').innerHTML = `<div class="page-transition min-h-screen bg-[#050505]">
    <section class="pt-12 pb-8 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12"><p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Get in Touch</p><h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">Contact Us</h1></div></section>
    <section class="py-16"><div class="max-w-4xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div class="space-y-6">
        <div class="bg-[#111] border border-[#27272A] rounded-2xl p-6 space-y-4">
          ${[{i:'mail',l:'Email',v:'info@oectechs.com'},{i:'phone',l:'Phone',v:'0300-0517616'},{i:'map-pin',l:'Location',v:'Chunian, Pakistan'},{i:'message-circle',l:'WhatsApp',v:'<a href="https://wa.me/923000517616" target="_blank" class="text-green-400 hover:underline">Chat Now</a>'}].map(c=>`<div class="flex items-center gap-3"><div class="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center shrink-0"><i data-lucide="${c.i}" class="w-5 h-5 text-[#D4AF37]"></i></div><div><p class="text-[10px] text-[#A1A1AA]">${c.l}</p><p class="text-sm text-white">${c.v}</p></div></div>`).join('')}
        </div>
        <div class="rounded-2xl overflow-hidden border border-[#27272A]"><iframe src="https://www.google.com/maps?q=OEC+Tech+Institute+Chunian&output=embed" width="100%" height="250" style="border:0;filter:invert(90%) hue-rotate(180deg) brightness(0.95)" allowfullscreen loading="lazy" title="Map"></iframe></div>
      </div>
      <form id="contact-form" class="bg-[#111] border border-[#27272A] rounded-2xl p-6 space-y-4">
        <h3 class="text-lg font-bold text-white mb-2">Send a Message</h3>
        <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Name</label><input name="name" required class="input-dark" placeholder="Your name"></div>
        <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Email</label><input name="email" type="email" required class="input-dark" placeholder="your@email.com"></div>
        <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Subject</label><input name="subject" class="input-dark" placeholder="Subject"></div>
        <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Message</label><textarea name="message" required rows="4" class="input-dark resize-none" placeholder="Your message..."></textarea></div>
        <button type="submit" class="btn-gold w-full py-3 text-sm">Send Message</button>
      </form>
    </div></section>
  </div>`;
  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.postContact({ name: fd.get('name'), email: fd.get('email'), subject: fd.get('subject'), message: fd.get('message') });
      window.toast('Message sent successfully!');
      e.target.reset();
    } catch (err) { window.toast(err.message, 'error'); }
  });
  if (window.lucide) lucide.createIcons();
}
