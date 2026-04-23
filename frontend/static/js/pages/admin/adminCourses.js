// Admin Courses - Full Edit (all fields) + Outline with assignments + file uploads
function renderAdminCoursesPage() {
  let courses = [];
  const CATS = ['Technology','Design','Marketing','E-Commerce','Web Development','Business'];
  const I = "w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none";
  const L = "text-[10px] font-medium text-[#A1A1AA] mb-1 block";

  function render() {
    renderDashboardPage(`<div data-testid="admin-courses-page" class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/courses')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/courses')}
      <div class="flex items-center justify-between mb-6"><h1 class="text-xl font-bold text-white">Courses (${courses.length})</h1></div>
      ${courses.length===0?Components.spinner():`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${courses.map(c=>`<div class="bg-[#111] border border-[#27272A] rounded-xl overflow-hidden">
        <div class="h-32 bg-[#0A0A0A] overflow-hidden">${c.image_url?`<img src="${c.image_url}" alt="" loading="lazy" class="w-full h-full object-cover" onerror="this.style.display='none'">`:'<div class="w-full h-full flex items-center justify-center"><i data-lucide="book-open" class="w-8 h-8 text-[#27272A]"></i></div>'}</div>
        <div class="p-4"><h3 class="text-sm font-bold text-white mb-1 truncate">${c.title}</h3><p class="text-[10px] text-[#A1A1AA] mb-2">${c.category} | ${c.duration} | ${c.level}</p><p class="text-[10px] text-[#A1A1AA] mb-3">PKR ${(c.price||0).toLocaleString()}</p>
          <div class="grid grid-cols-3 gap-1.5">
            <button onclick="window._openEdit('${c.course_id}')" class="px-2 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-[10px] font-medium hover:bg-[#D4AF37]/20 text-center">Edit</button>
            <button onclick="window._openOutline('${c.course_id}')" class="px-2 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-medium hover:bg-blue-500/20 text-center">Outline</button>
            <button onclick="if(confirm('Delete?'))Api.deleteCourse('${c.course_id}').then(()=>{showToast('Deleted');courses=courses.filter(x=>x.course_id!=='${c.course_id}');render()}).catch(()=>showToast('Failed','error'))" class="px-2 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-medium hover:bg-red-500/20 text-center">Delete</button>
          </div></div></div>`).join('')}</div>`}
    </main></div>`);
  }

  Api.getAdminCourses().then(d=>{courses=d;render()}).catch(()=>render());

  // ---- FULL EDIT MODAL ----
  window._openEdit = (id) => {
    const c = courses.find(x=>x.course_id===id); if(!c) return;
    const esc = (s) => (s||'').replace(/"/g,'&quot;').replace(/`/g,'&#96;');
    const arrToText = (a) => (a||[]).join('\n');
    const old = document.getElementById('edit-modal'); if(old) old.remove();
    const el = document.createElement('div'); el.id='edit-modal';
    el.className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4';
    el.onclick=(e)=>{if(e.target===el)el.remove()};
    el.innerHTML=`<div class="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-5"><h3 class="text-base font-bold text-white">Edit Course</h3><button onclick="document.getElementById('edit-modal').remove()"><i data-lucide="x" class="w-5 h-5 text-[#A1A1AA]"></i></button></div>
      <div class="space-y-3">
        <div><label class="${L}">Course Title</label><input id="ed-title" value="${esc(c.title)}" class="${I}"></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="${L}">Category</label><select id="ed-cat" class="${I}">${CATS.map(ct=>`<option value="${ct}" ${c.category===ct?'selected':''}>${ct}</option>`).join('')}</select></div>
          <div class="grid grid-cols-2 gap-2">
            <div><label class="${L}">Price (PKR)</label><input id="ed-price" type="number" value="${c.price||0}" class="${I}"></div>
            <div><label class="${L}">Admission Fee</label><input id="ed-adm" type="number" value="${c.admission_fee||0}" class="${I}"></div>
          </div>
        </div>
        <div><label class="${L}">Short Description</label><input id="ed-short" value="${esc(c.short_description)}" class="${I}" placeholder="One-liner"></div>
        <div><label class="${L}">Full Description</label><textarea id="ed-desc" rows="3" class="${I} resize-none" placeholder="Detailed description">${c.description||''}</textarea></div>
        <div><label class="${L}">Requirements (one per line)</label><textarea id="ed-req" rows="3" class="${I} resize-none" placeholder="Laptop\nInternet Connection">${arrToText(c.requirements)}</textarea></div>
        <div><label class="${L}">What You'll Learn (one per line)</label><textarea id="ed-learn" rows="3" class="${I} resize-none" placeholder="Build websites\nDesign logos">${arrToText(c.what_you_will_learn)}</textarea></div>
        <div class="border-t border-[#27272A] pt-3">
          <label class="${L} text-[#D4AF37]"><i data-lucide="image" class="w-3.5 h-3.5 inline mr-1"></i>Thumbnail URL (Google Drive or Image)</label>
          <input id="ed-thumb" value="${esc(c.image_url)}" placeholder="https://drive.google.com/..." class="${I}">
        </div>
        <div>
          <label class="${L} text-[#D4AF37]"><i data-lucide="youtube" class="w-3.5 h-3.5 inline mr-1"></i>YouTube Intro Video URL</label>
          <input id="ed-video" value="${esc(c.intro_video_url)}" placeholder="https://youtube.com/watch?v=..." class="${I}">
        </div>
      </div>
      <div class="flex gap-3 mt-5"><button onclick="window._saveFullEdit('${id}')" class="btn-gold px-6 py-2 text-xs"><i data-lucide="save" class="w-4 h-4 inline mr-1"></i>Save</button><button onclick="document.getElementById('edit-modal').remove()" class="px-4 py-2 text-xs text-[#A1A1AA]">Cancel</button></div>
    </div>`;
    document.body.appendChild(el); initIcons();
  };

  window._saveFullEdit = async (courseId) => {
    const g = (id) => document.getElementById(id)?.value?.trim() || '';
    const textToArr = (id) => g(id).split('\n').map(s=>s.trim()).filter(Boolean);
    let img = g('ed-thumb');
    if(img.includes('drive.google.com/file/d/')){const fid=img.match(/\/d\/([^/]+)/)?.[1];if(fid)img=`https://drive.google.com/uc?export=view&id=${fid}`;}
    let vid = g('ed-video');
    if(vid.includes('youtube.com/watch?v=')){const v=vid.match(/[?&]v=([^&]+)/)?.[1];if(v)vid=`https://www.youtube.com/embed/${v}`;}
    else if(vid.includes('youtu.be/')){const v=vid.match(/youtu\.be\/([^?]+)/)?.[1];if(v)vid=`https://www.youtube.com/embed/${v}`;}
    try{
      await Api.patchCourse(courseId,{title:g('ed-title'),category:g('ed-cat'),short_description:g('ed-short'),description:g('ed-desc'),requirements:textToArr('ed-req'),what_you_will_learn:textToArr('ed-learn'),price:parseFloat(g('ed-price'))||0,admission_fee:parseFloat(g('ed-adm'))||0,image_url:img,intro_video_url:vid});
      showToast('Course updated!');document.getElementById('edit-modal')?.remove();Api.getAdminCourses().then(d=>{courses=d;render()});
    }catch(e){showToast(e.detail||'Failed','error');}
  };

  // ---- OUTLINE with ASSIGNMENTS ----
  window._openOutline = (id) => {
    const course = courses.find(c=>c.course_id===id); if(!course) return;
    let weeks = JSON.parse(JSON.stringify(course.weeks||[]));

    function renderOutline() {
      const old=document.getElementById('outline-modal');if(old)old.remove();
      const el=document.createElement('div');el.id='outline-modal';
      el.className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4';
      el.onclick=(e)=>{if(e.target===el)el.remove()};
      el.innerHTML=`<div class="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between mb-5"><h3 class="text-lg font-bold text-white">Edit Course Outline</h3><button onclick="document.getElementById('outline-modal').remove()"><i data-lucide="x" class="w-5 h-5 text-[#A1A1AA]"></i></button></div>
        <div class="space-y-4 mb-6">${weeks.map((w,wi)=>`<div class="bg-[#0A0A0A] border border-[#27272A] rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3 flex-1"><span class="w-8 h-8 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center text-xs font-bold">${w.week_number}</span>
              <input value="${w.title}" onchange="window._updateWeekTitle(${wi},this.value)" class="flex-1 bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" placeholder="Week title"></div>
            <button onclick="window._removeWeek(${wi})" class="ml-2 p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          </div>
          <!-- Lessons -->
          <div class="space-y-2 mb-3">
            <div class="flex items-center justify-between"><span class="text-[10px] font-semibold text-[#A1A1AA] uppercase">Lessons</span><button onclick="window._addLesson(${wi})" class="text-[10px] text-[#D4AF37] hover:underline">+ Add Lesson</button></div>
            ${(w.lessons||[]).map((l,li)=>`<div class="bg-[#111] border border-[#27272A] rounded-lg p-3"><div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input value="${l.title}" onchange="window._updateLesson(${wi},${li},'title',this.value)" placeholder="Title" class="bg-[#050505] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
              <input value="${l.video_url||''}" onchange="window._updateLesson(${wi},${li},'video_url',this.value)" placeholder="Video URL" class="bg-[#050505] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
              <div class="flex gap-2"><input value="${l.duration||''}" onchange="window._updateLesson(${wi},${li},'duration',this.value)" placeholder="Duration" class="bg-[#050505] border border-[#27272A] rounded-lg px-2 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none flex-1"><button onclick="window._removeLesson(${wi},${li})" class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><i data-lucide="trash-2" class="w-3 h-3"></i></button></div>
            </div></div>`).join('')}
          </div>
          <!-- Assignment -->
          <div class="border-t border-[#27272A] pt-3">
            <div class="flex items-center justify-between mb-2"><span class="text-[10px] font-semibold text-[#A1A1AA] uppercase">Assignment</span>
              <button onclick="window._toggleAssignment(${wi})" class="text-[10px] ${w.assignment?'text-red-400':'text-green-400'} hover:underline">${w.assignment?'Remove Assignment':'+ Add Assignment'}</button></div>
            ${w.assignment?`<div class="space-y-2">
              <input value="${w.assignment.title||''}" onchange="window._updateAssignment(${wi},'title',this.value)" placeholder="Assignment title" class="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
              <textarea onchange="window._updateAssignment(${wi},'description',this.value)" placeholder="Instructions for students" rows="2" class="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none">${w.assignment.description||''}</textarea>
              <input value="${w.assignment.file_url||''}" onchange="window._updateAssignment(${wi},'file_url',this.value)" placeholder="Assignment file URL (PDF, Word, Excel, Image)" class="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
              <p class="text-[9px] text-[#71717A]">Upload file link (Google Drive, Dropbox, etc.) - students can download this</p>
              <label class="flex items-center gap-2 text-xs text-[#A1A1AA]"><input type="checkbox" ${w.assignment.is_final_project?'checked':''} onchange="window._updateAssignment(${wi},'is_final_project',this.checked)" class="accent-[#D4AF37]">Final Project</label>
            </div>`:''}
          </div>
        </div>`).join('')}</div>
        <div class="flex gap-3">
          <button onclick="window._addWeek()" class="btn-gold-outline px-4 py-2 text-xs"><i data-lucide="plus" class="w-4 h-4 inline mr-1"></i>Add Week</button>
          <button onclick="window._saveOutline('${id}')" class="btn-gold px-6 py-2 text-xs"><i data-lucide="save" class="w-4 h-4 inline mr-1"></i>Save</button>
          <button onclick="document.getElementById('outline-modal').remove()" class="px-4 py-2 text-xs text-[#A1A1AA]">Cancel</button>
        </div>
      </div>`;
      document.body.appendChild(el);initIcons();
    }

    window._addWeek=()=>{weeks.push({week_number:weeks.length+1,title:`Week ${weeks.length+1}`,description:'',lessons:[],assignment:null});renderOutline()};
    window._removeWeek=(i)=>{weeks.splice(i,1);weeks.forEach((w,j)=>w.week_number=j+1);renderOutline()};
    window._updateWeekTitle=(i,v)=>{weeks[i].title=v};
    window._addLesson=(wi)=>{weeks[wi].lessons=[...(weeks[wi].lessons||[]),{lesson_id:`l_${Date.now()}`,title:`Lesson ${(weeks[wi].lessons?.length||0)+1}`,video_type:'youtube',video_url:'',duration:'20 min'}];renderOutline()};
    window._removeLesson=(wi,li)=>{weeks[wi].lessons.splice(li,1);renderOutline()};
    window._updateLesson=(wi,li,f,v)=>{weeks[wi].lessons[li][f]=v};
    window._toggleAssignment=(wi)=>{weeks[wi].assignment=weeks[wi].assignment?null:{title:'',description:'',file_url:'',is_final_project:false,assignment_id:`a_${Date.now()}`};renderOutline()};
    window._updateAssignment=(wi,f,v)=>{if(weeks[wi].assignment)weeks[wi].assignment[f]=v};
    window._saveOutline=async(courseId)=>{
      try{await Api.updateCourseOutline(courseId,{weeks});showToast('Outline saved!');document.getElementById('outline-modal')?.remove();Api.getAdminCourses().then(d=>{courses=d;render()});}
      catch{showToast('Failed','error');}
    };
    renderOutline();
  };
}
