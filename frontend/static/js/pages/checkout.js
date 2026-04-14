// Checkout Page (Course Enrollment)
function renderCheckoutPage(params) {
  renderDashboardPage(Components.loading());
  Api.getCourse(params.courseId).then(course => {
    if (!course) { renderDashboardPage('<div class="min-h-screen flex items-center justify-center"><p class="text-white">Course not found</p></div>'); return; }
    let step = 1, enrolling = false, success = false, studentId = '';
    const form = { full_name:'', qualification:'', phone:'', date_of_birth:'', address:'', gender:'', session_type:'', learning_type:'', religion:'', city:'', father_name:'', father_phone:'', father_cnic:'' };
    let selectedMethod = null, paymentRef = '';
    const inst1 = Math.floor((course.price||0)/2), inst2 = (course.price||0)-inst1, payNow = (course.admission_fee||0)+inst1;

    const METHODS = [{id:'jazzcash',name:'JazzCash',color:'red',acct:'JazzCash: 983012259\nOEC Tech Institute'},{id:'easypaisa',name:'EasyPaisa',color:'green',acct:'EasyPaisa: 0300-1413747\nSadam Mubarak'},{id:'bank_transfer',name:'Bank Transfer',color:'blue',acct:'Soneri Bank: 20016289664\nSadam Mubarak'}];
    const INPUT = "w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:border-[#D4AF37] focus:outline-none";
    const LABEL = "text-[10px] font-medium text-[#A1A1AA] mb-1 block";

    function render() {
      if (success) {
        renderDashboardPage(`<div data-testid="checkout-success" class="min-h-screen bg-[#050505] flex items-center justify-center px-4"><div class="glass-panel rounded-2xl p-10 max-w-md w-full text-center">
          <i data-lucide="check-circle-2" class="w-20 h-20 text-green-400 mx-auto mb-6"></i><h2 class="text-2xl font-bold text-white mb-3">Enrollment Submitted!</h2>
          ${studentId?`<p class="text-xs text-[#D4AF37] mb-2">Student ID: ${studentId}</p>`:''}
          <p class="text-sm text-[#A1A1AA] mb-6">Admin will verify payment within 24 hours.</p>
          <div class="flex flex-col gap-3"><a href="/dashboard" data-link class="btn-gold text-center py-3 text-sm">Go to Dashboard</a><a href="/courses" data-link class="btn-gold-outline text-center py-3 text-sm">Browse More Courses</a></div>
        </div></div>`); return;
      }

      const stepBar = [1,2,3,4].map(n => `<div class="flex items-center gap-1.5"><div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${step>=n?'bg-[#D4AF37] text-black':'bg-[#27272A] text-[#A1A1AA]'}">${step>n?'&#10003;':n}</div><span class="text-[10px] font-medium hidden sm:inline ${step>=n?'text-white':'text-[#A1A1AA]'}">${['Admission','Documents','Payment','Confirm'][n-1]}</span>${n<4?`<div class="w-6 sm:w-10 h-[2px] ${step>n?'bg-[#D4AF37]':'bg-[#27272A]'}"></div>`:''}</div>`).join('');

      let stepContent = '';
      if (step === 1) {
        stepContent = `<h3 class="text-base font-bold text-white mb-4"><i data-lucide="user" class="w-5 h-5 text-[#D4AF37] inline mr-2"></i>Student Information</h3>
        <div class="bg-[#111111] border border-[#27272A] rounded-xl p-5 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label class="${LABEL}">Full Name *</label><input data-testid="form-full-name" name="full_name" value="${form.full_name}" class="${INPUT}" placeholder="Student full name"></div>
            <div><label class="${LABEL}">Phone *</label><input data-testid="form-phone" name="phone" value="${form.phone}" class="${INPUT}" placeholder="03XXXXXXXXX"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label class="${LABEL}">Date of Birth *</label><input data-testid="form-dob" name="date_of_birth" type="date" value="${form.date_of_birth}" class="${INPUT}"></div>
            <div><label class="${LABEL}">Gender *</label><select data-testid="form-gender" name="gender" class="${INPUT}"><option value="">Select</option><option ${form.gender==='Male'?'selected':''}>Male</option><option ${form.gender==='Female'?'selected':''}>Female</option><option ${form.gender==='Other'?'selected':''}>Other</option></select></div>
            <div><label class="${LABEL}">City *</label><input name="city" value="${form.city}" class="${INPUT}" placeholder="City"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label class="${LABEL}">Session *</label><select name="session_type" class="${INPUT}"><option value="">Select</option><option ${form.session_type==='Morning'?'selected':''}>Morning</option><option ${form.session_type==='Evening'?'selected':''}>Evening</option></select></div>
            <div><label class="${LABEL}">Learning Type *</label><select name="learning_type" class="${INPUT}"><option value="">Select</option><option ${form.learning_type==='Online'?'selected':''}>Online</option><option ${form.learning_type==='Physical'?'selected':''}>Physical</option></select></div>
          </div>
          <div class="pt-3 border-t border-[#27272A]"><p class="text-xs font-bold text-[#D4AF37] mb-3">PARENT / GUARDIAN</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label class="${LABEL}">Father Name *</label><input name="father_name" value="${form.father_name}" class="${INPUT}"></div>
              <div><label class="${LABEL}">Father Phone *</label><input name="father_phone" value="${form.father_phone}" class="${INPUT}" placeholder="03XXXXXXXXX"></div>
              <div><label class="${LABEL}">Father CNIC</label><input name="father_cnic" value="${form.father_cnic}" class="${INPUT}" placeholder="XXXXX-XXXXXXX-X"></div>
            </div>
          </div>
          <button data-testid="form-next-btn" onclick="window._checkoutNext()" class="btn-gold px-6 py-2.5 text-xs mt-2">Next: Upload Documents</button>
        </div>`;
      } else if (step === 2) {
        stepContent = `<h3 class="text-base font-bold text-white mb-4"><i data-lucide="file-text" class="w-5 h-5 text-[#D4AF37] inline mr-2"></i>Documents (Optional)</h3>
        <div class="bg-[#111111] border border-[#27272A] rounded-xl p-5">
          <p class="text-[10px] text-[#A1A1AA] mb-4">Upload JPG, PNG or PDF. Max 5MB each. Documents are optional but recommended.</p>
          <div class="flex gap-3"><button onclick="step=1;render()" class="btn-gold-outline px-5 py-2 text-xs">Back</button><button data-testid="docs-next-btn" onclick="step=3;render()" class="btn-gold px-6 py-2 text-xs">Next: Payment</button></div>
        </div>`;
      } else if (step === 3) {
        stepContent = `<h3 class="text-base font-bold text-white mb-4"><i data-lucide="credit-card" class="w-5 h-5 text-[#D4AF37] inline mr-2"></i>Payment Method</h3>
        <div class="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4 mb-5">
          <p class="text-[10px] font-bold text-[#D4AF37] mb-2">FEE STRUCTURE</p>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-[#A1A1AA]">Admission Fee</span><span class="text-white">PKR ${(course.admission_fee||0).toLocaleString()}</span></div>
            <div class="flex justify-between"><span class="text-[#A1A1AA]">1st Installment</span><span class="text-white">PKR ${inst1.toLocaleString()}</span></div>
            <div class="flex justify-between"><span class="text-[#A1A1AA]">2nd Installment (later)</span><span class="text-[#71717A]">PKR ${inst2.toLocaleString()}</span></div>
            <div class="border-t border-[#27272A] pt-2 flex justify-between font-bold"><span class="text-white">Total to Pay Now</span><span class="text-[#D4AF37]">PKR ${payNow.toLocaleString()}</span></div>
          </div>
        </div>
        <div class="space-y-3 mb-6">${METHODS.map(m => `<button onclick="window._selectMethod('${m.id}')" class="w-full text-left p-4 rounded-xl border transition-all ${selectedMethod===m.id?`bg-${m.color}-500/10 border-${m.color}-500/30 shadow-lg`:'bg-[#111111] border-[#27272A] hover:border-[#D4AF37]/30'}"><div class="flex items-center gap-3"><i data-lucide="smartphone" class="w-5 h-5 text-${m.color}-400"></i><span class="text-sm font-bold text-white">${m.name}</span>${selectedMethod===m.id?`<i data-lucide="check-circle-2" class="w-4 h-4 text-${m.color}-400 ml-auto"></i>`:''}</div>${selectedMethod===m.id?`<div class="mt-3 p-3 bg-black/30 rounded-lg"><p class="text-xs text-[#A1A1AA] whitespace-pre-line">${m.acct}</p><p class="text-xs text-[#D4AF37] mt-2 font-semibold">Send PKR ${payNow.toLocaleString()}</p></div>`:''}</button>`).join('')}</div>
        <div class="flex gap-3 mt-4"><button onclick="step=2;render()" class="btn-gold-outline px-5 py-2 text-xs">Back</button><button data-testid="payment-next-btn" onclick="window._paymentNext()" class="btn-gold px-6 py-2 text-xs">Next: Confirm</button></div>`;
      } else if (step === 4) {
        stepContent = `<h3 class="text-base font-bold text-white mb-4"><i data-lucide="shield" class="w-5 h-5 text-[#D4AF37] inline mr-2"></i>Review & Confirm</h3>
        <div class="bg-[#111111] border border-[#27272A] rounded-xl p-4 mb-4">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div><span class="text-[#71717A]">Name:</span> <span class="text-white">${form.full_name}</span></div>
            <div><span class="text-[#71717A]">Phone:</span> <span class="text-white">${form.phone}</span></div>
            <div><span class="text-[#71717A]">City:</span> <span class="text-white">${form.city}</span></div>
            <div><span class="text-[#71717A]">Payment:</span> <span class="text-white">${selectedMethod}</span></div>
          </div>
        </div>
        <div class="flex gap-3"><button onclick="step=3;render()" class="btn-gold-outline px-5 py-2 text-xs">Back</button><button data-testid="confirm-enrollment-btn" onclick="window._confirmEnroll()" ${enrolling?'disabled':''} class="btn-gold px-8 py-2 text-xs">${enrolling?'Submitting...':'Confirm Enrollment'}</button></div>`;
      }

      renderDashboardPage(`<div data-testid="checkout-page" class="min-h-screen bg-[#050505] py-8 px-4"><div class="max-w-5xl mx-auto">
        <a href="/courses/${params.courseId}" data-link class="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-6"><i data-lucide="arrow-left" class="w-4 h-4"></i>Back to Course</a>
        <h1 class="text-xl font-bold text-white mb-1">Complete Your Enrollment</h1><p class="text-xs text-[#A1A1AA] mb-6">${course.title}</p>
        <div class="flex items-center gap-2 mb-8">${stepBar}</div>
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div class="lg:col-span-3">${stepContent}</div>
          <div class="lg:col-span-2"><div class="bg-[#111111] border border-[#27272A] rounded-xl p-5 sticky top-8">
            <h3 class="text-sm font-bold text-white mb-3">Order Summary</h3>
            ${course.image_url?`<div class="aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-[#1A1A1A]"><img src="${course.image_url}" alt="${course.title}" loading="lazy" class="w-full h-full object-cover"></div>`:''}
            <h4 class="text-xs font-bold text-white mb-0.5">${course.title}</h4><p class="text-[10px] text-[#A1A1AA] mb-3">${course.duration} - ${course.level}</p>
            <div class="border-t border-[#27272A] pt-3 space-y-1.5">
              ${course.admission_fee>0?`<div class="flex justify-between text-xs"><span class="text-[#A1A1AA]">Admission Fee</span><span class="text-white">PKR ${course.admission_fee.toLocaleString()}</span></div>`:''}
              <div class="flex justify-between text-xs"><span class="text-[#A1A1AA]">1st Installment</span><span class="text-white">PKR ${inst1.toLocaleString()}</span></div>
              <div class="flex justify-between text-xs"><span class="text-[#71717A]">2nd Installment (later)</span><span class="text-[#71717A]">PKR ${inst2.toLocaleString()}</span></div>
              <div class="border-t border-[#27272A] pt-1.5"><div class="flex justify-between mb-1"><span class="text-xs font-bold text-white">Pay Now</span><span class="text-lg font-bold text-[#D4AF37]">PKR ${payNow.toLocaleString()}</span></div></div>
            </div>
          </div></div>
        </div>
      </div></div>`);

      // Bind form inputs
      document.querySelectorAll('[name]').forEach(el => {
        if (form.hasOwnProperty(el.name)) el.addEventListener('change', () => { form[el.name] = el.value; });
        if (form.hasOwnProperty(el.name)) el.addEventListener('input', () => { form[el.name] = el.value; });
      });
    }

    window._checkoutNext = () => {
      const req = ['full_name','phone','date_of_birth','gender','session_type','learning_type','city','father_name','father_phone'];
      for (const k of req) { if (!form[k]) { showToast(`Please fill: ${k.replace(/_/g,' ')}`, 'error'); return; } }
      step = 2; render();
    };
    window._selectMethod = (id) => { selectedMethod = id; render(); };
    window._paymentNext = () => { if (!selectedMethod) { showToast('Select payment method', 'error'); return; } step = 4; render(); };
    window._confirmEnroll = async () => {
      if (enrolling) return; enrolling = true; render();
      try {
        const admRes = await Api.submitAdmission({ ...form, course_id: params.courseId });
        studentId = admRes.student_id || '';
        await Api.enroll({ course_id: params.courseId, payment_method: selectedMethod, payment_proof: paymentRef || selectedMethod });
        success = true; showToast('Enrollment submitted!');
      } catch (err) { showToast(err.detail || 'Enrollment failed', 'error'); }
      enrolling = false; render();
    };

    render();
  }).catch(() => renderDashboardPage('<div class="min-h-screen flex items-center justify-center"><p class="text-[#A1A1AA]">Failed to load course</p></div>'));
}
