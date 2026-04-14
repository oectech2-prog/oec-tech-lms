// Login Page
function renderLoginPage() {
  if (Auth.isLoggedIn()) { Router.navigate('/dashboard'); return; }
  renderDashboardPage(`<div data-testid="login-page" class="min-h-screen bg-[#050505] flex items-center justify-center px-4">
    <div class="glass-panel rounded-2xl p-10 max-w-md w-full text-center">
      <i data-lucide="graduation-cap" class="w-14 h-14 text-[#D4AF37] mx-auto mb-4"></i>
      <h1 class="text-2xl font-bold text-white mb-2">Welcome to OEC Tech Institute</h1>
      <p class="text-sm text-[#A1A1AA] mb-8">Sign in to access your courses, track progress, and manage assignments.</p>
      <button data-testid="google-login-btn" onclick="window.location.href='https://auth.emergentagent.com/?redirect='+encodeURIComponent(window.location.origin+'/dashboard')" class="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
        <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continue with Google
      </button>
      <p class="text-xs text-[#A1A1AA] mt-6">By signing in, you agree to our Terms of Service and Privacy Policy.</p>
    </div>
  </div>`);
}

// About Page
function renderAboutPage() {
  renderPublicPage(`<div data-testid="about-page" class="page-transition min-h-screen bg-[#050505]">
    <section class="pt-12 pb-8 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12">
      <p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">About Us</p>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">OEC Tech Institute</h1>
      <p class="text-base text-[#A1A1AA] max-w-2xl">We are on a mission to empower students across Pakistan, UAE, UK & USA with practical digital skills.</p>
    </div></section>
    <section class="py-16"><div class="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div><h2 class="text-2xl sm:text-3xl font-bold text-white mb-6">Who We Are</h2><p class="text-[#A1A1AA] leading-relaxed mb-4">OEC Tech Institute is a leading online learning platform focused on teaching high-income digital skills. We believe that everyone deserves the opportunity to learn, grow, and earn online.</p><p class="text-[#A1A1AA] leading-relaxed">Our courses are designed by industry professionals and structured in weekly formats with hands-on assignments.</p></div>
      <div><img src="https://images.unsplash.com/photo-1758611974775-39e307bc3da9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBzdHVkZW50JTIwbGFwdG9wJTIwbW9kZXJufGVufDB8fHx8MTc3NTU2MjY1Mnww&ixlib=rb-4.1.0&q=85" alt="Student" loading="lazy" class="w-full rounded-2xl border border-[#27272A]"></div>
    </div></section>
    <section class="py-16 bg-[#0A0A0A]"><div class="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-[#111111] border border-[#27272A] rounded-2xl p-8"><i data-lucide="target" class="w-10 h-10 text-[#D4AF37] mb-4"></i><h3 class="text-xl font-bold text-white mb-4">Our Mission</h3><p class="text-sm text-[#A1A1AA] leading-relaxed">To provide affordable, practical, and results-driven digital education to students worldwide.</p></div>
      <div class="bg-[#111111] border border-[#27272A] rounded-2xl p-8"><i data-lucide="eye" class="w-10 h-10 text-[#D4AF37] mb-4"></i><h3 class="text-xl font-bold text-white mb-4">Our Vision</h3><p class="text-sm text-[#A1A1AA] leading-relaxed">To become the #1 online digital skills academy for students in South Asia and the Middle East.</p></div>
    </div></section>
    <section class="py-16"><div class="max-w-7xl mx-auto px-6 md:px-12"><div class="text-center mb-12"><h2 class="text-2xl sm:text-3xl font-bold text-white">Why Choose Us</h2></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        ${[{i:'book-open',t:'Practical Learning',d:'Every course includes real-world projects.'},{i:'award',t:'Diploma Tracks',d:'Earn recognized diplomas.'},{i:'users',t:'Community Support',d:'Join active WhatsApp groups.'},{i:'zap',t:'Weekly Structure',d:'Organized modules.'},{i:'target',t:'Career Focused',d:'Skills that lead to income.'},{i:'eye',t:'Lifetime Access',d:'Pay once, access forever.'}].map(x=>`<div class="bg-[#111111] border border-[#27272A] rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-colors"><i data-lucide="${x.i}" class="w-8 h-8 text-[#D4AF37] mb-3"></i><h4 class="text-base font-bold text-white mb-2">${x.t}</h4><p class="text-sm text-[#A1A1AA]">${x.d}</p></div>`).join('')}
      </div>
    </div></section>
    <section class="py-24 bg-[#0A0A0A]"><div class="max-w-3xl mx-auto px-6 md:px-12 text-center"><h2 class="text-2xl font-bold text-white mb-4">Start Your Career Today</h2><p class="text-[#A1A1AA] mb-8">Join 2,500+ students already earning online.</p><a href="/courses" data-link class="btn-gold px-6 py-2.5 text-sm">Browse Courses</a></div></section>
  </div>`);
}
