import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStudents, removeStudent, getStudentProgress } from '../../lib/api';
import { toast } from 'sonner';
import { GraduationCap, Users, BookOpen, CreditCard, ArrowLeft, Trash2, BarChart3, LogOut, Home, Search, Eye, Calendar, CheckCircle2, XCircle, FileText, Award } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const NAV = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/enrollments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/admissions', icon: FileText, label: 'Admissions' },
  { to: '/admin/diploma-students', icon: Award, label: 'Diploma' },
];

export default function AdminStudents() {
  const { logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);

  const loadStudents = useCallback(() => {
    setLoading(true);
    getAdminStudents().then(r => { setStudents(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = async (userId, name) => {
    if (!window.confirm(`Remove student "${name}"? This will delete all their data.`)) return;
    try {
      await removeStudent(userId);
      toast.success('Student removed');
      loadStudents();
      if (selectedStudent?.user_id === userId) { setSelectedStudent(null); setProgress(null); }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove');
    }
  };

  const viewProgress = async (student) => {
    setSelectedStudent(student);
    setProgressLoading(true);
    try {
      const res = await getStudentProgress(student.user_id);
      setProgress(res.data);
    } catch {
      toast.error('Failed to load progress');
    }
    setProgressLoading(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  return (
    <div data-testid="admin-students-page" className="min-h-screen bg-[#050505] flex">
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-5 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${to === '/admin/students' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}`}>
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
              <Link key={to} to={to} className={`p-2 rounded-lg text-[10px] whitespace-nowrap ${to === '/admin/students' ? 'text-[#D4AF37] bg-white/5' : 'text-[#A1A1AA] hover:bg-white/5'}`}>{label}</Link>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Students ({students.length})</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input
              data-testid="student-search"
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full bg-[#111111] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#A1A1AA] text-sm">No students found</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map(s => (
              <div key={s.user_id} data-testid={`student-row-${s.user_id}`} className="bg-[#111111] border border-[#27272A] rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] text-sm font-bold shrink-0">
                  {s.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                  <p className="text-[10px] text-[#A1A1AA] truncate">{s.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-[10px]">
                  <div className="text-center">
                    <p className="text-white font-bold">{s.approved_courses || 0}</p>
                    <p className="text-[#A1A1AA]">Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">{s.completed_lessons || 0}/{s.total_lessons || 0}</p>
                    <p className="text-[#A1A1AA]">Lessons</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">{formatDate(s.joining_date)}</p>
                    <p className="text-[#A1A1AA]">Joined</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button data-testid={`view-progress-${s.user_id}`} onClick={() => viewProgress(s)} className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button data-testid={`remove-student-${s.user_id}`} onClick={() => handleRemove(s.user_id, s.name)} className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Student Progress Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => { setSelectedStudent(null); setProgress(null); }}>
            <div className="bg-[#111111] border border-[#27272A] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{selectedStudent.name}</h3>
                <button onClick={() => { setSelectedStudent(null); setProgress(null); }} className="text-[#A1A1AA] hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-[#A1A1AA] mb-4">{selectedStudent.email}</p>

              {progressLoading ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
              ) : progress?.courses?.length > 0 ? (
                <div className="space-y-4">
                  {progress.courses.map(c => (
                    <div key={c.enrollment.enrollment_id} className="bg-[#0A0A0A] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-white">{c.course_title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.enrollment.payment_status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                          {c.enrollment.payment_status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-[#A1A1AA] mb-2">
                        <span>Lessons: {c.completed_lessons}/{c.total_lessons}</span>
                        <span>Assignments: {c.submitted_assignments?.length || 0}</span>
                        <span>Progress: {c.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4AF37] rounded-full transition-all" style={{ width: `${c.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#A1A1AA] text-center py-8">No course enrollments yet</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
