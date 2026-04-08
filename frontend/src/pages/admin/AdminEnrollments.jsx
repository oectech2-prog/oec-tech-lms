import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminEnrollments, updateEnrollmentStatus } from '../../lib/api';
import { toast } from 'sonner';
import { GraduationCap, Users, BookOpen, CreditCard, CheckCircle2, XCircle, Clock, BarChart3, LogOut, Search, Eye, Filter } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const NAV = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/enrollments', icon: CreditCard, label: 'Payments' },
];

export default function AdminEnrollments() {
  const { logout } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [receiptModal, setReceiptModal] = useState(null);

  const loadEnrollments = useCallback(() => {
    setLoading(true);
    getAdminEnrollments().then(r => { setEnrollments(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadEnrollments(); }, [loadEnrollments]);

  const handleStatus = async (id, status) => {
    const label = status === 'completed' ? 'approve' : 'reject';
    if (!window.confirm(`${label} this payment?`)) return;
    try {
      await updateEnrollmentStatus(id, { payment_status: status });
      toast.success(`Payment ${label}d!`);
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
      return (e.user?.name?.toLowerCase().includes(q) || e.course?.title?.toLowerCase().includes(q) || e.user?.email?.toLowerCase().includes(q));
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
    <div data-testid="admin-enrollments-page" className="min-h-screen bg-[#050505] flex">
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-5 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">Admin <span className="text-[#D4AF37]">Panel</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${to === '/admin/enrollments' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#27272A]">
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 w-full"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Payments & Enrollments</h1>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input data-testid="enrollment-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-[#111111] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All', color: '' },
            { key: 'pending', label: 'Pending', color: 'text-yellow-400' },
            { key: 'completed', label: 'Approved', color: 'text-green-400' },
            { key: 'rejected', label: 'Rejected', color: 'text-red-400' },
          ].map(f => (
            <button key={f.key} data-testid={`filter-${f.key}`} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.key ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-[#111111] text-[#A1A1AA] hover:bg-white/5'}`}>
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#A1A1AA] text-sm">No enrollments found</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(({ enrollment, user, course }) => {
              const status = enrollment?.payment_status;
              const StatusIcon = status === 'completed' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock;
              const statusColor = status === 'completed' ? 'text-green-400 bg-green-500/10' : status === 'rejected' ? 'text-red-400 bg-red-500/10' : 'text-yellow-400 bg-yellow-500/10';
              return (
                <div key={enrollment?.enrollment_id} data-testid={`enrollment-row-${enrollment?.enrollment_id}`} className="bg-[#111111] border border-[#27272A] rounded-xl p-4">
                  <div className="flex items-start gap-4">
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
                      <p className="text-xs text-white mt-1">{course?.title || enrollment?.course_id}</p>
                      <div className="flex items-center gap-4 text-[10px] text-[#A1A1AA] mt-1">
                        <span>Method: {enrollment?.payment_method?.replace('_', ' ')}</span>
                        <span>Date: {formatDate(enrollment?.enrolled_at)}</span>
                        <span>Amount: PKR {((course?.price || 0) + (course?.admission_fee || 0)).toLocaleString()}</span>
                      </div>
                      {enrollment?.payment_proof && (
                        <p className="text-[10px] text-[#D4AF37] mt-1 truncate">Proof: {enrollment.payment_proof}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {status === 'pending' && (
                        <>
                          <button data-testid={`approve-${enrollment?.enrollment_id}`} onClick={() => handleStatus(enrollment.enrollment_id, 'completed')} className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition-colors">
                            Approve
                          </button>
                          <button data-testid={`reject-${enrollment?.enrollment_id}`} onClick={() => handleStatus(enrollment.enrollment_id, 'rejected')} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      {status === 'completed' && (
                        <span className="text-[10px] text-green-400">Approved {enrollment.approved_at ? formatDate(enrollment.approved_at) : ''}</span>
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
    </div>
  );
}
