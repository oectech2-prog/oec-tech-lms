import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminEnrollments, updateEnrollmentStatus } from '../../lib/api';
import { toast } from 'sonner';
import { GraduationCap, Users, BookOpen, CreditCard, ArrowLeft, CheckCircle2, XCircle, Clock, BarChart3, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export default function AdminEnrollments() {
  const { logout } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = () => {
    getAdminEnrollments().then(r => { setEnrollments(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  const handleStatusUpdate = async (enrollmentId, status) => {
    try {
      await updateEnrollmentStatus(enrollmentId, { payment_status: status });
      toast.success(`Payment ${status}`);
      loadEnrollments();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = enrollments.filter(e => {
    if (filter === 'all') return true;
    return e.enrollment.payment_status === filter;
  });

  const navItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/enrollments', icon: CreditCard, label: 'Enrollments', active: true },
    { to: '/dashboard', icon: Home, label: 'Student View' },
  ];

  return (
    <div data-testid="admin-enrollments" className="min-h-screen bg-[#050505] flex">
      <aside className="w-64 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-6 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">Admin <span className="text-[#D4AF37]">Panel</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, active }) => (
            <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-5 h-5" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#27272A]">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full"><LogOut className="w-5 h-5" /> Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="md:hidden mb-6">
          <Link to="/admin" className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Admin Dashboard
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold text-white">Enrollments & Payments</h1>
          <div className="flex gap-2">
            {['all', 'pending', 'completed', 'rejected'].map((f) => (
              <button
                key={f}
                data-testid={`filter-${f}`}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors capitalize ${
                  filter === f ? 'bg-[#D4AF37] text-black' : 'bg-[#111111] text-[#A1A1AA] border border-[#27272A] hover:border-[#D4AF37]/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard className="w-16 h-16 text-[#27272A] mx-auto mb-4" />
            <p className="text-[#A1A1AA]">No enrollments found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(({ enrollment, user, course }) => (
              <div key={enrollment.enrollment_id} className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {user?.picture ? (
                      <img src={user.picture} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-sm font-bold">
                        {user?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">{user?.name || 'Unknown'}</p>
                      <p className="text-xs text-[#A1A1AA]">{user?.email}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-white">{course?.title || 'Unknown Course'}</p>
                    <p className="text-xs text-[#A1A1AA]">
                      via {enrollment.payment_method} - {enrollment.payment_proof || 'No reference'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {enrollment.payment_status === 'pending' ? (
                      <>
                        <button
                          data-testid={`approve-${enrollment.enrollment_id}`}
                          onClick={() => handleStatusUpdate(enrollment.enrollment_id, 'completed')}
                          className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          data-testid={`reject-${enrollment.enrollment_id}`}
                          onClick={() => handleStatusUpdate(enrollment.enrollment_id, 'rejected')}
                          className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold ${
                        enrollment.payment_status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {enrollment.payment_status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {enrollment.payment_status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
