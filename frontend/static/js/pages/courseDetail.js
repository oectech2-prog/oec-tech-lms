import { api } from '../api.js';
import { auth } from '../auth.js';

export async function courseDetailPage({ courseId }) {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="min-h-screen bg-[#050505] flex items-center justify-center"><div class="spinner"></div></div>';
  let course;
  try { course = await api.getCourse(courseId); } catch { app.innerHTML = '<div class="min-h-screen bg-[#050505] flex items-center justify-center"><div class="text-center"><h2 class="text-2xl font-bold text-white mb-4">Course Not Found</h2><a href="/courses" data-link class="btn-gold px-6 py-3 text-sm">Browse Courses</a></div></div>'; return; }

  const totalLessons = course.weeks?.reduce((a, w) => a + (w.lessons?.length || 0), 0) || 0;
  const totalAssignments = course.weeks?.filter(w => w.assignment).length || 0;
  const enrollUrl = auth.user ? `/checkout/${course.course_id}` : '/login';

  app.innerHTML = `<div data-testid="course-detail-page" class="page-transition min-h-screen bg-[#050505]">
    <section class="pt-8 pb-12 border-b border-[#27272A]"><div class="max-w-7xl mx-auto px-6 md:px-12"><div class="grid grid-cols-1 lg:grid-cols-5 gap-10">
      <div class="lg:col-span-3">
        <p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">${course.category}</p>
        <h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">${course.title}</h1>
        <p class="text-base text-[#A1A1AA] leading-relaxed mb-6">${course.description}</p>
        <div class="flex flex-wrap gap-4 mb-6">
          ${[{i:'clock',t:course.duration},{i:'award',t:course.level},{i:'book-open',t:`${totalLessons} Lessons`},{i:'file-text',t:`${totalAssignments} Assignments`},{i:'user',t:course.instructor}].map(x=>`<div class="flex items-center gap-2 text-sm text-[#A1A1AA] bg-[#111] px-4 py-2 rounded-full border border-[#27272A]"><i data-lucide="${x.i}" class="w-4 h-4 text-[#D4AF37]"></i>${x.t}</div>`).join('')}
        </div>
        <div class="flex items-center gap-4 flex-wrap"><div><span class="text-3xl font-bold text-[#D4AF37]">PKR ${course.price?.toLocaleString()}</span>${course.admission_fee>0?`<span class="text-xs text-[#A1A1AA] block mt-1">+ PKR ${course.admission_fee?.toLocaleString()} admission</span>`:''}</div><a href="${enrollUrl}" data-link data-testid="enroll-course-btn" class="btn-gold px-6 py-2.5 text-sm">Enroll Now</a></div>
      </div>
      <div class="lg:col-span-2">${course.intro_video_url?`<div class="rounded-2xl overflow-hidden border border-[#27272A]"><iframe src="${course.intro_video_url}" title="Preview" class="w-full aspect-video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`:`<div class="aspect-video bg-[#111] rounded-2xl border border-[#27272A] flex items-center justify-center"><div class="text-center"><i data-lucide="play" class="w-12 h-12 text-[#D4AF37] mx-auto mb-2"></i><p class="text-sm text-[#A1A1AA]">Preview Coming Soon</p></div></div>`}</div>
    </div></div></section>
    <section class="py-16"><div class="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div class="bg-[#111] border border-[#27272A] rounded-2xl p-8"><h3 class="text-xl font-bold text-white mb-6">Requirements</h3><ul class="space-y-3">${(course.requirements||[]).map(r=>`<li class="flex items-start gap-3 text-sm text-[#A1A1AA]"><i data-lucide="check-circle-2" class="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5"></i>${r}</li>`).join('')}</ul></div>
      <div class="bg-[#111] border border-[#27272A] rounded-2xl p-8"><h3 class="text-xl font-bold text-white mb-6">What You Will Learn</h3><ul class="space-y-3">${(course.what_you_will_learn||[]).map(r=>`<li class="flex items-start gap-3 text-sm text-[#A1A1AA]"><i data-lucide="check-circle-2" class="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5"></i>${r}</li>`).join('')}</ul></div>
    </div></section>
    <section data-testid="weekly-outline" class="py-16 bg-[#0A0A0A]"><div class="max-w-4xl mx-auto px-6 md:px-12">
      <div class="text-center mb-12"><p class="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Course Content</p><h2 class="text-2xl sm:text-3xl font-bold text-white">Weekly Course Outline</h2></div>
      <div class="space-y-4 week-timeline pl-4">${(course.weeks||[]).map((w,i)=>`
        <div class="relative">
          <div class="absolute -left-4 top-5 w-[10px] h-[10px] rounded-full z-10 ${w.assignment?.is_final_project?'bg-[#FBBF24] animate-pulse-gold':'bg-[#D4AF37]'}"></div>
          <div class="ml-4 bg-[#111] border border-[#27272A] rounded-xl overflow-hidden">
            <button data-week="${i}" class="week-toggle w-full flex items-center justify-between px-6 py-5 hover:bg-white/5 transition-colors">
              <div class="flex items-center gap-4"><span class="text-xs font-bold px-3 py-1 rounded-full ${w.assignment?.is_final_project?'bg-[#D4AF37] text-black':'bg-[#D4AF37]/10 text-[#D4AF37]'}">${w.assignment?.is_final_project?'Final':`Week ${w.week_number}`}</span><div class="text-left"><h4 class="text-sm font-bold text-white">${w.title}</h4><p class="text-xs text-[#A1A1AA]">${w.lessons?.length||0} lessons${w.assignment?' + 1 assignment':''}</p></div></div>
              <i data-lucide="chevron-down" class="w-5 h-5 text-[#A1A1AA] transition-transform"></i>
            </button>
            <div class="week-content hidden px-6 pb-5 space-y-2">
              ${w.description?`<p class="text-xs text-[#A1A1AA] mb-3">${w.description}</p>`:''}
              ${(w.lessons||[]).map(l=>`<div class="flex items-center gap-3 py-2 px-4 bg-[#0A0A0A] rounded-lg"><i data-lucide="lock" class="w-4 h-4 text-[#A1A1AA]"></i><div class="flex-1"><p class="text-sm text-[#A1A1AA]">${l.title}</p></div><span class="text-xs text-[#A1A1AA]">${l.duration}</span></div>`).join('')}
              ${w.assignment?`<div class="flex items-center gap-3 py-2 px-4 rounded-lg ${w.assignment.is_final_project?'bg-[#D4AF37]/10 border border-[#D4AF37]/30':'bg-[#0A0A0A]'}"><i data-lucide="file-text" class="w-4 h-4 ${w.assignment.is_final_project?'text-[#D4AF37]':'text-[#A1A1AA]'}"></i><div class="flex-1"><p class="text-sm font-medium ${w.assignment.is_final_project?'text-[#D4AF37]':'text-[#A1A1AA]'}">${w.assignment.title}</p><p class="text-xs text-[#A1A1AA] mt-1">${w.assignment.description}</p></div></div>`:''}
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div></section>
    <section class="py-24 bg-[#050505]"><div class="max-w-3xl mx-auto px-6 md:px-12 text-center"><h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2><p class="text-base text-[#A1A1AA] mb-8">Enroll now and get lifetime access.</p><a href="${enrollUrl}" data-link data-testid="enroll-bottom-btn" class="btn-gold px-6 py-2.5 text-sm">Enroll for PKR ${course.price?.toLocaleString()}</a></div></section>
  </div>`;

  // Week toggle
  document.querySelectorAll('.week-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('i[data-lucide="chevron-down"]');
      content.classList.toggle('hidden');
      if (icon) icon.classList.toggle('rotate-180');
    });
  });
  // Open first week
  const firstToggle = document.querySelector('.week-toggle');
  if (firstToggle) firstToggle.click();

  if (window.lucide) lucide.createIcons();
}
