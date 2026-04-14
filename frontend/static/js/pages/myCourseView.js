// My Course View - Learning page
function renderMyCourseViewPage(params) {
  renderDashboardPage(Components.loading());
  Promise.all([Api.getMyCourses(), Api.getSubmissions(params.enrollmentId).catch(()=>[])]).then(([enrolled, subs]) => {
    const data = enrolled.find(e => e.enrollment.enrollment_id === params.enrollmentId);
    if (!data) { renderDashboardPage('<div class="min-h-screen flex items-center justify-center"><p class="text-[#A1A1AA]">Course not found</p><a href="/dashboard" data-link class="btn-gold px-6 py-3 text-sm ml-4">Dashboard</a></div>'); return; }
    const { enrollment: enr, course } = data;
    const isLocked = enr.payment_status !== 'completed';
    const completed = enr.completed_lessons || [];
    const approvedWeeks = enr.approved_weeks || [];
    let activeWeek = 0, activeLesson = null;
    // Find first unlocked week
    for (let i = 0; i < (course.weeks||[]).length; i++) { if (i === 0 || approvedWeeks.includes(i)) activeWeek = i; else break; }
    if (course.weeks?.[activeWeek]?.lessons?.length > 0) activeLesson = course.weeks[activeWeek].lessons[0];

    function getAssignStatus(wi) {
      const w = course.weeks?.[wi]; if (!w?.assignment) return null;
      const s = subs.find(x => x.assignment_id === w.assignment.assignment_id);
      return s?.status || null;
    }

    function render() {
      const weeklyProg = Math.round((approvedWeeks.length / (course.weeks?.length||1)) * 100);
      renderDashboardPage(`<div data-testid="course-learning-view" class="min-h-screen bg-[#050505] flex flex-col lg:flex-row">
        <aside class="w-full lg:w-80 xl:w-96 bg-[#0A0A0A] border-b lg:border-b-0 lg:border-r border-[#27272A] lg:h-screen lg:overflow-y-auto shrink-0">
          <div class="p-4 border-b border-[#27272A]">
            <a href="/dashboard" data-link class="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-3"><i data-lucide="arrow-left" class="w-4 h-4"></i>Back to Dashboard</a>
            <h2 class="text-base font-bold text-white">${course.title}</h2>
            <div class="mt-3"><div class="flex justify-between text-xs text-[#A1A1AA] mb-1"><span>Progress</span><span>${enr.progress}%</span></div><div class="w-full h-2 bg-[#27272A] rounded-full overflow-hidden"><div class="h-full bg-[#D4AF37] rounded-full" style="width:${enr.progress}%"></div></div></div>
          </div>
          <div class="p-2">
            ${(course.weeks||[]).map((w, wi) => {
              const unlocked = wi === 0 || approvedWeeks.includes(wi);
              const aStatus = getAssignStatus(wi);
              return `<div class="mb-1">
                <button onclick="${unlocked ? `window._setWeek(${wi})` : ''}" ${!unlocked?'disabled':''} class="w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${!unlocked?'opacity-50 cursor-not-allowed':'hover:bg-white/5'}">
                  <div class="flex items-center gap-3">
                    ${!unlocked ? '<i data-lucide="lock" class="w-4 h-4 text-[#71717A]"></i>' : `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${aStatus==='approved'?'bg-green-500 text-white':aStatus==='submitted'?'bg-yellow-500 text-black':w.assignment?.is_final_project?'bg-[#D4AF37] text-black':'bg-[#27272A] text-[#A1A1AA]'}">${w.assignment?.is_final_project?'Final':`W${w.week_number}`}</span>`}
                    <div><span class="text-xs font-medium text-white">${w.title}</span>
                      ${!unlocked?'<p class="text-[8px] text-red-400">Complete previous week first</p>':''}
                      ${aStatus==='submitted'?'<p class="text-[8px] text-yellow-400">Awaiting approval</p>':''}
                      ${aStatus==='approved'?'<p class="text-[8px] text-green-400">Approved</p>':''}
                    </div>
                  </div>
                  ${unlocked?`<i data-lucide="${activeWeek===wi?'chevron-up':'chevron-down'}" class="w-4 h-4 text-[#A1A1AA]"></i>`:''}
                </button>
                ${activeWeek===wi && unlocked ? `<div class="pl-4 pr-2 pb-2 space-y-0.5">
                  ${(w.lessons||[]).map(l => `<button onclick="window._setLesson('${l.lesson_id}',${wi})" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${activeLesson?.lesson_id===l.lesson_id?'bg-[#D4AF37]/10 text-[#D4AF37]':'text-[#A1A1AA] hover:bg-white/5'}">
                    ${isLocked?'<i data-lucide="lock" class="w-3.5 h-3.5 shrink-0"></i>':completed.includes(l.lesson_id)?'<i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-green-400 shrink-0"></i>':'<i data-lucide="circle" class="w-3.5 h-3.5 shrink-0"></i>'}
                    <span class="flex-1 truncate">${l.title}</span><span class="text-[10px] text-[#A1A1AA] shrink-0">${l.duration}</span>
                  </button>`).join('')}
                </div>` : ''}
              </div>`; }).join('')}
          </div>
        </aside>
        <main class="flex-1 p-4 md:p-8 lg:h-screen lg:overflow-y-auto">
          ${isLocked ? `<div class="flex items-center justify-center h-full"><div class="text-center glass-panel rounded-2xl p-12 max-w-md"><i data-lucide="lock" class="w-14 h-14 text-[#D4AF37] mx-auto mb-4"></i><h2 class="text-xl font-bold text-white mb-2">Payment Required</h2><p class="text-sm text-[#A1A1AA] mb-6">Your payment is being processed.</p><a href="/dashboard" data-link class="btn-gold px-6 py-3 text-sm">Back to Dashboard</a></div></div>` :
          activeLesson ? `<div>
            <div class="video-theater mb-6 rounded-2xl border border-[#27272A]">
              ${activeLesson.video_url ? (activeLesson.video_type==='youtube'||activeLesson.video_url.includes('youtube') ? `<iframe src="${activeLesson.video_url}" class="w-full h-full" allowfullscreen></iframe>` : `<video src="${activeLesson.video_url}" controls class="w-full h-full"></video>`) : '<div class="w-full h-full flex items-center justify-center min-h-[300px]"><p class="text-[#A1A1AA]">No video available</p></div>'}
            </div>
            <div class="flex flex-col sm:flex-row items-start justify-between gap-3 mb-6">
              <div><h2 class="text-lg sm:text-xl font-bold text-white mb-1">${activeLesson.title}</h2><p class="text-sm text-[#A1A1AA]">Duration: ${activeLesson.duration}</p></div>
              <button data-testid="mark-complete-btn" onclick="window._toggleComplete('${activeLesson.lesson_id}')" class="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors shrink-0 ${completed.includes(activeLesson.lesson_id)?'bg-green-500/10 text-green-400 border border-green-500/30':'bg-[#111111] text-[#A1A1AA] border border-[#27272A] hover:border-green-500/50'}">
                <i data-lucide="check-circle-2" class="w-4 h-4"></i>${completed.includes(activeLesson.lesson_id)?'Completed':'Mark Complete'}
              </button>
            </div>
          </div>` : '<div class="flex items-center justify-center h-full"><div class="text-center"><i data-lucide="play" class="w-14 h-14 text-[#27272A] mx-auto mb-4"></i><p class="text-[#A1A1AA]">Select a lesson</p></div></div>'}
        </main>
      </div>`);

      window._setWeek = (wi) => { activeWeek = activeWeek === wi ? -1 : wi; if (course.weeks?.[wi]?.lessons?.[0]) activeLesson = course.weeks[wi].lessons[0]; render(); };
      window._setLesson = (lid, wi) => { activeWeek = wi; activeLesson = course.weeks[wi].lessons.find(l => l.lesson_id === lid); render(); };
      window._toggleComplete = async (lid) => {
        try { const res = await Api.updateProgress(params.enrollmentId, { lesson_id: lid, completed: !completed.includes(lid) });
          enr.progress = res.progress; enr.completed_lessons = res.completed_lessons; completed.length = 0; completed.push(...res.completed_lessons);
          showToast(res.completed_lessons.includes(lid) ? 'Lesson completed!' : 'Lesson unmarked'); render();
        } catch { showToast('Failed', 'error'); }
      };
    }
    render();
  }).catch(() => renderDashboardPage('<div class="min-h-screen flex items-center justify-center"><p class="text-[#A1A1AA]">Failed to load course</p></div>'));
}
