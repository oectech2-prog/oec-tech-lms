import { api } from '../api.js';
import { auth } from '../auth.js';
import { navigate } from '../router.js';

export async function profilePage() {
  const u = auth.user;
  document.getElementById('app').innerHTML = `<div class="min-h-screen bg-[#050505] flex items-center justify-center px-4">
    <div class="glass-panel rounded-2xl p-8 max-w-md w-full">
      <div class="flex items-center justify-between mb-6"><h2 class="text-xl font-bold text-white">Profile</h2><a href="/dashboard" data-link class="text-sm text-[#D4AF37] hover:underline">Back</a></div>
      <div class="flex flex-col items-center mb-6">
        ${u?.picture?`<img src="${u.picture}" alt="" class="w-20 h-20 rounded-full border-2 border-[#D4AF37] object-cover mb-3">`:`<div class="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-2xl font-bold mb-3">${u?.name?.charAt(0)||'?'}</div>`}
        <p class="text-xs text-[#A1A1AA]">${u?.email||''}</p>
      </div>
      <form id="profile-form" class="space-y-4">
        <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Name</label><input name="name" value="${u?.name||''}" class="input-dark"></div>
        <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Profile Picture</label>
          <label class="flex items-center justify-center py-4 border-2 border-dashed border-[#27272A] rounded-lg cursor-pointer hover:border-[#D4AF37]/40 transition-colors"><span class="text-xs text-[#71717A]">Click to upload</span><input type="file" accept="image/*" id="pic-input" class="hidden"></label>
          <div id="pic-preview" class="mt-2 hidden"><img id="pic-img" class="w-20 h-20 rounded-full object-cover border border-[#D4AF37]"></div>
        </div>
        <button type="submit" class="btn-gold w-full py-3 text-sm">Save Changes</button>
      </form>
    </div>
  </div>`;

  let picFile = null;
  document.getElementById('pic-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { window.toast('Max 5MB','error'); return; }
    picFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => { document.getElementById('pic-img').src = ev.target.result; document.getElementById('pic-preview').classList.remove('hidden'); };
    reader.readAsDataURL(file);
  });

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = new FormData(e.target).get('name');
    try {
      let pictureUrl = u?.picture || null;
      if (picFile) { const res = await api.uploadFile(picFile); pictureUrl = `/api/files/${res.path}`; }
      await api.updateProfile({ name, picture: pictureUrl });
      await auth.refresh();
      window.toast('Profile updated!');
      navigate('/dashboard');
    } catch (err) { window.toast(err.message, 'error'); }
  });
}
