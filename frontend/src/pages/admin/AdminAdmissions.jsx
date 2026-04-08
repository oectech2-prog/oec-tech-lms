import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdmissionForms } from '../../lib/api';
import { GraduationCap, Users, BookOpen, CreditCard, BarChart3, LogOut, Search, Eye, X, FileText, User, Phone, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const API = process.env.REACT_APP_BACKEND_URL;

const NAV = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/enrollments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/admissions', icon: FileText, label: 'Admissions' },
];

export default function AdminAdmissions() {
  const { logout } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getAdmissionForms().then(r => { setForms(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = forms.filter(f =>
    f.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.student_id?.toLowerCase().includes(search.toLowerCase()) ||
    f.course_title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const DocImage = ({ url, label }) => {
    if (!url) return <span className="text-[10px] text-[#A1A1AA]">Not uploaded</span>;
    const fullUrl = url.startsWith('http') ? url : `${API}${url}`;
    return (
      <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="block">
        <img src={fullUrl} alt={label} className="w-full h-32 object-contain bg-[#050505] rounded-lg border border-[#27272A]" />
        <span className="text-[10px] text-[#D4AF37] mt-1 block">View {label}</span>
      </a>
    );
  };

  return (
    <div data-testid="admin-admissions-page" className="min-h-screen bg-[#050505] flex">
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-5 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${to === '/admin/admissions' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}`}>
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
              <Link key={to} to={to} className={`p-2 rounded-lg text-[10px] whitespace-nowrap ${to === '/admin/admissions' ? 'text-[#D4AF37] bg-white/5' : 'text-[#A1A1AA] hover:bg-white/5'}`}>{label}</Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-xl font-bold text-white">Admission Forms ({forms.length})</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input data-testid="admission-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, course..." className="w-full bg-[#111111] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#A1A1AA] text-sm">No admission forms found</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(f => (
              <div key={f.form_id} data-testid={`admission-row-${f.form_id}`} className="bg-[#111111] border border-[#27272A] rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] text-sm font-bold shrink-0">
                  {f.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{f.full_name}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full font-mono">{f.student_id}</span>
                  </div>
                  <p className="text-[10px] text-[#A1A1AA]">{f.course_title} | {f.session_type} | {f.learning_type}</p>
                  <p className="text-[10px] text-[#A1A1AA]">{f.phone} | {f.city} | Joined: {formatDate(f.joining_date)}</p>
                </div>
                <button data-testid={`view-form-${f.form_id}`} onClick={() => setSelected(f)} className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors shrink-0">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Full Form Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setSelected(null)}>
            <div className="bg-[#111111] border border-[#27272A] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selected.full_name}</h3>
                  <span className="text-xs font-mono text-[#D4AF37]">{selected.student_id}</span>
                </div>
                <button onClick={() => setSelected(null)} className="text-[#A1A1AA] hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* Student Info */}
              <div className="bg-[#0A0A0A] rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-[#D4AF37] mb-3">STUDENT INFORMATION</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-[#A1A1AA] block text-[10px]">Course</span><span className="text-white">{selected.course_title}</span></div>
                  <div><span className="text-[#A1A1AA] block text-[10px]">Phone</span><span className="text-white">{selected.phone}</span></div>
                  <div><span className="text-[#A1A1AA] block text-[10px]">Date of Birth</span><span className="text-white">{formatDate(selected.date_of_birth)}</span></div>
                  <div><span className="text-[#A1A1AA] block text-[10px]">Gender</span><span className="text-white">{selected.gender}</span></div>
                  <div><span className="text-[#A1A1AA] block text-[10px]">Qualification</span><span className="text-white">{selected.qualification || '-'}</span></div>
                  <div><span className="text-[#A1A1AA] block text-[10px]">Religion</span><span className="text-white">{selected.religion || '-'}</span></div>
                  <div><span className="text-[#A1A1AA] block text-[10px]">City</span><span className="text-white">{selected.city}</span></div>
                  <div><span className="text-[#A1A1AA] block text-[10px]">Session</span><span className="text-white">{selected.session_type}</span></div>
                  <div><span className="text-[#A1A1AA] block text-[10px]">Learning</span><span className="text-white">{selected.learning_type}</span></div>
                  <div className="col-span-2 sm:col-span-3"><span className="text-[#A1A1AA] block text-[10px]">Address</span><span className="text-white">{selected.address || '-'}</span></div>
                  <div><span className="text-[#A1A1AA] block text-[10px]">Joining Date</span><span className="text-white">{formatDate(selected.joining_date)}</span></div>
                </div>
              </div>

              {/* Parent Info */}
              <div className="bg-[#0A0A0A] rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-[#D4AF37] mb-3">PARENT / GUARDIAN</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-[#A1A1AA] block text-[10px]">Father Name</span><span className="text-white">{selected.father_name}</span></div>
                  <div><span className="text-[#A1A1AA] block text-[10px]">Father Phone</span><span className="text-white">{selected.father_phone}</span></div>
                  <div><span className="text-[#A1A1AA] block text-[10px]">Father CNIC</span><span className="text-white">{selected.father_cnic || '-'}</span></div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-[#0A0A0A] rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-[#D4AF37] mb-3">DOCUMENTS</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><p className="text-[10px] text-[#A1A1AA] mb-1">ID Card (Front)</p><DocImage url={selected.id_card_front_url} label="Front" /></div>
                  <div><p className="text-[10px] text-[#A1A1AA] mb-1">ID Card (Back)</p><DocImage url={selected.id_card_back_url} label="Back" /></div>
                  <div><p className="text-[10px] text-[#A1A1AA] mb-1">Last Degree</p><DocImage url={selected.last_degree_url} label="Degree" /></div>
                  <div><p className="text-[10px] text-[#A1A1AA] mb-1">B-Form</p><DocImage url={selected.bform_url} label="B-Form" /></div>
                </div>
              </div>

              {/* Fee Receipt */}
              {selected.receipt_url && (
                <div className="bg-[#0A0A0A] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#D4AF37] mb-3">FEE RECEIPT</p>
                  <DocImage url={selected.receipt_url} label="Receipt" />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
