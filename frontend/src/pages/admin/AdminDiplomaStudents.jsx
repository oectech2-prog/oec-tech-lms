import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDiplomaEnrollments, updateDiplomaEnrollmentStatus, adminApproveDiplomaInstallment2 } from '../../lib/api';
import { toast } from 'sonner';
import { GraduationCap, Users, BookOpen, CreditCard, CheckCircle2, XCircle, Clock, BarChart3, LogOut, Search, Eye, Filter, FileText, X, Image, Award } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const NAV = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/enrollments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/admissions', icon: FileText, label: 'Admissions' },
  { to: '/admin/diploma-students', icon: Award, label: 'Diploma' },
];

export default function AdminDiplomaStudents() {
  const { logout } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [screenshotModal, setScreenshotModal] = useState(null);

  const loadEnrollments = useCallback(() => {
    getAdminDiplomaEnrollments().then(r => { setEnrollments(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadEnrollments(); }, [loadEnrollments]);

  const handleStatus = async (id, status) => {
    const label = status === 'completed' ? 'approve' : 'reject';
    if (!window.confirm(`${label} this diploma payment?`)) return;
    try {
      await updateDiplomaEnrollmentStatus(id, { payment_status: status });
      toast.success(`Diploma payment ${label}d!`);
      loadEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    }
  };

  const handleInst2Status = async (id, status) => {
    const label = status === 'completed' ? 'approve' : 'reject';
    if (!window.confirm(`${label} diploma 2nd installment?`)) return;
    try {
      await adminApproveDiplomaInstallment2(id, { payment_status: status });
      toast.success(`Diploma 2nd installment ${label}d!`);
      loadEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    }
  };

  const filtered = enrollments.filter(e => {
    const status = e.enrollment?.payment_status;
    if (filter !== 'all' && status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (e.user?.name?.toLowerCase().includes(q) || e.track?.title?.toLowerCase().includes(q) || e.user?.email?.toLowerCase().includes(q));
    }
    return true;
  });

  const counts = {
    all: enrollments.length,
    pending: enrollments.filter(e => e.enrollment?.payment_status === 'pending').length,
    completed: enrollments.filter(e => e.enrollment?.payment_status === 'completed').length,
    rejected: enrollments.filter(e => e.enrollment?.payment_status === 'rejected').length,
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  return (
    <div data-testid="admin-diploma-students-page" className="min-h-screen bg-[#050505] flex">
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-5 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${to === '/admin/diploma-students' ? 'text-[#D4AF37] bg-white/5' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#27272A]">
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 w-full"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
        <div className="md:hidden flex items-center justify-between mb-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
          </div>
          <div className="flex gap-1">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} className={`p-2 rounded-lg text-[10px] whitespace-nowrap ${to === '/admin/diploma-students' ? 'text-[#D4AF37] bg-white/5' : 'text-[#A1A1AA] hover:bg-white/5'}`}>{label}</Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Award className="w-5 h-5 text-[#D4AF37]" /> Diploma Students</h1>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input data-testid="diploma-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-[#111111] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'all', label: 'All', color: '' },
            { key: 'pending', label: 'Pending', color: 'text-yellow-400' },
            { key: 'completed', label: 'Approved', color: 'text-green-400' },
            { key: 'rejected', label: 'Rejected', color: 'text-red-400' },
          ].map(f => (
            <button key={f.key} data-testid={`diploma-filter-${f.key}`} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === f.key ? 'bg-[#D4AF37] text-black' : 'bg-[#111111] text-[#A1A1AA] hover:bg-white/5'}`}>
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#A1A1AA] text-sm">No diploma enrollments found</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(({ enrollment, user, track }) => {
              const status = enrollment?.payment_status;
              const statusColor = status === 'completed' ? 'bg-green-500/10 text-green-400' : status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400';
              const StatusIcon = status === 'completed' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock;
              return (
                <div key={enrollment?.enrollment_id} data-testid={`diploma-enrollment-${enrollment?.enrollment_id}`} className="bg-[#111111] border border-[#27272A] rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] text-sm font-bold shrink-0">
                      {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{user?.name || 'Unknown'}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}>
                          <StatusIcon className="w-3 h-3" /> {status}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#A1A1AA]">{user?.email}</p>
                      <p className="text-xs text-[#D4AF37] font-semibold mt-1 flex items-center gap-1"><Award className="w-3 h-3" /> {track?.title || enrollment?.track_id}</p>
                      <div className="flex items-center gap-4 text-[10px] text-[#A1A1AA] mt-1 flex-wrap">
                        <span>Method: {enrollment?.payment_method?.replace('_', ' ')}</span>
                        <span>Date: {formatDate(enrollment?.enrolled_at)}</span>
                        <span>Adm: PKR {(enrollment?.admission_fee || 0).toLocaleString()}</span>
                      </div>
                      {/* Installment Status */}
                      <div className="flex items-center gap-3 mt-2 text-[10px] flex-wrap">
                        <span className={enrollment?.installment_1_status === 'completed' ? 'text-green-400' : 'text-yellow-400'}>
                          1st Inst: PKR {(enrollment?.installment_1_amount || 0).toLocaleString()} ({enrollment?.installment_1_status || 'pending'})
                        </span>
                        <span className={enrollment?.installment_2_status === 'completed' ? 'text-green-400' : enrollment?.installment_2_status === 'submitted' ? 'text-blue-400' : 'text-[#71717A]'}>
                          2nd Inst: PKR {(enrollment?.installment_2_amount || 0).toLocaleString()} ({enrollment?.installment_2_status || 'pending'})
                        </span>
                      </div>
                      {/* Fee Screenshots */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {enrollment?.admission_fee_proof && (
                          <button data-testid={`dip-view-adm-fee-${enrollment?.enrollment_id}`} onClick={() => setScreenshotModal({ url: enrollment.admission_fee_proof, label: 'Admission Fee Screenshot' })}
                            className="flex items-center gap-1 px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded text-[10px] font-semibold hover:bg-[#D4AF37]/20 transition-colors">
                            <Image className="w-3 h-3" /> Adm Fee
                          </button>
                        )}
                        {enrollment?.installment_1_proof && (
                          <button data-testid={`dip-view-inst1-${enrollment?.enrollment_id}`} onClick={() => setScreenshotModal({ url: enrollment.installment_1_proof, label: '1st Installment Screenshot' })}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] font-semibold hover:bg-blue-500/20 transition-colors">
                            <Image className="w-3 h-3" /> 1st Inst
                          </button>
                        )}
                        {enrollment?.installment_2_proof && (
                          <button data-testid={`dip-view-inst2-${enrollment?.enrollment_id}`} onClick={() => setScreenshotModal({ url: enrollment.installment_2_proof, label: '2nd Installment Screenshot' })}
                            className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded text-[10px] font-semibold hover:bg-green-500/20 transition-colors">
                            <Image className="w-3 h-3" /> 2nd Inst
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {status === 'pending' && (
                        <>
                          <button data-testid={`dip-approve-${enrollment?.enrollment_id}`} onClick={() => handleStatus(enrollment.enrollment_id, 'completed')} className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition-colors">
                            Approve
                          </button>
                          <button data-testid={`dip-reject-${enrollment?.enrollment_id}`} onClick={() => handleStatus(enrollment.enrollment_id, 'rejected')} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      {status === 'completed' && (
                        <div className="text-right space-y-1">
                          <span className="text-[10px] text-green-400 block">Approved {enrollment.approved_at ? formatDate(enrollment.approved_at) : ''}</span>
                          {enrollment?.installment_2_status === 'submitted' && (
                            <div className="flex gap-1">
                              <button data-testid={`dip-approve-inst2-${enrollment?.enrollment_id}`} onClick={() => handleInst2Status(enrollment.enrollment_id, 'completed')}
                                className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-[10px] font-semibold hover:bg-green-500/20">
                                Approve 2nd
                              </button>
                              <button data-testid={`dip-reject-inst2-${enrollment?.enrollment_id}`} onClick={() => handleInst2Status(enrollment.enrollment_id, 'rejected')}
                                className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-[10px] font-semibold hover:bg-red-500/20">
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {status === 'rejected' && (
                        <button onClick={() => handleStatus(enrollment.enrollment_id, 'completed')} className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs hover:bg-green-500/20 transition-colors">
                          Re-approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      {/* Screenshot Modal */}
      {screenshotModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onClick={() => setScreenshotModal(null)}>
          <div className="bg-[#111111] border border-[#27272A] rounded-2xl w-full max-w-lg p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">{screenshotModal.label}</h3>
              <button data-testid="close-dip-screenshot-modal" onClick={() => setScreenshotModal(null)} className="text-[#A1A1AA] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <img src={screenshotModal.url} alt={screenshotModal.label} className="w-full max-h-[70vh] object-contain rounded-lg border border-[#27272A]" />
          </div>
        </div>
      )}
    </div>
  );
}
