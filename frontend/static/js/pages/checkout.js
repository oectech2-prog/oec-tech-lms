import { api } from '../api.js';
import { navigate } from '../router.js';

const METHODS = [
  { id:'jazzcash', name:'JazzCash', color:'text-red-400', bg:'bg-red-500/10', border:'border-red-500/30', account:'JazzCash Account: 983012259\nAccount Title: OEC Tech Institute' },
  { id:'easypaisa', name:'EasyPaisa', color:'text-green-400', bg:'bg-green-500/10', border:'border-green-500/30', account:'EasyPaisa Account: 0300-1413747\nAccount Title: Sadam Mubarak' },
  { id:'bank_transfer', name:'Bank Transfer', color:'text-blue-400', bg:'bg-blue-500/10', border:'border-blue-500/30', account:'Soneri Bank: 20016289664\nAccount Title: Sadam Mubarak' },
];

export async function checkoutPage({ courseId }) {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="min-h-screen bg-[#050505] flex items-center justify-center"><div class="spinner"></div></div>';
  let course;
  try { course = await api.getCourse(courseId); } catch { app.innerHTML = '<div class="min-h-screen bg-[#050505] flex items-center justify-center"><p class="text-red-400">Course not found</p></div>'; return; }

  const inst1 = Math.floor((course.price||0)/2);
  const inst2 = (course.price||0)-inst1;
  const payNow = (course.admission_fee||0)+inst1;
  let step=1, form={}, docs={}, docPreviews={}, method=null, admFee=null, admPrev=null, instFee=null, instPrev=null, enrolling=false;

  function render() {
    app.innerHTML = `<div data-testid="checkout-page" class="min-h-screen bg-[#050505] py-8 px-4"><div class="max-w-5xl mx-auto">
      <a href="/courses/${courseId}" data-link class="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-6"><i data-lucide="arrow-left" class="w-4 h-4"></i>Back to Course</a>
      <h1 class="text-xl font-bold text-white mb-1">Complete Your Enrollment</h1><p class="text-xs text-[#A1A1AA] mb-6">${course.title}</p>
      <div class="flex items-center gap-2 mb-8">${[{n:1,l:'Admission Form'},{n:2,l:'Documents'},{n:3,l:'Payment'},{n:4,l:'Confirm'}].map(s=>`<div class="flex items-center gap-1.5"><div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${step>=s.n?'bg-[#D4AF37] text-black':'bg-[#27272A] text-[#A1A1AA]'}">${step>s.n?'&#10003;':s.n}</div><span class="text-[10px] font-medium hidden sm:inline ${step>=s.n?'text-white':'text-[#A1A1AA]'}">${s.l}</span>${s.n<4?`<div class="w-6 sm:w-10 h-[2px] ${step>s.n?'bg-[#D4AF37]':'bg-[#27272A]'}"></div>`:''}</div>`).join('')}</div>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="lg:col-span-3">${stepContent()}</div>
        <div class="lg:col-span-2">
          <div class="bg-[#111] border border-[#27272A] rounded-xl p-5 sticky top-6">
            <h3 class="text-base font-bold text-white mb-4">Order Summary</h3>
            <div class="space-y-3 text-xs">
              <div class="flex justify-between text-[#A1A1AA]"><span>Course Fee</span><span class="text-white">PKR ${course.price?.toLocaleString()}</span></div>
              ${course.admission_fee>0?`<div class="flex justify-between text-[#A1A1AA]"><span>Admission Fee</span><span class="text-white">PKR ${course.admission_fee?.toLocaleString()}</span></div>`:''}
              <div class="border-t border-[#27272A] pt-3 flex justify-between"><span class="text-[#A1A1AA]">Total</span><span class="text-[#D4AF37] font-bold text-base">PKR ${((course.price||0)+(course.admission_fee||0)).toLocaleString()}</span></div>
              <div class="bg-[#050505] rounded-lg p-3 mt-4"><p class="text-[10px] text-[#D4AF37] font-semibold mb-1">Payment Plan</p><p class="text-[10px] text-[#A1A1AA]">Pay Now: PKR ${payNow.toLocaleString()} (Adm + 1st Inst)</p><p class="text-[10px] text-[#A1A1AA]">2nd Inst: PKR ${inst2.toLocaleString()} (at 50%)</p></div>
            </div>
          </div>
        </div>
      </div>
    </div></div>`;
    if(window.lucide)lucide.createIcons();
    bindEvents();
  }

  function stepContent() {
    if(step===1) return `<div><h3 class="text-base font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="user" class="w-5 h-5 text-[#D4AF37]"></i>Student Information</h3>
      <div class="bg-[#111] border border-[#27272A] rounded-xl p-5 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${[{k:'full_name',l:'Full Name *',p:'Full name'},{k:'phone',l:'Phone *',p:'03XX-XXXXXXX'},{k:'date_of_birth',l:'Date of Birth *',p:'',t:'date'},{k:'qualification',l:'Qualification',p:'e.g. Matric, Inter'},{k:'father_name',l:'Father Name *',p:'Father name'},{k:'father_phone',l:'Father Phone *',p:'03XX-XXXXXXX'}].map(f=>`<div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">${f.l}</label><input name="${f.k}" value="${form[f.k]||''}" type="${f.t||'text'}" placeholder="${f.p}" class="input-dark"></div>`).join('')}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${[{k:'gender',o:['Male','Female']},{k:'session_type',o:['Morning','Evening']},{k:'learning_type',o:['Online','On-Site']},{k:'religion',o:['Islam','Christianity','Hinduism','Other']}].map(f=>`<div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">${f.k.replace(/_/g,' ')} *</label><select name="${f.k}" class="select-dark"><option value="">Select</option>${f.o.map(o=>`<option value="${o}" ${form[f.k]===o?'selected':''}>${o}</option>`).join('')}</select></div>`).join('')}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${[{k:'city',l:'City *',p:'Your city'},{k:'father_cnic',l:'Father CNIC',p:'XXXXX-XXXXXXX-X'},{k:'address',l:'Address',p:'Your address'}].map(f=>`<div ${f.k==='address'?'class="sm:col-span-2"':''}><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">${f.l}</label><input name="${f.k}" value="${form[f.k]||''}" placeholder="${f.p}" class="input-dark"></div>`).join('')}
        </div>
        <button id="step1-next" class="btn-gold w-full py-3 text-sm mt-4">Continue to Documents</button>
      </div></div>`;
    if(step===2) return `<div><h3 class="text-base font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="file-text" class="w-5 h-5 text-[#D4AF37]"></i>Upload Documents</h3>
      <div class="bg-[#111] border border-[#27272A] rounded-xl p-5 space-y-4">
        <div class="grid grid-cols-2 gap-3">${['id_front','id_back','degree','bform'].map(k=>`<div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">${k==='id_front'?'ID Card Front':k==='id_back'?'ID Card Back':k==='degree'?'Last Degree':'B-Form'}</label>${docPreviews[k]?`<div class="relative h-28 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#27272A]"><img src="${docPreviews[k]}" class="w-full h-full object-contain"><button data-remove-doc="${k}" class="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 text-xs">X</button></div>`:`<label class="flex flex-col items-center justify-center h-28 border-2 border-dashed border-[#27272A] rounded-lg cursor-pointer hover:border-[#D4AF37]/40"><i data-lucide="image" class="w-6 h-6 text-[#71717A] mb-1"></i><span class="text-[10px] text-[#71717A]">Upload</span><input type="file" accept="image/*,.pdf" data-doc="${k}" class="hidden"></label>`}</div>`).join('')}</div>
        <div class="flex gap-3"><button id="step2-back" class="btn-gold-outline flex-1 py-3 text-sm">Back</button><button id="step2-next" class="btn-gold flex-1 py-3 text-sm">Continue to Payment</button></div>
      </div></div>`;
    if(step===3) return `<div><h3 class="text-base font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="credit-card" class="w-5 h-5 text-[#D4AF37]"></i>Payment</h3>
      <div class="bg-[#111] border border-[#27272A] rounded-xl p-5 space-y-4">
        <p class="text-[10px] text-[#A1A1AA]">Select payment method:</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">${METHODS.map(m=>`<button data-method="${m.id}" class="p-4 rounded-xl border-2 text-left transition-all ${method===m.id?`${m.border} ${m.bg}`:'border-[#27272A] hover:border-[#D4AF37]/30'}"><span class="text-sm font-bold ${m.color}">${m.name}</span></button>`).join('')}</div>
        ${method?`<div class="bg-[#050505] rounded-lg p-3"><p class="text-[10px] text-[#D4AF37] font-semibold mb-1">Account Details</p><pre class="text-[10px] text-[#A1A1AA] whitespace-pre-wrap">${METHODS.find(m=>m.id===method)?.account||''}</pre></div>`:''}
        <div><p class="text-[10px] text-[#A1A1AA] mb-2 font-semibold">Upload Admission Fee Screenshot (PKR ${(course.admission_fee||0).toLocaleString()})</p>
          ${admPrev?`<div class="relative h-32 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#27272A]"><img src="${admPrev}" class="w-full h-full object-contain"><button id="rm-adm" class="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 text-xs">X</button></div>`:`<label class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#27272A] rounded-lg cursor-pointer hover:border-[#D4AF37]/40"><i data-lucide="upload" class="w-6 h-6 text-[#71717A] mb-1"></i><span class="text-[10px] text-[#71717A]">Upload screenshot</span><input type="file" accept="image/*" id="adm-fee-input" class="hidden"></label>`}
        </div>
        <div><p class="text-[10px] text-[#A1A1AA] mb-2 font-semibold">Upload 1st Installment Screenshot (PKR ${inst1.toLocaleString()})</p>
          ${instPrev?`<div class="relative h-32 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#27272A]"><img src="${instPrev}" class="w-full h-full object-contain"><button id="rm-inst" class="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 text-xs">X</button></div>`:`<label class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#27272A] rounded-lg cursor-pointer hover:border-[#D4AF37]/40"><i data-lucide="upload" class="w-6 h-6 text-[#71717A] mb-1"></i><span class="text-[10px] text-[#71717A]">Upload screenshot</span><input type="file" accept="image/*" id="inst-fee-input" class="hidden"></label>`}
        </div>
        <div class="flex gap-3"><button id="step3-back" class="btn-gold-outline flex-1 py-3 text-sm">Back</button><button id="step3-next" class="btn-gold flex-1 py-3 text-sm">Review & Submit</button></div>
      </div></div>`;
    return `<div><h3 class="text-base font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="check-circle-2" class="w-5 h-5 text-[#D4AF37]"></i>Review & Confirm</h3>
      <div class="bg-[#111] border border-[#27272A] rounded-xl p-5 space-y-4">
        <div class="grid grid-cols-2 gap-3 text-xs">${Object.entries(form).filter(([,v])=>v).map(([k,v])=>`<div><p class="text-[10px] text-[#71717A]">${k.replace(/_/g,' ')}</p><p class="text-white">${v}</p></div>`).join('')}</div>
        <div class="bg-[#050505] rounded-lg p-3"><p class="text-[10px] text-[#D4AF37] font-semibold">Payment: ${METHODS.find(m=>m.id===method)?.name||''}</p><p class="text-[10px] text-[#A1A1AA]">Admission: ${admFee?'Uploaded':'N/A'} | 1st Installment: ${instFee?'Uploaded':'N/A'}</p></div>
        <div class="flex gap-3"><button id="step4-back" class="btn-gold-outline flex-1 py-3 text-sm">Back</button><button id="submit-enroll" class="btn-gold flex-1 py-3 text-sm" ${enrolling?'disabled':''}>${enrolling?'Submitting...':'Submit Enrollment'}</button></div>
      </div></div>`;
  }

  function bindEvents() {
    // Step 1
    document.getElementById('step1-next')?.addEventListener('click', () => {
      document.querySelectorAll('[name]').forEach(i => { form[i.name]=i.value; });
      const req=['full_name','phone','date_of_birth','gender','session_type','learning_type','city','father_name','father_phone'];
      for(const k of req){if(!form[k]){window.toast(`Please fill: ${k.replace(/_/g,' ')}`,'error');return;}}
      step=2;render();
    });
    // Step 2
    document.querySelectorAll('[data-doc]').forEach(inp => {
      inp.addEventListener('change', e => {
        const f=e.target.files[0]; if(!f)return; if(f.size>5*1024*1024){window.toast('Max 5MB','error');return;}
        docs[inp.dataset.doc]=f;
        const r=new FileReader(); r.onload=ev=>{docPreviews[inp.dataset.doc]=ev.target.result;render();}; r.readAsDataURL(f);
      });
    });
    document.querySelectorAll('[data-remove-doc]').forEach(b => b.addEventListener('click', ()=>{const k=b.dataset.removeDoc;docs[k]=null;docPreviews[k]=null;render();}));
    document.getElementById('step2-back')?.addEventListener('click', ()=>{step=1;render();});
    document.getElementById('step2-next')?.addEventListener('click', ()=>{step=3;render();});
    // Step 3
    document.querySelectorAll('[data-method]').forEach(b => b.addEventListener('click', ()=>{method=b.dataset.method;render();}));
    document.getElementById('adm-fee-input')?.addEventListener('change', e=>{const f=e.target.files[0];if(!f)return;admFee=f;const r=new FileReader();r.onload=ev=>{admPrev=ev.target.result;render();};r.readAsDataURL(f);});
    document.getElementById('inst-fee-input')?.addEventListener('change', e=>{const f=e.target.files[0];if(!f)return;instFee=f;const r=new FileReader();r.onload=ev=>{instPrev=ev.target.result;render();};r.readAsDataURL(f);});
    document.getElementById('rm-adm')?.addEventListener('click', ()=>{admFee=null;admPrev=null;render();});
    document.getElementById('rm-inst')?.addEventListener('click', ()=>{instFee=null;instPrev=null;render();});
    document.getElementById('step3-back')?.addEventListener('click', ()=>{step=2;render();});
    document.getElementById('step3-next')?.addEventListener('click', ()=>{if(!method){window.toast('Select payment','error');return;}if(!admFee){window.toast('Upload admission fee','error');return;}if(!instFee){window.toast('Upload 1st installment','error');return;}step=4;render();});
    // Step 4
    document.getElementById('step4-back')?.addEventListener('click', ()=>{step=3;render();});
    document.getElementById('submit-enroll')?.addEventListener('click', async ()=>{
      enrolling=true;render();
      try{
        const upload=async f=>f?(await api.uploadFile(f)).url:'';
        const [idF,idB,deg,bf,admUrl,instUrl]=await Promise.all([upload(docs.id_front),upload(docs.id_back),upload(docs.degree),upload(docs.bform),upload(admFee),upload(instFee)]);
        const formRes=await api.submitAdmissionForm({...form,course_id:courseId,id_card_front_url:idF,id_card_back_url:idB,last_degree_url:deg,bform_url:bf,receipt_url:admUrl});
        await api.enroll({course_id:courseId,payment_method:method,payment_proof:`${admFee?.name||''} | ${instFee?.name||''}`,admission_fee_proof:admUrl,installment_1_proof:instUrl});
        app.innerHTML=`<div class="min-h-screen bg-[#050505] flex items-center justify-center px-4"><div class="glass-panel rounded-2xl p-10 max-w-md w-full text-center"><div class="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><i data-lucide="check-circle-2" class="w-12 h-12 text-green-400"></i></div><h2 class="text-2xl font-bold text-white mb-3">Enrollment Submitted!</h2>${formRes.student_id?`<p class="text-xs text-[#D4AF37] mb-2">Student ID: ${formRes.student_id}</p>`:''}<p class="text-sm text-[#A1A1AA] mb-6">Admin will verify your payment within 24 hours.</p><div class="flex flex-col gap-3"><a href="/dashboard" data-link class="btn-gold text-center py-3 text-sm">Go to Dashboard</a><a href="/courses" data-link class="btn-gold-outline text-center py-3 text-sm">Browse Courses</a></div></div></div>`;
        if(window.lucide)lucide.createIcons();
      }catch(e){window.toast(e.message||'Enrollment failed','error');enrolling=false;render();}
    });
  }
  render();
}
