// OEC Tech Institute - Shared Components
const Components = {
  header() {
    const u = Auth.user;
    const path = window.location.pathname;
    const links = [
      { to:'/', label:'Home' }, { to:'/courses', label:'Courses' }, { to:'/diploma-tracks', label:'Diplomas' },
      { to:'/video-testimonials', label:'Testimonials' }, { to:'/reviews', label:'Reviews' },
      { to:'/about', label:'About' }, { to:'/contact', label:'Contact' }, { to:'/faq', label:'FAQ' },
    ];
    const navHtml = links.map(l => `<a href="${l.to}" data-link data-testid="nav-${l.label.toLowerCase()}" class="px-3 py-2 rounded-lg text-sm font-medium transition-colors ${path === l.to ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}">${l.label}</a>`).join('');

    const authHtml = u ? `
      <div class="relative" id="user-dropdown-wrap">
        <button data-testid="user-menu-trigger" onclick="document.getElementById('user-dropdown').classList.toggle('hidden')" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
          ${u.picture ? `<img src="${u.picture}" alt="" class="w-8 h-8 rounded-full border border-[#D4AF37]/50">` : `<div class="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-sm font-bold">${(u.name||'U').charAt(0)}</div>`}
          <span class="text-sm text-white font-medium">${(u.name||'User').split(' ')[0]}</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-[#A1A1AA]"></i>
        </button>
        <div id="user-dropdown" class="hidden absolute right-0 top-full mt-1 bg-[#111111] border border-[#27272A] rounded-xl shadow-2xl min-w-[180px] py-1 z-50">
          <a href="/dashboard" data-link class="block px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5">Dashboard</a>
          <a href="/profile" data-link class="block px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5">Profile</a>
          ${u.role === 'admin' ? `<div class="border-t border-[#27272A] my-1"></div><a href="/admin" data-link class="block px-4 py-2.5 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10">Admin Panel</a>` : ''}
          <div class="border-t border-[#27272A] my-1"></div>
          <button onclick="Auth.logout()" class="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10">Logout</button>
        </div>
      </div>` : `
      <a href="/login" data-link data-testid="login-btn" class="px-5 py-2 text-sm font-semibold text-[#D4AF37] border border-[#D4AF37] rounded-full hover:bg-[#D4AF37]/10 transition-colors">Login</a>
      <a href="/courses" data-link data-testid="enroll-now-header-btn" class="px-5 py-2 text-sm font-bold bg-[#D4AF37] text-black rounded-full hover:bg-[#FBBF24] transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]">Enroll Now</a>`;

    return `<header data-testid="main-header" class="fixed top-0 w-full z-50 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20 transition-transform duration-300 header-visible">
      <div class="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <a href="/" data-link data-testid="logo-link" class="flex items-center gap-2 group">
          <i data-lucide="graduation-cap" class="w-8 h-8 text-[#D4AF37]"></i>
          <span class="text-lg font-bold text-white">OEC <span class="text-[#D4AF37]">Tech</span> Institute</span>
        </a>
        <nav class="hidden lg:flex items-center gap-1">${navHtml}</nav>
        <div class="hidden lg:flex items-center gap-3">${authHtml}</div>
        <button data-testid="mobile-menu-toggle" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')" class="lg:hidden p-2 text-white"><i data-lucide="menu" class="w-6 h-6"></i></button>
      </div>
      <div id="mobile-menu" class="hidden lg:hidden bg-[#050505]/95 backdrop-blur-xl border-t border-[#27272A] px-4 pb-4">
        <nav class="flex flex-col gap-1 py-2">${links.map(l => `<a href="${l.to}" data-link onclick="document.getElementById('mobile-menu').classList.add('hidden')" class="px-4 py-3 rounded-lg text-sm font-medium ${path === l.to ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#A1A1AA] hover:text-white'}">${l.label}</a>`).join('')}</nav>
        <div class="flex flex-col gap-2 pt-2 border-t border-[#27272A]">
          ${u ? `<a href="/dashboard" data-link class="px-4 py-3 text-sm text-white hover:bg-white/5 rounded-lg">Dashboard</a>${u.role === 'admin' ? '<a href="/admin" data-link class="px-4 py-3 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg">Admin Panel</a>' : ''}<button onclick="Auth.logout()" class="px-4 py-3 text-sm text-red-400 text-left hover:bg-red-500/10 rounded-lg">Logout</button>` : `<a href="/login" data-link class="btn-gold-outline text-center px-4 py-3 text-sm">Login</a><a href="/courses" data-link class="btn-gold text-center px-4 py-3 text-sm">Enroll Now</a>`}
        </div>
      </div>
    </header>`;
  },

  footer() {
    return `<footer data-testid="main-footer" class="bg-[#0A0A0A] border-t border-[#27272A]">
      <div class="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div class="space-y-4">
            <div class="flex items-center gap-2"><i data-lucide="graduation-cap" class="w-7 h-7 text-[#D4AF37]"></i><span class="text-lg font-bold text-white">OEC <span class="text-[#D4AF37]">Tech</span> Institute</span></div>
            <p class="text-[#A1A1AA] text-sm leading-relaxed">Empowering students across Pakistan, UAE, UK & USA with real digital skills to earn online.</p>
            <a href="https://wa.me/923000517616" target="_blank" data-testid="footer-whatsapp" class="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300"><i data-lucide="message-circle" class="w-4 h-4"></i>Chat on WhatsApp</a>
          </div>
          <div>
            <h4 class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Quick Links</h4>
            <ul class="space-y-3">${[{to:'/courses',l:'All Courses'},{to:'/diploma-tracks',l:'Diploma Tracks'},{to:'/reviews',l:'Student Reviews'},{to:'/about',l:'About Us'},{to:'/faq',l:'FAQ'}].map(x=>`<li><a href="${x.to}" data-link class="text-sm text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">${x.l}</a></li>`).join('')}</ul>
          </div>
          <div>
            <h4 class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Popular Courses</h4>
            <ul class="space-y-3">${['Social Media Marketing','Graphic Designing','Shopify Dropshipping','WordPress Development','Amazon VA'].map(c=>`<li><a href="/courses" data-link class="text-sm text-[#A1A1AA] hover:text-[#D4AF37]">${c}</a></li>`).join('')}</ul>
          </div>
          <div>
            <h4 class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Contact Us</h4>
            <ul class="space-y-3">
              <li class="flex items-center gap-2 text-sm text-[#A1A1AA]"><i data-lucide="mail" class="w-4 h-4 text-[#D4AF37]"></i>info@oectechs.com</li>
              <li class="flex items-center gap-2 text-sm text-[#A1A1AA]"><i data-lucide="phone" class="w-4 h-4 text-[#D4AF37]"></i>0300-0517616</li>
              <li class="flex items-center gap-2 text-sm text-[#A1A1AA]"><i data-lucide="map-pin" class="w-4 h-4 text-[#D4AF37]"></i>Pakistan | UAE | UK | USA</li>
            </ul>
          </div>
        </div>
        <div class="mt-12 pt-8 border-t border-[#27272A] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-xs text-[#A1A1AA]">&copy; ${new Date().getFullYear()} OEC Tech Institute. All rights reserved.</p>
          <div class="flex gap-4 text-xs text-[#A1A1AA]">
            <a href="/privacy-policy" data-link class="hover:text-[#D4AF37]">Privacy Policy</a>
            <a href="/terms-of-service" data-link class="hover:text-[#D4AF37]">Terms of Service</a>
            <a href="/refund-policy" data-link class="hover:text-[#D4AF37]">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>`;
  },

  whatsapp() {
    return `<div class="fixed bottom-6 left-6 z-50" data-testid="whatsapp-chat-widget">
      <div id="wa-popup" class="hidden mb-3 w-72 bg-[#111111] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden">
        <div class="bg-green-600 px-5 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3"><div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><i data-lucide="message-circle" class="w-5 h-5 text-white"></i></div><div><p class="text-sm font-bold text-white">OEC Tech Institute</p><p class="text-[10px] text-green-100">Typically replies instantly</p></div></div>
          <button onclick="document.getElementById('wa-popup').classList.add('hidden')" class="text-white/70 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <div class="p-4">
          <div class="bg-[#0A0A0A] rounded-xl p-3 mb-4"><p class="text-sm text-[#A1A1AA]">Hi! Welcome to OEC Tech Institute. How can we help you today?</p></div>
          <a href="https://wa.me/923000517616?text=Hi%20OEC%20Tech%20Institute!" target="_blank" class="block w-full bg-green-600 text-white text-center text-sm font-semibold py-3 rounded-xl hover:bg-green-500">Start Chat</a>
        </div>
      </div>
      <button onclick="document.getElementById('wa-popup').classList.toggle('hidden');initIcons()" data-testid="whatsapp-toggle-btn" class="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-400 transition-colors hover:scale-110">
        <i data-lucide="message-circle" class="w-6 h-6 text-white"></i>
      </button>
    </div>`;
  },

  adminSidebar(activePath) {
    const nav = [
      { to:'/admin', icon:'bar-chart-3', label:'Dashboard' }, { to:'/admin/courses', icon:'book-open', label:'Courses' },
      { to:'/admin/students', icon:'users', label:'Students' }, { to:'/admin/enrollments', icon:'credit-card', label:'Payments' },
      { to:'/admin/admissions', icon:'file-text', label:'Admissions' }, { to:'/admin/diploma-students', icon:'award', label:'Diploma' },
      { to:'/admin/defaulters', icon:'alert-triangle', label:'Defaulters' }, { to:'/admin/assignments', icon:'file-text', label:'Assignments' },
      { to:'/admin/video-testimonials', icon:'video', label:'Videos' }, { to:'/admin/expenses', icon:'credit-card', label:'Expenses' },
    ];
    return `<aside class="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col shrink-0">
      <div class="p-5 border-b border-[#27272A]"><a href="/" data-link class="flex items-center gap-2"><i data-lucide="graduation-cap" class="w-6 h-6 text-[#D4AF37]"></i><span class="text-sm font-bold text-white">OEC <span class="text-[#D4AF37]">Tech</span></span></a></div>
      <nav class="flex-1 p-3 space-y-1">${nav.map(n => `<a href="${n.to}" data-link class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${n.to === activePath ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}"><i data-lucide="${n.icon}" class="w-4 h-4"></i>${n.label}</a>`).join('')}</nav>
      <div class="p-3 border-t border-[#27272A]"><button onclick="Auth.logout()" class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 w-full"><i data-lucide="log-out" class="w-4 h-4"></i>Logout</button></div>
    </aside>`;
  },

  adminMobileNav(activePath) {
    const nav = [
      { to:'/admin', label:'Dashboard' }, { to:'/admin/courses', label:'Courses' }, { to:'/admin/students', label:'Students' },
      { to:'/admin/enrollments', label:'Payments' }, { to:'/admin/admissions', label:'Admissions' }, { to:'/admin/diploma-students', label:'Diploma' },
      { to:'/admin/defaulters', label:'Defaulters' }, { to:'/admin/assignments', label:'Assignments' },
      { to:'/admin/video-testimonials', label:'Videos' }, { to:'/admin/expenses', label:'Expenses' },
    ];
    return `<div class="md:hidden flex items-center justify-between mb-4 overflow-x-auto">
      <div class="flex items-center gap-2 shrink-0"><i data-lucide="graduation-cap" class="w-5 h-5 text-[#D4AF37]"></i><span class="text-sm font-bold text-white">OEC <span class="text-[#D4AF37]">Tech</span></span></div>
      <div class="flex gap-1">${nav.map(n => `<a href="${n.to}" data-link class="p-2 rounded-lg text-[10px] whitespace-nowrap ${n.to === activePath ? 'text-[#D4AF37] bg-white/5' : 'text-[#A1A1AA] hover:bg-white/5'}">${n.label}</a>`).join('')}</div>
    </div>`;
  },

  spinner() { return '<div class="flex justify-center py-20"><div class="spinner"></div></div>'; },
  loading() { return `<div class="min-h-screen bg-[#050505] flex items-center justify-center"><div class="spinner"></div></div>`; }
};
