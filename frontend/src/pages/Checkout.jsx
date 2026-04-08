import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCourse, enrollInCourse, studentUpload, submitAdmissionForm } from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, CreditCard, Building2, Smartphone, Upload, FileImage, X, Shield, Clock, User, FileText } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'jazzcash', name: 'JazzCash', icon: Smartphone, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', account: 'JazzCash Account: 983012259\nAccount Title: OEC Tech Institute' },
  { id: 'easypaisa', name: 'EasyPaisa', icon: Smartphone, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', account: 'EasyPaisa Account: 0300-1413747\nAccount Title: Sadam Mubarak' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', account: 'Soneri Bank: 20016289664\nAccount Title: Sadam Mubarak' },
];

const INPUT_CLS = "w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]";
const LABEL_CLS = "text-[10px] font-medium text-[#A1A1AA] mb-1 block";

function DocUpload({ label, testId, file, preview, onSelect, onRemove }) {
  const ref = useRef(null);
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {preview ? (
        <div className="relative h-28 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#27272A]">
          <img src={preview} alt="" className="w-full h-full object-contain" />
          <button onClick={onRemove} className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
          <span className="absolute bottom-1 left-1 text-[8px] text-green-400 bg-black/60 px-1 rounded">{file?.name}</span>
        </div>
      ) : (
        <label data-testid={testId} className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-[#27272A] rounded-lg cursor-pointer hover:border-[#D4AF37]/40 transition-colors">
          <FileImage className="w-6 h-6 text-[#71717A] mb-1" />
          <span className="text-[10px] text-[#71717A]">Click to upload</span>
          <input ref={ref} type="file" accept="image/*,.pdf" onChange={(e) => { const f = e.target.files[0]; if (f) { if (f.size > 5*1024*1024) { toast.error('Max 5MB'); return; } onSelect(f); } }} className="hidden" />
        </label>
      )}
    </div>
  );
}

