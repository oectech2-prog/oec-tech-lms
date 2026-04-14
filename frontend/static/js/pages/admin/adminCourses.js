// Admin Courses
function renderAdminCoursesPage() {
  let courses = [];
  function render() {
    renderDashboardPage(`<div data-testid="admin-courses-page" class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/courses')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/courses')}
      <div class="flex items-center justify-between mb-6"><h1 class="text-xl font-bold text-white">Courses (${courses.length})</h1><button data-testid="add-course-btn" onclick="showToast('Course creation available via API')" class="btn-gold px-4 py-2 text-xs">Add Course</button></div>
      ${courses.length === 0 ? Components.spinner() : `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${courses.map(c => `<div data-testid="course-card-${c.course_id}" class="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden">
          <div class="h-32 bg-[#0A0A0A] overflow-hidden">${c.image_url ? `<img src="${c.image_url}" alt="" loading="lazy" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center"><i data-lucide="book-open" class="w-8 h-8 text-[#27272A]"></i></div>'}</div>
          <div class="p-4">
            <h3 class="text-sm font-bold text-white mb-1 truncate">${c.title}</h3>
            <p class="text-[10px] text-[#A1A1AA] mb-2">${c.category} | ${c.duration} | ${c.level}</p>
            <div class="flex items-center gap-3 text-[10px] text-[#A1A1AA] mb-3"><span>PKR ${(c.price||0).toLocaleString()}</span><span>${c.enrollment_count||0} enrolled</span></div>
            <div class="flex gap-2">
              <button data-testid="outline-course-${c.course_id}" onclick="window._openOutline('${c.course_id}')" class="flex-1 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20 text-center">Outline</button>
              <button data-testid="delete-course-${c.course_id}" onclick="window._deleteCourse('${c.course_id}','${c.title.replace(/'/g,"\\'")}')" class="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20">Delete</button>
            </div>
          </div>
        </div>`).join('')}</div>`}
    </main></div>`);
  }

  Api.getAdminCourses().then(data => { courses = data; render(); }).catch(() => render());

  window._deleteCourse = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await Api.deleteCourse(id); showToast('Deleted'); courses = courses.filter(c => c.course_id !== id); render(); }
    catch { showToast('Failed', 'error'); }
  };

  window._openOutline = (id) => {
    const course = courses.find(c => c.course_id === id);
    if (!course) return;
    let weeks = JSON.parse(JSON.stringify(course.weeks || []));

    function renderOutline() {
      const modal = document.getElementById('outline-modal');
      if (modal) modal.remove();
      const el = document.createElement('div');
      el.id = 'outline-modal';
      el.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4';
      el.onclick = (e) => { if (e.target === el) el.remove(); };
      el.innerHTML = `<div class="bg-[#111111] border border-[#27272A] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between mb-5"><h3 class="text-lg font-bold text-white">Edit Course Outline</h3><button onclick="document.getElementById('outline-modal').remove()"><i data-lucide="x" class="w-5 h-5 text-[#A1A1AA]"></i></button></div>
        <div class="space-y-4 mb-6" id="outline-weeks">
          ${weeks.map((w, wi) => `<div class="bg-[#0A0A0A] border border-[#27272A] rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3 flex-1">
                <span class="w-8 h-8 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center text-xs font-bold">${w.week_number}</span>
                <input data-testid="week-title-${wi}" value="${w.title}" onchange="window._updateWeekTitle(${wi},this.value)" class="flex-1 bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" placeholder="Week title">
              </div>
              <button onclick="window._removeWeek(${wi})" class="ml-2 p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
            <div class="space-y-2 mb-3">
              <div class="flex items-center justify-between"><span class="text-[10px] font-semibold text-[#A1A1AA] uppercase">Lessons</span><button onclick="window._addLesson(${wi})" class="text-[10px] text-[#D4AF37] hover:underline">+ Add Lesson</button></div>
              ${(w.lessons||[]).map((l, li) => `<div class="bg-[#111111] border border-[#27272A] rounded-lg p-3">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input value="${l.title}" onchange="window._updateLesson(${wi},${li},'title',this.value)" placeholder="Title" class="bg-[#050505] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
                  <input value="${l.video_url||''}" onchange="window._updateLesson(${wi},${li},'video_url',this.value)" placeholder="Video URL" class="bg-[#050505] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
                  <div class="flex gap-2"><input value="${l.duration||''}" onchange="window._updateLesson(${wi},${li},'duration',this.value)" placeholder="Duration" class="bg-[#050505] border border-[#27272A] rounded-lg px-2 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none flex-1"><button onclick="window._removeLesson(${wi},${li})" class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><i data-lucide="trash-2" class="w-3 h-3"></i></button></div>
                </div>
              </div>`).join('')}
            </div>
          </div>`).join('')}
        </div>
        <div class="flex gap-3">
          <button data-testid="add-week-btn" onclick="window._addWeek()" class="btn-gold-outline px-4 py-2 text-xs"><i data-lucide="plus" class="w-4 h-4 inline mr-1"></i>Add Week</button>
          <button data-testid="save-outline-btn" onclick="window._saveOutline('${id}')" class="btn-gold px-6 py-2 text-xs"><i data-lucide="save" class="w-4 h-4 inline mr-1"></i>Save Outline</button>
          <button onclick="document.getElementById('outline-modal').remove()" class="px-4 py-2 text-xs text-[#A1A1AA] hover:text-white">Cancel</button>
        </div>
      </div>`;
      document.body.appendChild(el);
      initIcons();
    }

    window._addWeek = () => { weeks.push({ week_number: weeks.length + 1, title: `Week ${weeks.length+1}`, description: '', lessons: [], assignment: null }); renderOutline(); };
    window._removeWeek = (i) => { weeks.splice(i, 1); weeks.forEach((w, j) => w.week_number = j + 1); renderOutline(); };
    window._updateWeekTitle = (i, v) => { weeks[i].title = v; };
    window._addLesson = (wi) => { const n = (weeks[wi].lessons?.length||0)+1; weeks[wi].lessons = [...(weeks[wi].lessons||[]), { lesson_id: `l_${Date.now()}_${n}`, title: `Lesson ${n}`, video_type: 'youtube', video_url: '', duration: '20 min' }]; renderOutline(); };
    window._removeLesson = (wi, li) => { weeks[wi].lessons.splice(li, 1); renderOutline(); };
    window._updateLesson = (wi, li, field, val) => { weeks[wi].lessons[li][field] = val; };
    window._saveOutline = async (courseId) => {
      try { await Api.updateCourseOutline(courseId, { weeks }); showToast('Outline saved!'); document.getElementById('outline-modal')?.remove(); Api.getAdminCourses().then(data => { courses = data; render(); }); }
      catch { showToast('Failed to save', 'error'); }
    };
    renderOutline();
  };
}
