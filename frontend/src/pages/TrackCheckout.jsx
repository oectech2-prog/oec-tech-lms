import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDiplomaTrack, getCourses, studentUpload, submitAdmissionForm, createDiplomaEnrollment } from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, CreditCard, Building2, Smartphone, Upload, FileImage, X, Shield, Clock, User, FileText, Award, BookOpen } from 'lucide-react';

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

export default function TrackCheckout() {
  const { trackId } = useParams();
  const [track, setTrack] = useState(null);
  const [trackCourses, setTrackCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [studentId, setStudentId] = useState('');

  // Admission Form
  const [form, setForm] = useState({
    full_name: '', phone: '', dob: '', gender: '', religion: '', qualification: '',
    city: '', address: '', session_type: '', learning_type: '', father_name: '', father_phone: '', father_cnic: ''
  });
  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // Documents
  const [docs, setDocs] = useState({ id_front: null, id_back: null, degree: null, bform: null });
  const [docPreviews, setDocPreviews] = useState({ id_front: null, id_back: null, degree: null, bform: null });
  const setDoc = (key, file) => {
    setDocs(prev => ({ ...prev, [key]: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setDocPreviews(prev => ({ ...prev, [key]: ev.target.result }));
    reader.readAsDataURL(file);
  };
  const removeDoc = (key) => { setDocs(prev => ({ ...prev, [key]: null })); setDocPreviews(prev => ({ ...prev, [key]: null })); };

  // Payment
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [admFeeFile, setAdmFeeFile] = useState(null);
  const [admFeePreview, setAdmFeePreview] = useState(null);
  const [instFeeFile, setInstFeeFile] = useState(null);
  const [instFeePreview, setInstFeePreview] = useState(null);

  useEffect(() => {
    Promise.all([
      getDiplomaTrack(trackId).then(r => r.data),
      getCourses().then(r => r.data)
    ]).then(([trackData, coursesData]) => {
      setTrack(trackData);
      const tCourses = (trackData?.courses || []).map(cId => coursesData.find(c => c.course_id === cId)).filter(Boolean);
      setTrackCourses(tCourses);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [trackId]);

  const handleFileSelect = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const totalCourseFee = trackCourses.reduce((s, c) => s + (c.price || 0), 0);
  const totalAdmissionFee = trackCourses.reduce((s, c) => s + (c.admission_fee || 0), 0);
  const grandTotal = totalCourseFee + totalAdmissionFee;
  const installment1 = Math.floor(totalCourseFee / 2);
  const installment2 = totalCourseFee - installment1;
  const payNow = totalAdmissionFee + installment1;

  const validateStep1 = () => {
    const required = ['full_name', 'phone', 'dob', 'gender', 'city', 'father_name', 'father_phone'];
    for (const f of required) { if (!form[f]?.trim()) { toast.error(`Please fill ${f.replace(/_/g, ' ')}`); return false; } }
    return true;
  };

  const handleEnroll = async () => {
    if (!selectedMethod) { toast.error('Select payment method'); return; }
    if (!admFeeFile) { toast.error('Upload Admission Fee Screenshot'); return; }
    if (!instFeeFile) { toast.error('Upload Fees Screenshot (1st Installment)'); return; }
    setEnrolling(true);
    try {
      const uploadDoc = async (file) => {
        if (!file) return '';
        const res = await studentUpload(file);
        return res.data.url;
      };
      const [idFrontUrl, idBackUrl, degreeUrl, bformUrl, admFeeUrl, instFeeUrl] = await Promise.all([
        uploadDoc(docs.id_front), uploadDoc(docs.id_back), uploadDoc(docs.degree), uploadDoc(docs.bform),
        uploadDoc(admFeeFile), uploadDoc(instFeeFile),
      ]);

      const formRes = await submitAdmissionForm({
        ...form, course_id: `diploma_${trackId}`,
        id_card_front_url: idFrontUrl, id_card_back_url: idBackUrl,
        last_degree_url: degreeUrl, bform_url: bformUrl, receipt_url: admFeeUrl,
      });
      setStudentId(formRes.data.student_id);

      let proofText = paymentRef || '';
      if (admFeeFile) proofText += (proofText ? ' | ' : '') + `Adm Fee: ${admFeeFile.name}`;
      if (instFeeFile) proofText += ` | 1st Inst: ${instFeeFile.name}`;
      await createDiplomaEnrollment({
        track_id: trackId,
        payment_method: selectedMethod,
        payment_proof: proofText,
        admission_fee_proof: admFeeUrl,
        installment_1_proof: instFeeUrl,
      });
      setSuccess(true);
      toast.success('Diploma enrollment submitted!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Enrollment failed');
    }
    setEnrolling(false);
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>;
  if (!track) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold text-white mb-4">Track Not Found</h2><Link to="/diploma-tracks" className="btn-gold px-6 py-3 text-sm">Browse Tracks</Link></div></div>;

  if (success) return (
    <div data-testid="track-checkout-success" className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111111] border border-[#27272A] rounded-2xl p-8 sm:p-10 max-w-md w-full text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-xl font-bold text-white mb-2">Diploma Enrollment Submitted!</h2>
        {studentId && <p className="text-xs text-[#D4AF37] font-mono mb-3">Student ID: {studentId}</p>}
        <p className="text-sm text-[#A1A1AA] mb-2"><span className="text-white font-semibold">{track.title}</span> ({trackCourses.length} courses)</p>
        <p className="text-sm text-[#A1A1AA] mb-6">Our admin team will verify your payment within 24 hours.</p>
        <div className="flex flex-col gap-3">
          <Link to="/dashboard" className="btn-gold text-center py-3 text-sm">Go to Dashboard</Link>
          <Link to="/diploma-tracks" className="btn-gold-outline text-center py-3 text-sm">Browse More Tracks</Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div data-testid="track-checkout-page" className="min-h-screen bg-[#050505] py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/diploma-tracks" className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Diploma Tracks
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Award className="w-6 h-6 text-[#D4AF37]" /> Complete Your Enrollment
        </h1>
        <p className="text-sm text-[#A1A1AA] mb-6">{track.title} - {trackCourses.length} courses</p>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {[{ n: 1, l: 'Admission Form' }, { n: 2, l: 'Documents' }, { n: 3, l: 'Payment' }, { n: 4, l: 'Confirm' }].map(({ n, l }) => (
            <div key={n} className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= n ? 'bg-[#D4AF37] text-black' : 'bg-[#27272A] text-[#A1A1AA]'}`}>
                {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step >= n ? 'text-white' : 'text-[#A1A1AA]'}`}>{l}</span>
              {n < 4 && <div className={`w-8 sm:w-12 h-[2px] ${step > n ? 'bg-[#D4AF37]' : 'bg-[#27272A]'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">

            {/* STEP 1: Admission Form */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-[#D4AF37]" /> Student Information</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={LABEL_CLS}>Full Name *</label><input data-testid="track-form-full_name" value={form.full_name} onChange={e => setField('full_name', e.target.value)} className={INPUT_CLS} placeholder="Full name" /></div>
                    <div><label className={LABEL_CLS}>Phone *</label><input data-testid="track-form-phone" value={form.phone} onChange={e => setField('phone', e.target.value)} className={INPUT_CLS} placeholder="03XX-XXXXXXX" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div><label className={LABEL_CLS}>Date of Birth *</label><input data-testid="track-form-dob" type="date" value={form.dob} onChange={e => setField('dob', e.target.value)} className={INPUT_CLS} /></div>
                    <div><label className={LABEL_CLS}>Gender *</label>
                      <select data-testid="track-form-gender" value={form.gender} onChange={e => setField('gender', e.target.value)} className={INPUT_CLS}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select>
                    </div>
                    <div><label className={LABEL_CLS}>Religion</label><input value={form.religion} onChange={e => setField('religion', e.target.value)} className={INPUT_CLS} placeholder="Religion" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={LABEL_CLS}>Qualification</label><input value={form.qualification} onChange={e => setField('qualification', e.target.value)} className={INPUT_CLS} placeholder="Last qualification" /></div>
                    <div><label className={LABEL_CLS}>City *</label><input data-testid="track-form-city" value={form.city} onChange={e => setField('city', e.target.value)} className={INPUT_CLS} placeholder="City" /></div>
                  </div>
                  <div><label className={LABEL_CLS}>Address</label><input value={form.address} onChange={e => setField('address', e.target.value)} className={INPUT_CLS} placeholder="Full address" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={LABEL_CLS}>Session Type</label>
                      <select value={form.session_type} onChange={e => setField('session_type', e.target.value)} className={INPUT_CLS}><option value="">Select</option><option>Morning</option><option>Evening</option><option>Weekend</option></select>
                    </div>
                    <div><label className={LABEL_CLS}>Learning Type</label>
                      <select value={form.learning_type} onChange={e => setField('learning_type', e.target.value)} className={INPUT_CLS}><option value="">Select</option><option>Online</option><option>Physical</option><option>Hybrid</option></select>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mt-4 flex items-center gap-2"><Shield className="w-5 h-5 text-[#D4AF37]" /> Parent / Guardian</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div><label className={LABEL_CLS}>Father's Name *</label><input data-testid="track-form-father_name" value={form.father_name} onChange={e => setField('father_name', e.target.value)} className={INPUT_CLS} placeholder="Father's name" /></div>
                    <div><label className={LABEL_CLS}>Father's Phone *</label><input data-testid="track-form-father_phone" value={form.father_phone} onChange={e => setField('father_phone', e.target.value)} className={INPUT_CLS} placeholder="03XX-XXXXXXX" /></div>
                    <div><label className={LABEL_CLS}>Father's CNIC</label><input value={form.father_cnic} onChange={e => setField('father_cnic', e.target.value)} className={INPUT_CLS} placeholder="XXXXX-XXXXXXX-X" /></div>
                  </div>
                </div>
                <button data-testid="track-step1-next" onClick={() => { if (validateStep1()) setStep(2); }} className="btn-gold px-6 py-2 text-xs mt-4">Next: Documents</button>
              </motion.div>
            )}

            {/* STEP 2: Documents */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-[#D4AF37]" /> Upload Documents</h3>
                <div className="grid grid-cols-2 gap-3">
                  <DocUpload label="ID Card (Front)" testId="track-doc-id-front" file={docs.id_front} preview={docPreviews.id_front} onSelect={f => setDoc('id_front', f)} onRemove={() => removeDoc('id_front')} />
                  <DocUpload label="ID Card (Back)" testId="track-doc-id-back" file={docs.id_back} preview={docPreviews.id_back} onSelect={f => setDoc('id_back', f)} onRemove={() => removeDoc('id_back')} />
                  <DocUpload label="Last Degree / Certificate" testId="track-doc-degree" file={docs.degree} preview={docPreviews.degree} onSelect={f => setDoc('degree', f)} onRemove={() => removeDoc('degree')} />
                  <DocUpload label="B-Form" testId="track-doc-bform" file={docs.bform} preview={docPreviews.bform} onSelect={f => setDoc('bform', f)} onRemove={() => removeDoc('bform')} />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(1)} className="btn-gold-outline px-5 py-2 text-xs">Back</button>
                  <button data-testid="track-step2-next" onClick={() => setStep(3)} className="btn-gold px-6 py-2 text-xs">Next: Payment</button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Payment */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#D4AF37]" /> Payment Method</h3>

                {/* Installment Info */}
                <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4 mb-5">
                  <p className="text-[10px] font-bold text-[#D4AF37] mb-2">FEE STRUCTURE (INSTALLMENT PLAN)</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-[#A1A1AA]">Total Admission Fees</span><span className="text-white">PKR {totalAdmissionFee.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-[#A1A1AA]">1st Installment (pay now)</span><span className="text-white">PKR {installment1.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-[#A1A1AA]">2nd Installment (due at halfway)</span><span className="text-[#71717A]">PKR {installment2.toLocaleString()}</span></div>
                    <div className="border-t border-[#27272A] pt-2 flex justify-between font-bold">
                      <span className="text-white">Total to Pay Now</span>
                      <span className="text-[#D4AF37]">PKR {payNow.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const sel = selectedMethod === method.id;
                    return (
                      <button key={method.id} data-testid={`track-payment-${method.id}`}
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
                            <p className="text-xs text-[#D4AF37] mt-2 font-semibold">Send PKR {payNow.toLocaleString()} to the above account.</p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Admission Fee Screenshot */}
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2"><Upload className="w-5 h-5 text-[#D4AF37]" /> Admission Fee Screenshot</h3>
                <div className="bg-[#111111] border border-[#27272A] rounded-xl p-4 mb-4">
                  {admFeePreview ? (
                    <div className="relative">
                      <img src={admFeePreview} alt="Admission Fee" className="w-full max-h-40 object-contain rounded-lg border border-[#27272A]" />
                      <button onClick={() => { setAdmFeeFile(null); setAdmFeePreview(null); }} className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                      <p className="text-[10px] text-green-400 mt-2">{admFeeFile?.name} uploaded</p>
                    </div>
                  ) : (
                    <label data-testid="track-upload-admission-fee" className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#27272A] rounded-xl cursor-pointer hover:border-[#D4AF37]/40 transition-colors">
                      <FileImage className="w-8 h-8 text-[#71717A] mb-2" />
                      <p className="text-xs text-white mb-0.5">Upload Admission Fee Screenshot</p>
                      <p className="text-[10px] text-[#71717A]">PNG, JPG, PDF up to 5MB</p>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileSelect(e, setAdmFeeFile, setAdmFeePreview)} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Fees Screenshot (1st Installment) */}
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2"><Upload className="w-5 h-5 text-[#D4AF37]" /> Fees Screenshot (1st Installment)</h3>
                <div className="bg-[#111111] border border-[#27272A] rounded-xl p-4 mb-4">
                  {instFeePreview ? (
                    <div className="relative">
                      <img src={instFeePreview} alt="1st Installment" className="w-full max-h-40 object-contain rounded-lg border border-[#27272A]" />
                      <button onClick={() => { setInstFeeFile(null); setInstFeePreview(null); }} className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                      <p className="text-[10px] text-green-400 mt-2">{instFeeFile?.name} uploaded</p>
                    </div>
                  ) : (
                    <label data-testid="track-upload-fees-screenshot" className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#27272A] rounded-xl cursor-pointer hover:border-[#D4AF37]/40 transition-colors">
                      <FileImage className="w-8 h-8 text-[#71717A] mb-2" />
                      <p className="text-xs text-white mb-0.5">Upload Fees Screenshot (1st Installment)</p>
                      <p className="text-[10px] text-[#71717A]">PNG, JPG, PDF up to 5MB</p>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileSelect(e, setInstFeeFile, setInstFeePreview)} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="mt-3">
                  <label className={LABEL_CLS}>Transaction ID (Optional)</label>
                  <input data-testid="track-payment-ref" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Reference number" className={INPUT_CLS} />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(2)} className="btn-gold-outline px-5 py-2 text-xs">Back</button>
                  <button data-testid="track-step3-next" onClick={() => { if (!selectedMethod) { toast.error('Select payment method'); return; } setStep(4); }} className="btn-gold px-6 py-2 text-xs">Next: Confirm</button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Confirm */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-[#D4AF37]" /> Review & Confirm</h3>
                <div className="space-y-4">
                  <div className="bg-[#111111] border border-[#27272A] rounded-xl p-4">
                    <p className="text-[10px] font-bold text-[#D4AF37] mb-2">STUDENT INFORMATION</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-[#71717A]">Name:</span> <span className="text-white">{form.full_name}</span></div>
                      <div><span className="text-[#71717A]">Phone:</span> <span className="text-white">{form.phone}</span></div>
                      <div><span className="text-[#71717A]">DOB:</span> <span className="text-white">{form.dob}</span></div>
                      <div><span className="text-[#71717A]">City:</span> <span className="text-white">{form.city}</span></div>
                      <div><span className="text-[#71717A]">Father:</span> <span className="text-white">{form.father_name}</span></div>
                      <div><span className="text-[#71717A]">Payment:</span> <span className="text-white capitalize">{selectedMethod?.replace('_', ' ')}</span></div>
                    </div>
                  </div>
                  <div className="bg-[#111111] border border-[#27272A] rounded-xl p-4">
                    <p className="text-[10px] font-bold text-[#D4AF37] mb-2">DOCUMENTS</p>
                    <div className="grid grid-cols-4 gap-2 text-[10px]">
                      <div className={docs.id_front ? 'text-green-400' : 'text-[#71717A]'}>ID Front {docs.id_front ? '✓' : '✗'}</div>
                      <div className={docs.id_back ? 'text-green-400' : 'text-[#71717A]'}>ID Back {docs.id_back ? '✓' : '✗'}</div>
                      <div className={docs.degree ? 'text-green-400' : 'text-[#71717A]'}>Degree {docs.degree ? '✓' : '✗'}</div>
                      <div className={docs.bform ? 'text-green-400' : 'text-[#71717A]'}>B-Form {docs.bform ? '✓' : '✗'}</div>
                    </div>
                  </div>
                  <div className="bg-[#111111] border border-[#27272A] rounded-xl p-4">
                    <p className="text-[10px] font-bold text-[#D4AF37] mb-2">FEE SCREENSHOTS</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className={admFeeFile ? 'text-green-400' : 'text-[#71717A]'}>Admission Fee {admFeeFile ? '✓' : '✗'}</div>
                      <div className={instFeeFile ? 'text-green-400' : 'text-[#71717A]'}>1st Installment {instFeeFile ? '✓' : '✗'}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(3)} className="btn-gold-outline px-5 py-2 text-xs">Back</button>
                  <button data-testid="track-confirm-btn" onClick={handleEnroll} disabled={enrolling} className="btn-gold px-8 py-2 text-xs disabled:opacity-50">
                    {enrolling ? 'Submitting...' : 'Confirm Enrollment'}
                  </button>
                </div>
              </motion.div>
            )}

          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#111111] border border-[#27272A] rounded-xl p-5 sticky top-8">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-[#D4AF37]" /> {track.title}</h3>
              <div className="space-y-2 mb-4">
                {trackCourses.map(c => (
                  <div key={c.course_id} className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded-lg">
                    <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-[#D4AF37]" /> {c.title}</span>
                    <span className="text-[10px] text-white">PKR {((c.price || 0) + (c.admission_fee || 0)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#27272A] pt-3 space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-[#A1A1AA]">Admission Fees</span><span className="text-white">PKR {totalAdmissionFee.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#A1A1AA]">1st Installment</span><span className="text-white">PKR {installment1.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#71717A]">2nd Installment (later)</span><span className="text-[#71717A]">PKR {installment2.toLocaleString()}</span></div>
                <div className="border-t border-[#27272A] pt-1.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-white">Pay Now</span>
                    <span className="text-lg font-bold text-[#D4AF37]" data-testid="track-pay-now">PKR {payNow.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[#71717A]">Total Diploma Fee</span>
                    <span className="text-[10px] text-[#71717A]">PKR {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-[10px] text-[#A1A1AA]">
                <Clock className="w-3 h-3" /> Payment verified within 24 hours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
