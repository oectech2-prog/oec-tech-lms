import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getDefaulters, deactivateStudent, activateStudent } from '../../lib/api';
import { toast } from 'sonner';
import { GraduationCap, Users, BookOpen, CreditCard, BarChart3, LogOut, FileText, Award, AlertTriangle, CheckCircle2, XCircle, Search, X, Image , Video} from 'lucide-react';
import { useAuth } from '../../lib/auth';

const NAV = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/enrollments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/admissions', icon: FileText, label: 'Admissions' },
  { to: '/admin/diploma-students', icon: Award, label: 'Diploma' },
  { to: '/admin/defaulters', icon: AlertTriangle, label: 'Defaulters' },
  { to: '/admin/assignments', icon: FileText, label: 'Assignments' },
  { to: '/admin/video-testimonials', icon: Video, label: 'Videos' },
  { to: '/admin/expenses', icon: CreditCard, label: 'Expenses' },
];

export default function AdminDefaulters() {
  const { logout } = useAuth();
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    getDefaulters().then(r => { setDefaulters(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this student? Their course access will be removed.')) return;
    try { await deactivateStudent(id); toast.success('Student deactivated'); load(); } catch { toast.error('Failed'); }
  };

  const handleActivate = async (id) => {
    if (!window.confirm('Re-activate this student?')) return;
    try { await activateStudent(id); toast.success('Student re-activated'); load(); } catch { toast.error('Failed'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const filtered = search
    ? defaulters.filter(d => d.user?.name?.toLowerCase().includes(search.toLowerCase()) || d.user?.email?.toLowerCase().includes(search.toLowerCase()))
    : defaulters;

  return (
    <div data-testid="admin-defaulters-page" className="min-h-screen bg-[#050505] flex">
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-5 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${to === '/admin/defaulters' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}`}>
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
              <Link key={to} to={to} className={`p-2 rounded-lg text-[10px] whitespace-nowrap ${to === '/admin/defaulters' ? 'text-[#D4AF37] bg-white/5' : 'text-[#A1A1AA] hover:bg-white/5'}`}>{label}</Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-400" /> Defaulters ({filtered.length})</h1>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input data-testid="defaulter-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-[#111111] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
          </div>
        </div>

        <div className="bg-[#111111] border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-xs text-red-400 font-semibold mb-1">Students with overdue 2nd installment</p>
          <p className="text-[10px] text-[#A1A1AA]">These students have not paid their 2nd installment after the due date. You can deactivate their access or re-activate them once they pay.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle2 className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
            <p className="text-sm text-[#A1A1AA]">No defaulters found</p>
            <p className="text-[10px] text-[#71717A]">All students are up to date with payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((d) => {
              const e = d.enrollment;
              const title = d.type === 'diploma' ? `Diploma: ${d.track?.title || e?.track_id}` : (d.course?.title || e?.course_id);
              return (
                <div key={e?.enrollment_id} data-testid={`defaulter-${e?.enrollment_id}`} className="bg-[#111111] border border-red-500/20 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 text-sm font-bold shrink-0">
                      {d.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{d.user?.name || 'Unknown'}</p>
                        <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full font-semibold">{d.type === 'diploma' ? 'Diploma' : 'Course'}</span>
                      </div>
                      <p className="text-[10px] text-[#A1A1AA]">{d.user?.email}</p>
                      <p className="text-xs text-[#D4AF37] font-semibold mt-1">{title}</p>
                      <div className="flex items-center gap-4 mt-1 text-[10px] text-[#A1A1AA] flex-wrap">
                        <span>Due: <span className="text-red-400 font-semibold">{formatDate(d.due_date)}</span></span>
                        <span>Amount: <span className="text-white font-semibold">PKR {(d.amount || 0).toLocaleString()}</span></span>
                        <span>2nd Inst Status: <span className="text-red-400 font-semibold">{e?.installment_2_status || 'pending'}</span></span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button data-testid={`deactivate-${e?.enrollment_id}`} onClick={() => handleDeactivate(e.enrollment_id)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-colors flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Deactivate
                      </button>
                      <button data-testid={`activate-${e?.enrollment_id}`} onClick={() => handleActivate(e.enrollment_id)}
                        className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition-colors flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Re-Activate
                      </button>
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
