import { api } from '../api.js';
import { auth } from '../auth.js';
import { navigate } from '../router.js';

export async function dashboardPage() {
  const u = auth.user;
  const app = document.getElementById('app');
  app.innerHTML = `<div data-testid="student-dashboard" class="min-h-screen bg-[#050505] flex">
    <aside class="w-64 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
      <div class="p-6 border-b border-[#27272A]"><a href="/" data-link class="flex items-center gap-2"><i data-lucide="graduation-cap" class="w-7 h-7 text-[#D4AF37]"></i><span class="text-sm font-bold text-white">OEC <span class="text-[#D4AF37]">Tech</span></span></a></div>
      <nav class="flex-1 p-4 space-y-1">
        <a href="/dashboard" data-link class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-[#D4AF37]/10 text-[#D4AF37]"><i data-lucide="bar-chart-3" class="w-5 h-5"></i>Dashboard</a>
        <a href="/profile" data-link class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-white/5"><i data-lucide="user" class="w-5 h-5"></i>Profile</a>
        <a href="/" data-link class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-white/5"><i data-lucide="home" class="w-5 h-5"></i>Home</a>
        ${u?.role==='admin'?'<a href="/admin" data-link class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10"><i data-lucide="shield" class="w-5 h-5"></i>Admin Panel</a>':''}
      </nav>
      <div class="p-4 border-t border-[#27272A]"><button id="dash-logout" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full"><i data-lucide="log-out" class="w-5 h-5"></i>Logout</button></div>
    </aside>
    <main class="flex-1 p-6 md:p-10 overflow-auto">
      <div class="md:hidden flex items-center justify-between mb-6"><a href="/" data-link class="flex items-center gap-2"><i data-lucide="graduation-cap" class="w-6 h-6 text-[#D4AF37]"></i><span class="text-sm font-bold text-white">OEC Tech</span></a><div class="flex gap-2"><a href="/profile" data-link class="p-2 text-[#A1A1AA] hover:bg-white/5 rounded-lg"><i data-lucide="user" class="w-5 h-5"></i></a><button id="dash-mobile-logout" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><i data-lucide="log-out" class="w-5 h-5"></i></button></div></div>
      <div class="mb-10"><h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, ${u?.name?.split(' ')[0]||'Student'}</h1><p class="text-sm text-[#A1A1AA]">Continue your learning journey.</p></div>
      <div id="notif-area"></div>
      <div id="dash-stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"></div>
      <div id="dash-content"><div class="flex justify-center py-20"><div class="spinner"></div></div></div>
    </main>
  </div>`;

  const logoutFn = async () => { await auth.logout(); navigate('/'); };
  document.getElementById('dash-logout')?.addEventListener('click', logoutFn);
  document.getElementById('dash-mobile-logout')?.addEventListener('click', logoutFn);

  try {
    const [enrolled, notifs] = await Promise.all([api.getMyCourses(), api.getNotifications().catch(()=>[])]);
    const active = enrolled.filter(e => e.enrollment.payment_status === 'completed');
    const pending = enrolled.filter(e => e.enrollment.payment_status === 'pending');

    // Notifications
    const dueNotifs = (notifs||[]).filter(n => n.type === 'installment_2_due');
    if (dueNotifs.length) {
      document.getElementById('notif-area').innerHTML = dueNotifs.map(n => `<div class="bg-[#111] border border-[#D4AF37]/40 rounded-xl p-4 flex items-center justify-between mb-3"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center shrink-0"><i data-lucide="bell" class="w-5 h-5 text-[#D4AF37]"></i></div><div><p class="text-sm font-bold text-white">2nd Installment Due - ${n.course_title}</p><p class="text-xs text-[#A1A1AA]">PKR ${n.amount?.toLocaleString()}</p></div></div></div>`).join('');
    }

    // Stats
    document.getElementById('dash-stats').innerHTML = [
      {l:'Active Courses',v:active.length,i:'book-open'},{l:'Pending',v:pending.length,i:'clock'},
      {l:'Completed',v:active.filter(c=>c.enrollment.progress===100).length,i:'check-circle-2'},{l:'Total',v:enrolled.length,i:'bar-chart-3'}
    ].map(s=>`<div class="bg-[#111] border border-[#27272A] rounded-xl p-5"><i data-lucide="${s.i}" class="w-5 h-5 text-[#D4AF37] mb-2"></i><p class="text-2xl font-bold text-white">${s.v}</p><p class="text-xs text-[#A1A1AA]">${s.l}</p></div>`).join('');

    let content = '';
    if (active.length) {
      content += `<div class="mb-10"><h2 class="text-xl font-bold text-white mb-6">My Courses</h2><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${active.map(({enrollment:e,course:c})=>`<a href="/my-course/${e.enrollment_id}" data-link data-testid="enrolled-course-${e.enrollment_id}" class="bg-[#111] border border-[#27272A] rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all group"><div class="aspect-[3/2] overflow-hidden bg-[#1A1A1A]"><img src="${c.image_url}" alt="${c.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></div><div class="p-5"><h3 class="text-base font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">${c.title}</h3><div class="mb-3"><div class="flex justify-between text-xs text-[#A1A1AA] mb-1"><span>Progress</span><span>${e.progress}%</span></div><div class="progress-bar"><div class="progress-bar-fill" style="width:${e.progress}%"></div></div></div><span class="text-xs text-[#D4AF37] flex items-center gap-1">Continue Learning <i data-lucide="arrow-right" class="w-3 h-3"></i></span>${e.progress===100?`<a href="/certificate/${e.enrollment_id}" data-link onclick="event.stopPropagation()" class="mt-2 text-xs text-green-400 flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-full hover:bg-green-500/20 inline-flex"><i data-lucide="award" class="w-3 h-3"></i>Certificate</a>`:''}</div></a>`).join('')}</div></div>`;
    }
    if (pending.length) {
      content += `<div class="mb-10"><h2 class="text-xl font-bold text-white mb-6">Pending Payment</h2><div class="space-y-4">${pending.map(({enrollment:e,course:c})=>`<div class="bg-[#111] border border-yellow-600/30 rounded-xl p-5 flex items-center justify-between"><div class="flex items-center gap-4"><i data-lucide="alert-circle" class="w-5 h-5 text-yellow-500"></i><div><h3 class="text-sm font-bold text-white">${c.title}</h3><p class="text-xs text-[#A1A1AA]">Awaiting confirmation</p></div></div><span class="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">Pending</span></div>`).join('')}</div></div>`;
    }
    if (!enrolled.length) {
      content = `<div class="text-center py-20"><i data-lucide="book-open" class="w-16 h-16 text-[#27272A] mx-auto mb-4"></i><h3 class="text-lg font-bold text-white mb-2">No Courses Yet</h3><p class="text-sm text-[#A1A1AA] mb-6">Start your learning journey.</p><a href="/courses" data-link class="btn-gold px-6 py-3 text-sm">Browse Courses</a></div>`;
    }
    document.getElementById('dash-content').innerHTML = content;
  } catch (e) { document.getElementById('dash-content').innerHTML = `<p class="text-center text-red-400 py-10">${e.message}</p>`; }
  if (window.lucide) lucide.createIcons();
}
