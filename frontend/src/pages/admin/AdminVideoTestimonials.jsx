import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminVideoTestimonials, addAdminVideoTestimonial, updateAdminVideoTestimonial, deleteAdminVideoTestimonial } from '../../lib/api';
import { toast } from 'sonner';
import { GraduationCap, Users, BookOpen, CreditCard, BarChart3, LogOut, FileText, Award, AlertTriangle, Video, Plus, Check, X, Trash2, Search, Eye, Youtube, Link2, Upload } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const API = process.env.REACT_APP_BACKEND_URL;
const NAV = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' }, { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/students', icon: Users, label: 'Students' }, { to: '/admin/enrollments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/admissions', icon: FileText, label: 'Admissions' }, { to: '/admin/diploma-students', icon: Award, label: 'Diploma' },
  { to: '/admin/defaulters', icon: AlertTriangle, label: 'Defaulters' }, { to: '/admin/assignments', icon: FileText, label: 'Assignments' },
  { to: '/admin/video-testimonials', icon: Video, label: 'Videos' }, { to: '/admin/expenses', icon: CreditCard, label: 'Expenses' },
];

export default function AdminVideoTestimonials() {
  const { logout } = useAuth();
  const [vids, setVids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ student_name: '', course_title: '', video_type: 'youtube', video_url: '', description: '' });

  const load = useCallback(() => {
    setLoading(true);
    getAdminVideoTestimonials().then(r => { setVids(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.student_name || !form.video_url) { toast.error('Name and URL required'); return; }
    try { await addAdminVideoTestimonial(form); toast.success('Added!'); setShowAdd(false); setForm({ student_name: '', course_title: '', video_type: 'youtube', video_url: '', description: '' }); load(); } catch { toast.error('Failed'); }
  };
  const handleStatus = async (id, status) => { try { await updateAdminVideoTestimonial(id, { status }); toast.success(`${status}!`); load(); } catch { toast.error('Failed'); } };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; try { await deleteAdminVideoTestimonial(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } };

  const filtered = vids.filter(v => {
    if (filter !== 'all' && v.status !== filter) return false;
    if (search) { const q = search.toLowerCase(); return v.student_name?.toLowerCase().includes(q) || v.course_title?.toLowerCase().includes(q); }
    return true;
  });

  return (
    <div data-testid="admin-video-testimonials" className="min-h-screen bg-[#050505] flex">
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-5 border-b border-[#27272A]"><Link to="/" className="flex items-center gap-2"><GraduationCap className="w-6 h-6 text-[#D4AF37]" /><span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span></Link></div>
        <nav className="flex-1 p-3 space-y-1">{NAV.map(({ to, icon: Icon, label }) => (<Link key={to} to={to} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${to === '/admin/video-testimonials' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}`}><Icon className="w-4 h-4" /> {label}</Link>))}</nav>
        <div className="p-3 border-t border-[#27272A]"><button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 w-full"><LogOut className="w-4 h-4" /> Logout</button></div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Video className="w-5 h-5 text-[#D4AF37]" /> Video Testimonials</h1>
          <div className="flex gap-2">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" /><input data-testid="video-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-[#111] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-white w-48 focus:border-[#D4AF37] focus:outline-none" /></div>
            <button data-testid="add-video-btn" onClick={() => setShowAdd(true)} className="btn-gold px-4 py-2 text-xs flex items-center gap-1"><Plus className="w-4 h-4" /> Add Video</button>
          </div>
        </div>
        <div className="flex gap-2 mb-6">{['all','pending','approved','rejected'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter===f?'bg-[#D4AF37] text-black':'bg-[#111] text-[#A1A1AA] hover:bg-white/5'}`}>{f==='all'?'All':f} ({vids.filter(v=>f==='all'||v.status===f).length})</button>))}</div>
        {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div> :
        filtered.length === 0 ? <div className="text-center py-20 text-[#A1A1AA] text-sm">No video testimonials found</div> :
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v => (
            <div key={v.testimonial_id} data-testid={`admin-video-${v.testimonial_id}`} className="bg-[#111] border border-[#27272A] rounded-xl overflow-hidden">
              <div className="aspect-video bg-[#0A0A0A] flex items-center justify-center relative">
                {v.video_type === 'youtube' && v.video_url ? <img src={`https://img.youtube.com/vi/${v.video_url.match(/(?:embed\/|watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1]}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" /> : <Video className="w-10 h-10 text-[#27272A]" />}
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status==='approved'?'bg-green-500/20 text-green-400':v.status==='rejected'?'bg-red-500/20 text-red-400':'bg-yellow-500/20 text-yellow-400'}`}>{v.status}</span>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-white mb-1">{v.student_name}</p>
                {v.course_title && <p className="text-[10px] text-[#D4AF37] mb-1">{v.course_title}</p>}
                {v.description && <p className="text-xs text-[#A1A1AA] line-clamp-2 mb-3">{v.description}</p>}
                <div className="flex gap-2">
                  {v.status === 'pending' && <><button onClick={() => handleStatus(v.testimonial_id, 'approved')} className="flex-1 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20"><Check className="w-3 h-3 inline mr-1" />Approve</button><button onClick={() => handleStatus(v.testimonial_id, 'rejected')} className="flex-1 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20"><X className="w-3 h-3 inline mr-1" />Reject</button></>}
                  {v.video_url && <a href={v.video_url} target="_blank" rel="noreferrer" className="py-1.5 px-3 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-xs font-semibold hover:bg-[#D4AF37]/20"><Eye className="w-3 h-3 inline mr-1" />View</a>}
                  <button onClick={() => handleDelete(v.testimonial_id)} className="py-1.5 px-3 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>}
      </main>
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onClick={() => setShowAdd(false)}>
          <div className="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-white">Add Video Testimonial</h3><button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-[#A1A1AA]" /></button></div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input data-testid="vt-name" value={form.student_name} onChange={e => setForm({...form, student_name: e.target.value})} placeholder="Student Name *" className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
              <input value={form.course_title} onChange={e => setForm({...form, course_title: e.target.value})} placeholder="Course Name" className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
              <div className="flex gap-2"><button type="button" onClick={() => setForm({...form, video_type: 'youtube'})} className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${form.video_type==='youtube'?'bg-red-500/10 text-red-400 border-red-500/30':'bg-[#050505] text-[#A1A1AA] border-[#27272A]'}`}><Youtube className="w-3 h-3 inline mr-1" />YouTube</button><button type="button" onClick={() => setForm({...form, video_type: 'link'})} className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${form.video_type==='link'?'bg-blue-500/10 text-blue-400 border-blue-500/30':'bg-[#050505] text-[#A1A1AA] border-[#27272A]'}`}><Link2 className="w-3 h-3 inline mr-1" />Link</button></div>
              <input data-testid="vt-url" value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})} placeholder="Video URL *" className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" rows={2} className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none" />
              <button data-testid="save-video-btn" type="submit" className="btn-gold w-full py-2.5 text-sm">Add Testimonial</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
