import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminAssignments, reviewAssignment } from '../../lib/api';
import { toast } from 'sonner';
import { GraduationCap, Users, BookOpen, CreditCard, BarChart3, LogOut, FileText, Award, AlertTriangle, Search, CheckCircle2, XCircle, Clock, X, Eye, MessageSquare, Link2, Upload } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const API = process.env.REACT_APP_BACKEND_URL;

const NAV = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/enrollments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/admissions', icon: FileText, label: 'Admissions' },
  { to: '/admin/diploma-students', icon: Award, label: 'Diploma' },
  { to: '/admin/defaulters', icon: AlertTriangle, label: 'Defaulters' },
  { to: '/admin/assignments', icon: FileText, label: 'Assignments' },
];

export default function AdminAssignments() {
  const { logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewModal, setViewModal] = useState(null);
  const [feedback, setFeedback] = useState('');

  const load = useCallback(() => {
    getAdminAssignments().then(r => { setAssignments(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReview = async (subId, status) => {
    const label = status === 'approved' ? 'approve' : 'reject';
    try {
      await reviewAssignment(subId, { status, feedback });
      toast.success(`Assignment ${label}d!`);
      setViewModal(null); setFeedback('');
      load();
    } catch { toast.error('Failed'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  const filtered = assignments.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (a.user_name?.toLowerCase().includes(q) || a.course_title?.toLowerCase().includes(q) || a.user_email?.toLowerCase().includes(q));
    }
    return true;
  });

  const counts = {
    all: assignments.length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    approved: assignments.filter(a => a.status === 'approved').length,
    rejected: assignments.filter(a => a.status === 'rejected').length,
  };

  const TypeIcon = ({ type }) => {
    if (type === 'file') return <Upload className="w-3 h-3" />;
    if (type === 'link') return <Link2 className="w-3 h-3" />;
    return <MessageSquare className="w-3 h-3" />;
  };

  return (
    <div data-testid="admin-assignments-page" className="min-h-screen bg-[#050505] flex">
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-5 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${to === '/admin/assignments' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#27272A]"><button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 w-full"><LogOut className="w-4 h-4" /> Logout</button></div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
        <div className="md:hidden flex items-center justify-between mb-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0"><GraduationCap className="w-5 h-5 text-[#D4AF37]" /><span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span></div>
          <div className="flex gap-1">{NAV.map(({ to, label }) => (<Link key={to} to={to} className={`p-2 rounded-lg text-[10px] whitespace-nowrap ${to === '/admin/assignments' ? 'text-[#D4AF37] bg-white/5' : 'text-[#A1A1AA] hover:bg-white/5'}`}>{label}</Link>))}</div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-[#D4AF37]" /> Student Assignments</h1>
          <div className="relative w-full sm:w-56"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" /><input data-testid="assignment-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-[#111111] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" /></div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'submitted', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
          ].map(f => (
            <button key={f.key} data-testid={`assign-filter-${f.key}`} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === f.key ? 'bg-[#D4AF37] text-black' : 'bg-[#111111] text-[#A1A1AA] hover:bg-white/5'}`}>
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#A1A1AA] text-sm">No assignments found</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => {
              const statusColor = a.status === 'approved' ? 'bg-green-500/10 text-green-400' : a.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400';
              const StatusIcon = a.status === 'approved' ? CheckCircle2 : a.status === 'rejected' ? XCircle : Clock;
              return (
                <div key={a.submission_id} data-testid={`assignment-${a.submission_id}`} className="bg-[#111111] border border-[#27272A] rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="w-9 h-9 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] text-sm font-bold shrink-0">
                      {a.user_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{a.user_name}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}>
                          <StatusIcon className="w-3 h-3" /> {a.status}
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#27272A] rounded-full text-[10px] text-[#A1A1AA]">
                          <TypeIcon type={a.submission_type} /> {a.submission_type || 'text'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#A1A1AA]">{a.course_title} - Week {a.week_number}</p>
                      <p className="text-[10px] text-[#71717A] mt-0.5">{formatDate(a.submitted_at)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button data-testid={`view-assignment-${a.submission_id}`} onClick={() => { setViewModal(a); setFeedback(''); }}
                        className="px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-xs font-semibold hover:bg-[#D4AF37]/20 transition-colors flex items-center gap-1">
                        <Eye className="w-3 h-3" /> View
                      </button>
                      {a.status === 'submitted' && (
                        <>
                          <button data-testid={`quick-approve-${a.submission_id}`} onClick={() => handleReview(a.submission_id, 'approved')}
                            className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20">Approve</button>
                          <button data-testid={`quick-reject-${a.submission_id}`} onClick={() => handleReview(a.submission_id, 'rejected')}
                            className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20">Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onClick={() => setViewModal(null)}>
          <div className="bg-[#111111] border border-[#27272A] rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Assignment Submission</h3>
              <button onClick={() => setViewModal(null)} className="text-[#A1A1AA] hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-[#0A0A0A] rounded-lg p-3">
                <p className="text-[10px] text-[#71717A]">Student</p>
                <p className="text-xs text-white font-semibold">{viewModal.user_name} ({viewModal.user_email})</p>
              </div>
              <div className="bg-[#0A0A0A] rounded-lg p-3">
                <p className="text-[10px] text-[#71717A]">Course / Week</p>
                <p className="text-xs text-white font-semibold">{viewModal.course_title} - Week {viewModal.week_number}</p>
              </div>
              <div className="bg-[#0A0A0A] rounded-lg p-3">
                <p className="text-[10px] text-[#71717A]">Type: {viewModal.submission_type || 'text'}</p>
                {viewModal.submission_type === 'file' && viewModal.file_url ? (
                  <a href={`${API}${viewModal.file_url}`} target="_blank" rel="noreferrer" className="text-xs text-[#D4AF37] underline mt-1 block">Download File</a>
                ) : viewModal.submission_type === 'link' ? (
                  <a href={viewModal.content} target="_blank" rel="noreferrer" className="text-xs text-[#D4AF37] underline mt-1 block break-all">{viewModal.content}</a>
                ) : (
                  <p className="text-xs text-white mt-1 whitespace-pre-wrap">{viewModal.content}</p>
                )}
              </div>
              <div className="bg-[#0A0A0A] rounded-lg p-3">
                <p className="text-[10px] text-[#71717A]">Status</p>
                <span className={`text-xs font-semibold ${viewModal.status === 'approved' ? 'text-green-400' : viewModal.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {viewModal.status}
                </span>
              </div>
              {viewModal.feedback && (
                <div className="bg-[#0A0A0A] rounded-lg p-3">
                  <p className="text-[10px] text-[#71717A]">Feedback</p>
                  <p className="text-xs text-white">{viewModal.feedback}</p>
                </div>
              )}
            </div>

            {viewModal.status === 'submitted' && (
              <div>
                <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Feedback (Optional)</label>
                <textarea data-testid="assignment-feedback" value={feedback} onChange={e => setFeedback(e.target.value)}
                  placeholder="Add feedback for the student..."
                  className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white mb-3 focus:border-[#D4AF37] focus:outline-none resize-none" rows={3} />
                <div className="flex gap-3">
                  <button data-testid="modal-approve-btn" onClick={() => handleReview(viewModal.submission_id, 'approved')}
                    className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Approve</button>
                  <button data-testid="modal-reject-btn" onClick={() => handleReview(viewModal.submission_id, 'rejected')}
                    className="flex-1 py-2.5 text-sm bg-red-500/10 text-red-400 rounded-lg font-semibold hover:bg-red-500/20 flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Reject</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
