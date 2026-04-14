import { api } from '../api.js';
import { navigate } from '../router.js';

const METHODS = [
  { id:'jazzcash', name:'JazzCash', color:'text-red-400', bg:'bg-red-500/10', border:'border-red-500/30', account:'JazzCash Account: 983012259\nAccount Title: OEC Tech Institute' },
  { id:'easypaisa', name:'EasyPaisa', color:'text-green-400', bg:'bg-green-500/10', border:'border-green-500/30', account:'EasyPaisa Account: 0300-1413747\nAccount Title: Sadam Mubarak' },
  { id:'bank_transfer', name:'Bank Transfer', color:'text-blue-400', bg:'bg-blue-500/10', border:'border-blue-500/30', account:'Soneri Bank: 20016289664\nAccount Title: Sadam Mubarak' },
];

export async function trackCheckoutPage({ trackId }) {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="min-h-screen bg-[#050505] flex items-center justify-center"><div class="spinner"></div></div>';
  let track, courses = [];
  try {
    track = await api.getDiplomaTrack(trackId);
    const all = await api.getCourses();
    courses = (track.courses||[]).map(id => all.find(c=>c.course_id===id)).filter(Boolean);
  } catch { app.innerHTML='<div class="min-h-screen bg-[#050505] flex items-center justify-center"><p class="text-red-400">Track not found</p></div>'; return; }

  const totalFee = courses.reduce((s,c)=>s+(c.price||0),0);
  const totalAdm = courses.reduce((s,c)=>s+(c.admission_fee||0),0);
  const inst1 = Math.floor(totalFee/2), inst2 = totalFee-inst1, payNow = totalAdm+inst1;
  let step=1, form={}, docs={}, docPreviews={}, method=null, admFee=null, admPrev=null, instFee=null, instPrev=null, enrolling=false;

  function render() {
    app.innerHTML = `<div data-testid="track-checkout-page" class="min-h-screen bg-[#050505] py-8 px-4"><div class="max-w-5xl mx-auto">
      <a href="/diploma-tracks" data-link class="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-6"><i data-lucide="arrow-left" class="w-4 h-4"></i>Back</a>
      <h1 class="text-xl font-bold text-white mb-1">Diploma Enrollment: ${track.title}</h1><p class="text-xs text-[#A1A1AA] mb-6">${courses.length} courses included</p>
      <div class="flex items-center gap-2 mb-8">${[{n:1,l:'Form'},{n:2,l:'Docs'},{n:3,l:'Payment'},{n:4,l:'Confirm'}].map(s=>`<div class="flex items-center gap-1.5"><div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${step>=s.n?'bg-[#D4AF37] text-black':'bg-[#27272A] text-[#A1A1AA]'}">${step>s.n?'&#10003;':s.n}</div><span class="text-[10px] font-medium hidden sm:inline ${step>=s.n?'text-white':'text-[#A1A1AA]'}">${s.l}</span>${s.n<4?`<div class="w-6 sm:w-10 h-[2px] ${step>s.n?'bg-[#D4AF37]':'bg-[#27272A]'}"></div>`:''}</div>`).join('')}</div>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6"><div class="lg:col-span-3" id="step-area"></div>
        <div class="lg:col-span-2"><div class="bg-[#111] border border-[#27272A] rounded-xl p-5 sticky top-6"><h3 class="text-base font-bold text-white mb-4">Diploma Summary</h3><div class="space-y-2 text-xs mb-3">${courses.map(c=>`<div class="flex justify-between text-[#A1A1AA]"><span>${c.title}</span><span class="text-white">PKR ${c.price?.toLocaleString()}</span></div>`).join('')}</div><div class="border-t border-[#27272A] pt-3 space-y-1"><div class="flex justify-between text-xs"><span class="text-[#A1A1AA]">Total Fee</span><span class="text-white">PKR ${totalFee.toLocaleString()}</span></div>${totalAdm>0?`<div class="flex justify-between text-xs"><span class="text-[#A1A1AA]">Admission</span><span class="text-white">PKR ${totalAdm.toLocaleString()}</span></div>`:''}<div class="flex justify-between text-xs mt-2"><span class="text-[#D4AF37] font-bold">Pay Now</span><span class="text-[#D4AF37] font-bold">PKR ${payNow.toLocaleString()}</span></div></div></div></div>
      </div>
    </div></div>`;
    // Reuse the exact same step logic as checkout but for diploma
    const area = document.getElementById('step-area');
    if(step===1){ area.innerHTML=`<div class="bg-[#111] border border-[#27272A] rounded-xl p-5 space-y-4"><h3 class="text-base font-bold text-white mb-2">Student Information</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${[{k:'full_name',l:'Full Name *'},{k:'phone',l:'Phone *'},{k:'date_of_birth',l:'DOB *',t:'date'},{k:'qualification',l:'Qualification'},{k:'father_name',l:'Father Name *'},{k:'father_phone',l:'Father Phone *'},{k:'city',l:'City *'},{k:'father_cnic',l:'Father CNIC'}].map(f=>`<div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">${f.l}</label><input name="${f.k}" value="${form[f.k]||''}" type="${f.t||'text'}" class="input-dark"></div>`).join('')}</div><div class="grid grid-cols-2 gap-3">${[{k:'gender',o:['Male','Female']},{k:'session_type',o:['Morning','Evening']},{k:'learning_type',o:['Online','On-Site']}].map(f=>`<div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">${f.k.replace(/_/g,' ')} *</label><select name="${f.k}" class="select-dark"><option value="">Select</option>${f.o.map(o=>`<option ${form[f.k]===o?'selected':''}>${o}</option>`).join('')}</select></div>`).join('')}</div><button id="s1n" class="btn-gold w-full py-3 text-sm mt-2">Continue</button></div>`; }
    else if(step===2){ area.innerHTML=`<div class="bg-[#111] border border-[#27272A] rounded-xl p-5 space-y-4"><h3 class="text-base font-bold text-white mb-2">Documents</h3><div class="grid grid-cols-2 gap-3">${['id_front','id_back','degree','bform'].map(k=>`<div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">${k==='id_front'?'ID Front':k==='id_back'?'ID Back':k==='degree'?'Degree':'B-Form'}</label>${docPreviews[k]?`<div class="relative h-28 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#27272A]"><img src="${docPreviews[k]}" class="w-full h-full object-contain"><button data-rd="${k}" class="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 text-xs">X</button></div>`:`<label class="flex flex-col items-center justify-center h-28 border-2 border-dashed border-[#27272A] rounded-lg cursor-pointer hover:border-[#D4AF37]/40"><span class="text-[10px] text-[#71717A]">Upload</span><input type="file" accept="image/*,.pdf" data-doc="${k}" class="hidden"></label>`}</div>`).join('')}</div><div class="flex gap-3"><button id="s2b" class="btn-gold-outline flex-1 py-3 text-sm">Back</button><button id="s2n" class="btn-gold flex-1 py-3 text-sm">Continue</button></div></div>`; }
    else if(step===3){ area.innerHTML=`<div class="bg-[#111] border border-[#27272A] rounded-xl p-5 space-y-4"><h3 class="text-base font-bold text-white mb-2">Payment</h3><div class="grid grid-cols-3 gap-3">${METHODS.map(m=>`<button data-pm="${m.id}" class="p-3 rounded-xl border-2 ${method===m.id?m.border+' '+m.bg:'border-[#27272A]'}"><span class="text-xs font-bold ${m.color}">${m.name}</span></button>`).join('')}</div>${method?`<pre class="text-[10px] text-[#A1A1AA] bg-[#050505] p-3 rounded-lg">${METHODS.find(m=>m.id===method)?.account||''}</pre>`:''}<p class="text-[10px] text-[#A1A1AA] font-semibold">Admission Fee Screenshot (PKR ${totalAdm.toLocaleString()})</p>${admPrev?`<div class="relative h-28 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#27272A]"><img src="${admPrev}" class="w-full h-full object-contain"><button id="ra" class="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 text-xs">X</button></div>`:`<label class="flex items-center justify-center h-28 border-2 border-dashed border-[#27272A] rounded-lg cursor-pointer hover:border-[#D4AF37]/40"><span class="text-[10px] text-[#71717A]">Upload</span><input type="file" accept="image/*" id="af" class="hidden"></label>`}<p class="text-[10px] text-[#A1A1AA] font-semibold">1st Installment Screenshot (PKR ${inst1.toLocaleString()})</p>${instPrev?`<div class="relative h-28 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#27272A]"><img src="${instPrev}" class="w-full h-full object-contain"><button id="ri" class="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 text-xs">X</button></div>`:`<label class="flex items-center justify-center h-28 border-2 border-dashed border-[#27272A] rounded-lg cursor-pointer hover:border-[#D4AF37]/40"><span class="text-[10px] text-[#71717A]">Upload</span><input type="file" accept="image/*" id="if" class="hidden"></label>`}<div class="flex gap-3"><button id="s3b" class="btn-gold-outline flex-1 py-3 text-sm">Back</button><button id="s3n" class="btn-gold flex-1 py-3 text-sm">Review</button></div></div>`; }
    else { area.innerHTML=`<div class="bg-[#111] border border-[#27272A] rounded-xl p-5 space-y-4"><h3 class="text-base font-bold text-white mb-2">Confirm</h3><div class="grid grid-cols-2 gap-2 text-xs">${Object.entries(form).filter(([,v])=>v).map(([k,v])=>`<div><span class="text-[10px] text-[#71717A]">${k.replace(/_/g,' ')}</span><p class="text-white">${v}</p></div>`).join('')}</div><div class="flex gap-3"><button id="s4b" class="btn-gold-outline flex-1 py-3 text-sm">Back</button><button id="subm" class="btn-gold flex-1 py-3 text-sm" ${enrolling?'disabled':''}>${enrolling?'Submitting...':'Submit'}</button></div></div>`; }
    bindEv();
    if(window.lucide)lucide.createIcons();
  }

  function bindEv() {
    document.getElementById('s1n')?.addEventListener('click', ()=>{document.querySelectorAll('[name]').forEach(i=>{form[i.name]=i.value;});step=2;render();});
    document.querySelectorAll('[data-doc]').forEach(i=>i.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;docs[i.dataset.doc]=f;const r=new FileReader();r.onload=ev=>{docPreviews[i.dataset.doc]=ev.target.result;render();};r.readAsDataURL(f);}));
    document.querySelectorAll('[data-rd]').forEach(b=>b.addEventListener('click',()=>{docs[b.dataset.rd]=null;docPreviews[b.dataset.rd]=null;render();}));
    document.getElementById('s2b')?.addEventListener('click',()=>{step=1;render();}); document.getElementById('s2n')?.addEventListener('click',()=>{step=3;render();});
    document.querySelectorAll('[data-pm]').forEach(b=>b.addEventListener('click',()=>{method=b.dataset.pm;render();}));
    document.getElementById('af')?.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;admFee=f;const r=new FileReader();r.onload=ev=>{admPrev=ev.target.result;render();};r.readAsDataURL(f);});
    document.getElementById('if')?.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;instFee=f;const r=new FileReader();r.onload=ev=>{instPrev=ev.target.result;render();};r.readAsDataURL(f);});
    document.getElementById('ra')?.addEventListener('click',()=>{admFee=null;admPrev=null;render();}); document.getElementById('ri')?.addEventListener('click',()=>{instFee=null;instPrev=null;render();});
    document.getElementById('s3b')?.addEventListener('click',()=>{step=2;render();}); document.getElementById('s3n')?.addEventListener('click',()=>{if(!method||!admFee||!instFee){window.toast('Complete all fields','error');return;}step=4;render();});
    document.getElementById('s4b')?.addEventListener('click',()=>{step=3;render();});
    document.getElementById('subm')?.addEventListener('click', async()=>{
      enrolling=true;render();
      try{
        const ul=async f=>f?(await api.uploadFile(f)).url:'';
        const [idF,idB,deg,bf,aU,iU]=await Promise.all([ul(docs.id_front),ul(docs.id_back),ul(docs.degree),ul(docs.bform),ul(admFee),ul(instFee)]);
        await api.submitAdmissionForm({...form,course_id:trackId,id_card_front_url:idF,id_card_back_url:idB,last_degree_url:deg,bform_url:bf,receipt_url:aU});
        await api.enrollDiploma({track_id:trackId,payment_method:method,payment_proof:`${admFee?.name||''} | ${instFee?.name||''}`,admission_fee_proof:aU,installment_1_proof:iU});
        app.innerHTML=`<div class="min-h-screen bg-[#050505] flex items-center justify-center px-4"><div class="glass-panel rounded-2xl p-10 max-w-md w-full text-center"><i data-lucide="check-circle-2" class="w-20 h-20 text-green-400 mx-auto mb-6"></i><h2 class="text-2xl font-bold text-white mb-3">Diploma Enrollment Submitted!</h2><p class="text-sm text-[#A1A1AA] mb-6">Admin will verify within 24 hours.</p><a href="/dashboard" data-link class="btn-gold px-6 py-3 text-sm">Dashboard</a></div></div>`;
        if(window.lucide)lucide.createIcons();
      }catch(e){window.toast(e.message,'error');enrolling=false;render();}
    });
  }
  render();
}
