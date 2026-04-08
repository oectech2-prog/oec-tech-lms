import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { getMyCourses, getNotifications, submitInstallment2, studentUpload } from '../lib/api';
import { GraduationCap, BookOpen, BarChart3, User, LogOut, Shield, Clock, CheckCircle2, AlertCircle, ArrowRight, Home, Award, Upload, X, FileImage, Bell } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showInstModal, setShowInstModal] = useState(null);
  const [instFile, setInstFile] = useState(null);
  const [instPreview, setInstPreview] = useState(null);
  const [instMethod, setInstMethod] = useState('');
  const [instRef, setInstRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyCourses().then(r => { setEnrolledCourses(r.data); setLoading(false); }).catch(() => setLoading(false));
    getNotifications().then(r => setNotifications(r.data)).catch(() => {});
  }, []);

  const handleInstFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setInstFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setInstPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitInstallment2 = async () => {
    if (!instFile) { toast.error('Upload fee screenshot'); return; }
    setSubmitting(true);
    try {
      const res = await studentUpload(instFile);
      await submitInstallment2(showInstModal.enrollment_id, {
        proof_url: res.data.url,
        payment_method: instMethod,
        reference: instRef,
      });
      toast.success('2nd installment submitted for review!');
      setShowInstModal(null);
      setInstFile(null); setInstPreview(null); setInstMethod(''); setInstRef('');
      getNotifications().then(r => setNotifications(r.data)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed');
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const activeCourses = enrolledCourses.filter(e => e.enrollment.payment_status === 'completed');
  const pendingCourses = enrolledCourses.filter(e => e.enrollment.payment_status === 'pending');

  return (
    <div data-testid="student-dashboard" className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-6 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { to: '/dashboard', icon: BarChart3, label: 'Dashboard', active: true },
            { to: '/profile', icon: User, label: 'Profile' },
            { to: '/', icon: Home, label: 'Home' },
          ].map(({ to, icon: Icon, label, active }) => (
            <Link key={to} to={to} data-testid={`sidebar-${label.toLowerCase()}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" data-testid="sidebar-admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
              <Shield className="w-5 h-5" />
              Admin Panel
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-[#27272A]">
          <button onClick={handleLogout} data-testid="sidebar-logout" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">HDA</span>
          </Link>
          <div className="flex gap-2">
            {user?.role === 'admin' && (
              <Link to="/admin" className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg"><Shield className="w-5 h-5" /></Link>
            )}
            <Link to="/profile" className="p-2 text-[#A1A1AA] hover:bg-white/5 rounded-lg"><User className="w-5 h-5" /></Link>
            <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-[#A1A1AA]">Continue your learning journey. Track your progress and complete assignments.</p>
        </div>

        {/* 2nd Installment Notifications */}
        {notifications.filter(n => n.type === 'installment_2_due').length > 0 && (
          <div className="mb-6 space-y-3">
            {notifications.filter(n => n.type === 'installment_2_due').map(n => (
              <div key={n.enrollment_id} data-testid={`installment-notification-${n.enrollment_id}`}
                className="bg-[#111111] border border-[#D4AF37]/40 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">2nd Installment Due - {n.course_title}</p>
                    <p className="text-xs text-[#A1A1AA]">PKR {n.amount?.toLocaleString()} - Please submit your fee screenshot</p>
                  </div>
                </div>
                <button data-testid={`pay-installment-${n.enrollment_id}`}
                  onClick={() => setShowInstModal(n)}
                  className="btn-gold px-4 py-2 text-xs shrink-0">Pay Now</button>
              </div>
            ))}
          </div>
        )}

        {notifications.filter(n => n.type === 'installment_2_pending_approval').length > 0 && (
          <div className="mb-6 space-y-3">
            {notifications.filter(n => n.type === 'installment_2_pending_approval').map(n => (
              <div key={n.enrollment_id} className="bg-[#111111] border border-yellow-600/30 rounded-xl p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">2nd Installment Under Review - {n.course_title}</p>
                  <p className="text-xs text-[#A1A1AA]">PKR {n.amount?.toLocaleString()} - Waiting for admin approval</p>
                </div>
                <span className="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full shrink-0 ml-auto">Pending</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Active Courses', value: activeCourses.length, icon: BookOpen },
            { label: 'Pending Payments', value: pendingCourses.length, icon: Clock },
            { label: 'Completed', value: activeCourses.filter(c => c.enrollment.progress === 100).length, icon: CheckCircle2 },
            { label: 'Total Enrolled', value: enrolledCourses.length, icon: BarChart3 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
              <Icon className="w-5 h-5 text-[#D4AF37] mb-2" />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-[#A1A1AA]">{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Active Courses */}
            {activeCourses.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-white mb-6">My Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeCourses.map(({ enrollment, course }) => (
                    <Link key={enrollment.enrollment_id} to={`/my-course/${enrollment.enrollment_id}`} data-testid={`enrolled-course-${enrollment.enrollment_id}`}
                      className="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all group">
                      <div className="aspect-[3/2] overflow-hidden bg-[#1A1A1A]">
                        <img src={course.image_url} alt={course.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">{course.title}</h3>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-[#A1A1AA] mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2 bg-[#27272A]" />
                        </div>
                        <span className="text-xs text-[#D4AF37] flex items-center gap-1">
                          Continue Learning <ArrowRight className="w-3 h-3" />
                        </span>
                        {enrollment.progress === 100 && (
                          <Link
                            to={`/certificate/${enrollment.enrollment_id}`}
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`certificate-${enrollment.enrollment_id}`}
                            className="text-xs text-green-400 flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-full hover:bg-green-500/20 transition-colors"
                          >
                            <Award className="w-3 h-3" /> Certificate
                          </Link>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Payment */}
            {pendingCourses.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-white mb-6">Pending Payment</h2>
                <div className="space-y-4">
                  {pendingCourses.map(({ enrollment, course }) => (
                    <div key={enrollment.enrollment_id} className="bg-[#111111] border border-yellow-600/30 rounded-xl p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <div>
                          <h3 className="text-sm font-bold text-white">{course.title}</h3>
                          <p className="text-xs text-[#A1A1AA]">Payment via {enrollment.payment_method} - awaiting confirmation</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Courses */}
            {enrolledCourses.length === 0 && (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-[#27272A] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Courses Yet</h3>
                <p className="text-sm text-[#A1A1AA] mb-6">Start your learning journey by enrolling in a course.</p>
                <Link to="/courses" data-testid="browse-courses-btn" className="btn-gold px-6 py-3 text-sm">Browse Courses</Link>
              </div>
            )}
          </>
        )}
      </main>

      {/* 2nd Installment Submit Modal */}
      {showInstModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setShowInstModal(null)}>
          <div className="bg-[#111111] border border-[#27272A] rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Submit 2nd Installment</h3>
              <button onClick={() => setShowInstModal(null)} className="text-[#A1A1AA] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-[#0A0A0A] rounded-xl p-4 mb-4">
              <p className="text-xs text-[#A1A1AA]">Course: <span className="text-white font-semibold">{showInstModal.course_title}</span></p>
              <p className="text-xs text-[#A1A1AA] mt-1">Amount: <span className="text-[#D4AF37] font-bold">PKR {showInstModal.amount?.toLocaleString()}</span></p>
            </div>

            <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Payment Method</label>
            <select data-testid="inst2-method" value={instMethod} onChange={e => setInstMethod(e.target.value)}
              className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2.5 text-xs text-white mb-3 focus:border-[#D4AF37] focus:outline-none">
              <option value="">Select</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>

            <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Fees Screenshot (2nd Installment)</label>
            <div className="mb-3">
              {instPreview ? (
                <div className="relative">
                  <img src={instPreview} alt="2nd Installment" className="w-full max-h-40 object-contain rounded-lg border border-[#27272A]" />
                  <button onClick={() => { setInstFile(null); setInstPreview(null); }} className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                  <p className="text-[10px] text-green-400 mt-1">{instFile?.name}</p>
                </div>
              ) : (
                <label data-testid="upload-inst2-screenshot" className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#27272A] rounded-xl cursor-pointer hover:border-[#D4AF37]/40 transition-colors">
                  <FileImage className="w-8 h-8 text-[#71717A] mb-1" />
                  <p className="text-xs text-white">Upload Fee Screenshot</p>
                  <p className="text-[10px] text-[#71717A]">PNG, JPG, PDF up to 5MB</p>
                  <input type="file" accept="image/*,.pdf" onChange={handleInstFileSelect} className="hidden" />
                </label>
              )}
            </div>

            <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Transaction ID (Optional)</label>
            <input data-testid="inst2-reference" value={instRef} onChange={e => setInstRef(e.target.value)} placeholder="Reference number"
              className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2.5 text-xs text-white mb-4 focus:border-[#D4AF37] focus:outline-none" />

            <button data-testid="submit-inst2-btn" onClick={handleSubmitInstallment2} disabled={submitting}
              className="w-full btn-gold py-3 text-sm disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit 2nd Installment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