export default function Checkout() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [enrolling, setEnrolling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [studentId, setStudentId] = useState('');

  // Admission form
  const [form, setForm] = useState({
    full_name: '', qualification: '', phone: '', date_of_birth: '', address: '',
    gender: '', session_type: '', learning_type: '', religion: '', city: '',
    father_name: '', father_phone: '', father_cnic: '',
  });
  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  // Docs
  const [docs, setDocs] = useState({ id_front: null, id_back: null, degree: null, bform: null });
  const [docPreviews, setDocPreviews] = useState({ id_front: null, id_back: null, degree: null, bform: null });
  const setDoc = (key, file) => {
    setDocs(p => ({ ...p, [key]: file }));
    const reader = new FileReader();
    reader.onload = (e) => setDocPreviews(p => ({ ...p, [key]: e.target.result }));
    reader.readAsDataURL(file);
  };
  const removeDoc = (key) => { setDocs(p => ({ ...p, [key]: null })); setDocPreviews(p => ({ ...p, [key]: null })); };

  // Payment
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const receiptRef = useRef(null);

  useEffect(() => {
    getCourse(courseId).then(r => { setCourse(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [courseId]);

  const handleReceiptSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const required = ['full_name', 'phone', 'date_of_birth', 'gender', 'session_type', 'learning_type', 'city', 'father_name', 'father_phone'];
    for (const key of required) {
      if (!form[key]) { toast.error(`Please fill: ${key.replace(/_/g, ' ')}`); return false; }
    }
    return true;
  };

  const handleEnroll = async () => {
    if (!selectedMethod) { toast.error('Select payment method'); return; }
    setEnrolling(true);
    try {
      // 1. Upload documents
      const uploadDoc = async (file) => {
        if (!file) return '';
        const res = await studentUpload(file);
        return res.data.url;
      };
      const [idFrontUrl, idBackUrl, degreeUrl, bformUrl, receiptUrl] = await Promise.all([
        uploadDoc(docs.id_front), uploadDoc(docs.id_back), uploadDoc(docs.degree), uploadDoc(docs.bform), uploadDoc(receiptFile),
      ]);

      // 2. Submit admission form
      const formRes = await submitAdmissionForm({
        ...form, course_id: courseId,
        id_card_front_url: idFrontUrl, id_card_back_url: idBackUrl,
        last_degree_url: degreeUrl, bform_url: bformUrl, receipt_url: receiptUrl,
      });
      setStudentId(formRes.data.student_id);

      // 3. Enroll
      let proofText = paymentRef || '';
      if (receiptFile) proofText += (proofText ? ' | ' : '') + `Receipt: ${receiptFile.name}`;
      proofText += ` | Receipt URL: ${receiptUrl}`;
      await enrollInCourse({ course_id: courseId, payment_method: selectedMethod, payment_proof: proofText });
      setSuccess(true);
      toast.success('Enrollment submitted!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Enrollment failed');
    }
    setEnrolling(false);
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>;

  if (success) return (
    <div data-testid="checkout-success" className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel rounded-2xl p-10 max-w-md w-full text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-3">Enrollment Submitted!</h2>
        {studentId && <p className="text-xs text-[#D4AF37] mb-2">Student ID: {studentId}</p>}
        <p className="text-sm text-[#A1A1AA] mb-2">Your enrollment for <span className="text-white font-semibold">{course?.title}</span> has been submitted.</p>
        <p className="text-sm text-[#A1A1AA] mb-6">Admin will verify your payment within 24 hours.</p>
        <div className="flex flex-col gap-3">
          <Link to="/dashboard" className="btn-gold text-center py-3 text-sm">Go to Dashboard</Link>
          <Link to="/courses" className="btn-gold-outline text-center py-3 text-sm">Browse More Courses</Link>
        </div>
      </motion.div>
    </div>
  );

  const total = (course?.price || 0) + (course?.admission_fee || 0);

  return (
    <div data-testid="checkout-page" className="min-h-screen bg-[#050505] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to={`/courses/${courseId}`} className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Course
        </Link>

        <h1 className="text-xl font-bold text-white mb-1">Complete Your Enrollment</h1>
        <p className="text-xs text-[#A1A1AA] mb-6">{course?.title}</p>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[{ num: 1, label: 'Admission Form' }, { num: 2, label: 'Documents' }, { num: 3, label: 'Payment' }, { num: 4, label: 'Confirm' }].map(({ num, label }) => (
            <div key={num} className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= num ? 'bg-[#D4AF37] text-black' : 'bg-[#27272A] text-[#A1A1AA]'}`}>
                {step > num ? <CheckCircle2 className="w-3.5 h-3.5" /> : num}
              </div>
              <span className={`text-[10px] font-medium hidden sm:inline ${step >= num ? 'text-white' : 'text-[#A1A1AA]'}`}>{label}</span>
              {num < 4 && <div className={`w-6 sm:w-10 h-[2px] ${step > num ? 'bg-[#D4AF37]' : 'bg-[#27272A]'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">

            {/* STEP 1: Admission Form */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#D4AF37]" /> Student Information
                </h3>
                <div className="bg-[#111111] border border-[#27272A] rounded-xl p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={LABEL_CLS}>Full Name *</label><input data-testid="form-full-name" value={form.full_name} onChange={e => f('full_name', e.target.value)} placeholder="Student full name" className={INPUT_CLS} /></div>
                    <div><label className={LABEL_CLS}>Phone Number *</label><input data-testid="form-phone" value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="03XXXXXXXXX" className={INPUT_CLS} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div><label className={LABEL_CLS}>Date of Birth *</label><input data-testid="form-dob" type="date" value={form.date_of_birth} onChange={e => f('date_of_birth', e.target.value)} className={INPUT_CLS} /></div>
                    <div>
                      <label className={LABEL_CLS}>Gender *</label>
                      <select data-testid="form-gender" value={form.gender} onChange={e => f('gender', e.target.value)} className={INPUT_CLS}>
                        <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select>
                    </div>
                    <div><label className={LABEL_CLS}>Religion</label><input data-testid="form-religion" value={form.religion} onChange={e => f('religion', e.target.value)} placeholder="e.g. Islam" className={INPUT_CLS} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={LABEL_CLS}>Qualification</label><input data-testid="form-qualification" value={form.qualification} onChange={e => f('qualification', e.target.value)} placeholder="e.g. Matric, Inter, BSc" className={INPUT_CLS} /></div>
                    <div><label className={LABEL_CLS}>City *</label><input data-testid="form-city" value={form.city} onChange={e => f('city', e.target.value)} placeholder="e.g. Chunian, Lahore" className={INPUT_CLS} /></div>
                  </div>
                  <div><label className={LABEL_CLS}>Address</label><input data-testid="form-address" value={form.address} onChange={e => f('address', e.target.value)} placeholder="Full address" className={INPUT_CLS} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL_CLS}>Session Type *</label>
                      <select data-testid="form-session" value={form.session_type} onChange={e => f('session_type', e.target.value)} className={INPUT_CLS}>
                        <option value="">Select</option><option value="Morning">Morning</option><option value="Evening">Evening</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Learning Type *</label>
                      <select data-testid="form-learning" value={form.learning_type} onChange={e => f('learning_type', e.target.value)} className={INPUT_CLS}>
                        <option value="">Select</option><option value="Online">Online</option><option value="Physical">Physical</option>
                      </select>
                    </div>
                  </div>

                  {/* Parents / Guardian */}
                  <div className="pt-3 border-t border-[#27272A]">
                    <p className="text-xs font-bold text-[#D4AF37] mb-3">PARTICULARS OF PARENTS / GUARDIAN</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div><label className={LABEL_CLS}>Father Name *</label><input data-testid="form-father-name" value={form.father_name} onChange={e => f('father_name', e.target.value)} className={INPUT_CLS} /></div>
                      <div><label className={LABEL_CLS}>Father Phone *</label><input data-testid="form-father-phone" value={form.father_phone} onChange={e => f('father_phone', e.target.value)} placeholder="03XXXXXXXXX" className={INPUT_CLS} /></div>
                      <div><label className={LABEL_CLS}>Father CNIC No.</label><input data-testid="form-father-cnic" value={form.father_cnic} onChange={e => f('father_cnic', e.target.value)} placeholder="XXXXX-XXXXXXX-X" className={INPUT_CLS} /></div>
                    </div>
                  </div>

                  <button data-testid="form-next-btn" onClick={() => { if (validateForm()) setStep(2); }} className="btn-gold px-6 py-2.5 text-xs mt-2">
                    Next: Upload Documents
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Document Upload */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#D4AF37]" /> Student Documents
                </h3>
                <div className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <DocUpload label="ID Card (Front Side)" testId="upload-id-front" file={docs.id_front} preview={docPreviews.id_front} onSelect={(f) => setDoc('id_front', f)} onRemove={() => removeDoc('id_front')} />
                    <DocUpload label="ID Card (Back Side)" testId="upload-id-back" file={docs.id_back} preview={docPreviews.id_back} onSelect={(f) => setDoc('id_back', f)} onRemove={() => removeDoc('id_back')} />
                    <DocUpload label="Last Degree / Certificate" testId="upload-degree" file={docs.degree} preview={docPreviews.degree} onSelect={(f) => setDoc('degree', f)} onRemove={() => removeDoc('degree')} />
                    <DocUpload label="B-Form" testId="upload-bform" file={docs.bform} preview={docPreviews.bform} onSelect={(f) => setDoc('bform', f)} onRemove={() => removeDoc('bform')} />
                  </div>
                  <p className="text-[10px] text-[#A1A1AA] mb-4">Upload JPG, PNG or PDF. Max 5MB each. Documents are optional but recommended.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-gold-outline px-5 py-2 text-xs">Back</button>
                    <button data-testid="docs-next-btn" onClick={() => setStep(3)} className="btn-gold px-6 py-2 text-xs">Next: Payment</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Payment */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#D4AF37]" /> Payment Method
                </h3>
                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const sel = selectedMethod === method.id;
                    return (
                      <button key={method.id} data-testid={`payment-${method.id}`}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${sel ? `${method.bg} ${method.border} shadow-lg` : 'bg-[#111111] border-[#27272A] hover:border-[#D4AF37]/30'}`}>
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${method.color}`} />
                          <span className="text-sm font-bold text-white">{method.name}</span>
                          {sel && <CheckCircle2 className={`w-4 h-4 ${method.color} ml-auto`} />}
                        </div>
                        {sel && (
                          <div className="mt-3 p-3 bg-black/30 rounded-lg">
                            <p className="text-xs text-[#A1A1AA] whitespace-pre-line">{method.account}</p>
                            <p className="text-xs text-[#D4AF37] mt-2 font-semibold">Send PKR {total.toLocaleString()} to the above account.</p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Fee Receipt Upload */}
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#D4AF37]" /> Upload Fee Receipt
                </h3>
                <div className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
                  {receiptPreview ? (
                    <div className="relative">
                      <img src={receiptPreview} alt="Receipt" className="w-full max-h-48 object-contain rounded-lg border border-[#27272A]" />
                      <button onClick={() => { setReceiptFile(null); setReceiptPreview(null); }} className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                      <p className="text-[10px] text-green-400 mt-2">{receiptFile?.name} uploaded</p>
                    </div>
                  ) : (
                    <label data-testid="upload-receipt-area" className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#27272A] rounded-xl cursor-pointer hover:border-[#D4AF37]/40 transition-colors">
                      <FileImage className="w-10 h-10 text-[#71717A] mb-2" />
                      <p className="text-xs text-white mb-0.5">Upload fee receipt</p>
                      <p className="text-[10px] text-[#71717A]">PNG, JPG, PDF up to 5MB</p>
                      <input ref={receiptRef} type="file" accept="image/*,.pdf" onChange={handleReceiptSelect} className="hidden" />
                    </label>
                  )}
                  <div className="mt-3">
                    <label className={LABEL_CLS}>Transaction ID (Optional)</label>
                    <input data-testid="payment-reference" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Reference number" className={INPUT_CLS} />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(2)} className="btn-gold-outline px-5 py-2 text-xs">Back</button>
                  <button data-testid="payment-next-btn" onClick={() => { if (!selectedMethod) { toast.error('Select payment method'); return; } setStep(4); }} className="btn-gold px-6 py-2 text-xs">
                    Next: Confirm
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary (always visible) */}
          <div className="lg:col-span-2">
            <div className="bg-[#111111] border border-[#27272A] rounded-xl p-5 sticky top-8">
              <h3 className="text-sm font-bold text-white mb-3">Order Summary</h3>
              {course && (
                <>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-[#1A1A1A]">
                    <img src={course.image_url} alt={course.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{course.title}</h4>
                  <p className="text-[10px] text-[#A1A1AA] mb-3">{course.duration} - {course.level}</p>
                  <div className="space-y-2 mb-3 text-[10px] text-[#A1A1AA]">
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-400" /> Lifetime Access</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-400" /> {course.weeks?.length} Weeks of Content</div>
                    <div className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-[#D4AF37]" /> WhatsApp Community</div>
                  </div>
                  <div className="border-t border-[#27272A] pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-[#A1A1AA]">Course Fee</span><span className="text-white">PKR {course.price?.toLocaleString()}</span></div>
                    {course.admission_fee > 0 && <div className="flex justify-between text-xs"><span className="text-[#A1A1AA]">Admission Fee</span><span className="text-white">PKR {course.admission_fee?.toLocaleString()}</span></div>}
                    <div className="border-t border-[#27272A] pt-1.5 flex justify-between">
                      <span className="text-xs font-bold text-white">Total</span>
                      <span className="text-lg font-bold text-[#D4AF37]">PKR {total.toLocaleString()}</span>
                    </div>
                  </div>

                  {step >= 4 && (
                    <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      data-testid="confirm-enrollment-btn" onClick={handleEnroll} disabled={enrolling || !selectedMethod}
                      className="w-full btn-gold mt-4 py-3 text-sm flex items-center justify-center disabled:opacity-50">
                      {enrolling ? 'Submitting...' : 'Confirm Enrollment'}
                    </motion.button>
                  )}
                  <div className="flex items-center gap-1.5 mt-3 text-[10px] text-[#A1A1AA]">
                    <Clock className="w-3 h-3" /> Verified within 24 hours
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
