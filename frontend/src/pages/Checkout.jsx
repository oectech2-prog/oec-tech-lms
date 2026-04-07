import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCourse, enrollInCourse } from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, CreditCard, Building2, Smartphone, Upload, FileImage, X, ArrowRight, Shield, Clock } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'jazzcash', name: 'JazzCash', icon: Smartphone, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', account: 'JazzCash Account: 0300-1234567' },
  { id: 'easypaisa', name: 'EasyPaisa', icon: Smartphone, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', account: 'EasyPaisa Account: 0345-1234567' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', account: 'HBL Account: 1234-5678-9012\nAccount Title: OEC Tech Institute\nBranch: Main Branch, Lahore' },
];

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: select method, 2: upload receipt, 3: confirm
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getCourse(courseId).then(r => { setCourse(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [courseId]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEnroll = async () => {
    if (!selectedMethod) { toast.error('Please select a payment method'); return; }
    setEnrolling(true);
    try {
      // Build payment proof string with receipt info
      let proofText = paymentRef || '';
      if (receiptFile) {
        proofText += (proofText ? ' | ' : '') + `Receipt uploaded: ${receiptFile.name}`;
      }
      await enrollInCourse({ course_id: courseId, payment_method: selectedMethod, payment_proof: proofText });
      setSuccess(true);
      toast.success('Enrollment submitted with fee receipt! Awaiting admin confirmation.');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Enrollment failed';
      toast.error(msg);
    }
    setEnrolling(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (success) return (
    <div data-testid="checkout-success" className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel rounded-2xl p-10 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-3">Enrollment Submitted!</h2>
        <p className="text-sm text-[#A1A1AA] mb-2">Your enrollment for <span className="text-white font-semibold">{course?.title}</span> has been submitted.</p>
        {receiptFile && (
          <p className="text-xs text-green-400 mb-2">Fee receipt uploaded: {receiptFile.name}</p>
        )}
        <p className="text-sm text-[#A1A1AA] mb-6">Our admin team will verify your payment and activate your course access within 24 hours.</p>
        <div className="flex flex-col gap-3">
          <Link to="/dashboard" className="btn-gold text-center py-3 text-sm">Go to Dashboard</Link>
          <Link to="/courses" className="btn-gold-outline text-center py-3 text-sm">Browse More Courses</Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div data-testid="checkout-page" className="min-h-screen bg-[#050505] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to={`/courses/${courseId}`} className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Course
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Complete Your Enrollment
        </motion.h1>

        {/* Steps Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { num: 1, label: 'Payment Method' },
            { num: 2, label: 'Upload Receipt' },
            { num: 3, label: 'Confirm' },
          ].map(({ num, label }) => (
            <div key={num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= num ? 'bg-[#D4AF37] text-black' : 'bg-[#27272A] text-[#A1A1AA]'
              }`}>
                {step > num ? <CheckCircle2 className="w-4 h-4" /> : num}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step >= num ? 'text-white' : 'text-[#A1A1AA]'}`}>{label}</span>
              {num < 3 && <div className={`w-8 sm:w-16 h-[2px] ${step > num ? 'bg-[#D4AF37]' : 'bg-[#27272A]'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Step 1: Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: step >= 1 ? 1 : 0.5, y: 0 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D4AF37]" /> Select Payment Method
              </h3>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      data-testid={`payment-${method.id}`}
                      onClick={() => { setSelectedMethod(method.id); setStep(Math.max(step, 2)); }}
                      className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? `${method.bg} ${method.border} border shadow-lg`
                          : 'bg-[#111111] border-[#27272A] hover:border-[#D4AF37]/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${method.color}`} />
                        <span className="text-sm font-bold text-white">{method.name}</span>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className={`w-4 h-4 ${method.color} ml-auto`} />
                          </motion.div>
                        )}
                      </div>
                      {isSelected && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <div className="mt-3 p-3 bg-black/30 rounded-lg">
                            <p className="text-xs text-[#A1A1AA] whitespace-pre-line">{method.account}</p>
                            <p className="text-xs text-[#D4AF37] mt-2 font-semibold">Send PKR {course?.price?.toLocaleString()} to the above account.</p>
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Step 2: Upload Fee Receipt */}
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#D4AF37]" /> Upload Fee Receipt
                </h3>
                <div className="bg-[#111111] border border-[#27272A] rounded-xl p-6">
                  {receiptPreview ? (
                    <div className="relative">
                      <img src={receiptPreview} alt="Receipt" className="w-full max-h-64 object-contain rounded-lg border border-[#27272A]" />
                      <button
                        data-testid="remove-receipt-btn"
                        onClick={removeReceipt}
                        className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-green-400 mt-3 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {receiptFile?.name} uploaded
                      </p>
                    </div>
                  ) : (
                    <label
                      data-testid="upload-receipt-area"
                      className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-[#27272A] rounded-xl cursor-pointer hover:border-[#D4AF37]/50 transition-colors group"
                    >
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <FileImage className="w-12 h-12 text-[#A1A1AA] group-hover:text-[#D4AF37] mb-3 transition-colors" />
                      </motion.div>
                      <p className="text-sm text-white font-medium mb-1">Click to upload fee receipt</p>
                      <p className="text-xs text-[#A1A1AA]">PNG, JPG, PDF up to 5MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* Transaction Reference */}
                  <div className="mt-4">
                    <label className="text-xs font-medium text-[#A1A1AA] mb-2 block">Transaction ID / Reference (Optional)</label>
                    <input
                      data-testid="payment-reference"
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="Enter transaction ID or reference number"
                      className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#A1A1AA] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                    />
                  </div>

                  <button
                    data-testid="proceed-to-confirm"
                    onClick={() => setStep(3)}
                    disabled={!receiptFile && !paymentRef}
                    className="mt-4 btn-gold px-6 py-2.5 text-sm inline-flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Proceed to Confirm <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111111] border border-[#27272A] rounded-xl p-6 sticky top-8"
            >
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
              {course && (
                <>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-[#1A1A1A]">
                    <img src={course.image_url} alt={course.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{course.title}</h4>
                  <p className="text-xs text-[#A1A1AA] mb-4">{course.duration} - {course.level}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Lifetime Access
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> {course.weeks?.length} Weeks of Content
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Assignments & Final Project
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                      <Shield className="w-3.5 h-3.5 text-[#D4AF37]" /> WhatsApp Community Access
                    </div>
                  </div>

                  <div className="border-t border-[#27272A] pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A1A1AA]">Course Price</span>
                      <span className="text-white">PKR {course.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A1A1AA]">Access</span>
                      <span className="text-green-400">Lifetime</span>
                    </div>
                    <div className="border-t border-[#27272A] pt-2 flex justify-between">
                      <span className="text-sm font-bold text-white">Total</span>
                      <span className="text-xl font-bold text-[#D4AF37]">PKR {course.price?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Confirm Button - Only visible at step 3 */}
                  {step >= 3 && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid="confirm-enrollment-btn"
                      onClick={handleEnroll}
                      disabled={enrolling || !selectedMethod}
                      className="w-full btn-gold mt-4 py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 animate-gold-pulse"
                    >
                      <CreditCard className="w-4 h-4" />
                      {enrolling ? 'Processing...' : 'Confirm Enrollment'}
                    </motion.button>
                  )}

                  <div className="flex items-center gap-2 mt-4 text-[10px] text-[#A1A1AA]">
                    <Clock className="w-3 h-3" />
                    Payment verified within 24 hours
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
