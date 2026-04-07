import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourse, enrollInCourse } from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, CreditCard, Building2, Smartphone } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'jazzcash', name: 'JazzCash', icon: Smartphone, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', account: 'JazzCash Account: 0300-1234567' },
  { id: 'easypaisa', name: 'EasyPaisa', icon: Smartphone, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', account: 'EasyPaisa Account: 0345-1234567' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', account: 'HBL Account: 1234-5678-9012\nAccount Title: Hussnain Digital Academy\nBranch: Main Branch, Lahore' },
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

  useEffect(() => {
    getCourse(courseId).then(r => { setCourse(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [courseId]);

  const handleEnroll = async () => {
    if (!selectedMethod) { toast.error('Please select a payment method'); return; }
    setEnrolling(true);
    try {
      await enrollInCourse({ course_id: courseId, payment_method: selectedMethod, payment_proof: paymentRef });
      setSuccess(true);
      toast.success('Enrollment submitted! Awaiting payment confirmation.');
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
      <div className="glass-panel rounded-2xl p-10 max-w-md w-full text-center">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">Enrollment Submitted!</h2>
        <p className="text-sm text-[#A1A1AA] mb-2">Your enrollment for <span className="text-white font-semibold">{course?.title}</span> has been submitted.</p>
        <p className="text-sm text-[#A1A1AA] mb-6">Our team will verify your payment and activate your course access within 24 hours.</p>
        <div className="flex flex-col gap-3">
          <Link to="/dashboard" className="btn-gold text-center py-3 text-sm">Go to Dashboard</Link>
          <Link to="/courses" className="btn-gold-outline text-center py-3 text-sm">Browse More Courses</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div data-testid="checkout-page" className="min-h-screen bg-[#050505] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to={`/courses/${courseId}`} className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </Link>

        <h1 className="text-2xl font-bold text-white mb-8">Complete Your Enrollment</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Payment Methods */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Select Payment Method</h3>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      data-testid={`payment-${method.id}`}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full text-left p-5 rounded-xl border transition-all ${
                        isSelected
                          ? `${method.bg} ${method.border} border`
                          : 'bg-[#111111] border-[#27272A] hover:border-[#D4AF37]/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${method.color}`} />
                        <span className="text-sm font-bold text-white">{method.name}</span>
                        {isSelected && <CheckCircle2 className={`w-4 h-4 ${method.color} ml-auto`} />}
                      </div>
                      {isSelected && (
                        <div className="mt-3 p-3 bg-black/30 rounded-lg">
                          <p className="text-xs text-[#A1A1AA] whitespace-pre-line">{method.account}</p>
                          <p className="text-xs text-[#D4AF37] mt-2">Send PKR {course?.price?.toLocaleString()} to the above account.</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedMethod && (
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Payment Reference / Transaction ID (Optional)</h3>
                <input
                  data-testid="payment-reference"
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Enter transaction ID or reference number"
                  className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#A1A1AA] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-[#111111] border border-[#27272A] rounded-xl p-6 sticky top-8">
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
              {course && (
                <>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-[#1A1A1A]">
                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{course.title}</h4>
                  <p className="text-xs text-[#A1A1AA] mb-4">{course.duration} - {course.level}</p>
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
                  <button
                    data-testid="confirm-enrollment-btn"
                    onClick={handleEnroll}
                    disabled={enrolling || !selectedMethod}
                    className="w-full btn-gold mt-4 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4" />
                    {enrolling ? 'Processing...' : 'Confirm Enrollment'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
