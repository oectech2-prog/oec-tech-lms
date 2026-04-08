import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminCourses, deleteCourse, createCourse, updateCourse } from '../../lib/api';
import { toast } from 'sonner';
import { GraduationCap, BookOpen, Users, CreditCard, Trash2, Edit, BarChart3, LogOut, Plus, X, Save } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const NAV = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/enrollments', icon: CreditCard, label: 'Payments' },
];

const EMPTY_COURSE = {
  title: '', description: '', short_description: '', price: 0, admission_fee: 0,
  currency: 'PKR', image_url: '', category: '', duration: '', level: 'Beginner',
  instructor: 'OEC Tech Institute', intro_video_url: '', intro_video_type: 'youtube',
  requirements: [], what_you_will_learn: [], weeks: []
};

export default function AdminCourses() {
  const { logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_COURSE });
  const [reqInput, setReqInput] = useState('');
  const [learnInput, setLearnInput] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCourses = useCallback(() => {
    setLoading(true);
    getAdminCourses().then(r => { setCourses(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const handleDelete = async (courseId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteCourse(courseId);
      toast.success('Course deleted');
      loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  const handleEdit = (course) => {
    setEditId(course.course_id);
    setForm({
      title: course.title || '', description: course.description || '',
      short_description: course.short_description || '', price: course.price || 0,
      admission_fee: course.admission_fee || 0, currency: course.currency || 'PKR',
      image_url: course.image_url || '', category: course.category || '',
      duration: course.duration || '', level: course.level || 'Beginner',
      instructor: course.instructor || '', intro_video_url: course.intro_video_url || '',
      intro_video_type: course.intro_video_type || 'youtube',
      requirements: course.requirements || [], what_you_will_learn: course.what_you_will_learn || [],
      weeks: course.weeks || [],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateCourse(editId, form);
        toast.success('Course updated');
      } else {
        await createCourse(form);
        toast.success('Course created');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ ...EMPTY_COURSE });
      loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    }
    setSaving(false);
  };

  const addReq = () => { if (reqInput.trim()) { setForm(f => ({ ...f, requirements: [...f.requirements, reqInput.trim()] })); setReqInput(''); } };
  const addLearn = () => { if (learnInput.trim()) { setForm(f => ({ ...f, what_you_will_learn: [...f.what_you_will_learn, learnInput.trim()] })); setLearnInput(''); } };

  return (
    <div data-testid="admin-courses-page" className="min-h-screen bg-[#050505] flex">
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-5 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">Admin <span className="text-[#D4AF37]">Panel</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${to === '/admin/courses' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#27272A]">
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 w-full"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Courses ({courses.length})</h1>
          <button data-testid="add-course-btn" onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY_COURSE }); }} className="btn-gold px-4 py-2 text-xs">
            Add Course
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(c => (
              <div key={c.course_id} data-testid={`course-card-${c.course_id}`} className="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden">
                <div className="h-32 bg-[#0A0A0A] overflow-hidden">
                  {c.image_url ? <img src={c.image_url} alt="" loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-[#27272A]" /></div>}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white mb-1 truncate">{c.title}</h3>
                  <p className="text-[10px] text-[#A1A1AA] mb-2">{c.category} | {c.duration} | {c.level}</p>
                  <div className="flex items-center gap-3 text-[10px] text-[#A1A1AA] mb-3">
                    <span>PKR {c.price?.toLocaleString()}</span>
                    <span>{c.enrollment_count || 0} enrolled</span>
                    <span>{c.approved_count || 0} approved</span>
                  </div>
                  <div className="flex gap-2">
                    <button data-testid={`edit-course-${c.course_id}`} onClick={() => handleEdit(c)} className="flex-1 px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-xs hover:bg-[#D4AF37]/20 transition-colors text-center">
                      Edit
                    </button>
                    <button data-testid={`delete-course-${c.course_id}`} onClick={() => handleDelete(c.course_id, c.title)} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setShowForm(false)}>
            <div className="bg-[#111111] border border-[#27272A] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{editId ? 'Edit Course' : 'Add New Course'}</h3>
                <button onClick={() => setShowForm(false)} className="text-[#A1A1AA] hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Title *</label>
                    <input data-testid="course-form-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Category</label>
                    <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Short Description</label>
                  <input value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Full Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Price (PKR)</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Admission Fee</label>
                    <input type="number" value={form.admission_fee} onChange={e => setForm(f => ({ ...f, admission_fee: Number(e.target.value) }))} className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Duration</label>
                    <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="6 Weeks" className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Level</label>
                    <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Image URL</label>
                  <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                </div>

                {/* Requirements */}
                <div>
                  <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Requirements</label>
                  <div className="flex gap-2 mb-2">
                    <input value={reqInput} onChange={e => setReqInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReq()} placeholder="Add requirement..." className="flex-1 bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                    <button onClick={addReq} className="px-3 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-xs">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {form.requirements.map((r, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-[#0A0A0A] border border-[#27272A] rounded px-2 py-1 text-[10px] text-[#A1A1AA]">
                        {r} <button onClick={() => setForm(f => ({ ...f, requirements: f.requirements.filter((_, idx) => idx !== i) }))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* What you'll learn */}
                <div>
                  <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">What You'll Learn</label>
                  <div className="flex gap-2 mb-2">
                    <input value={learnInput} onChange={e => setLearnInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLearn()} placeholder="Add learning outcome..." className="flex-1 bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                    <button onClick={addLearn} className="px-3 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-xs">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {form.what_you_will_learn.map((l, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-[#0A0A0A] border border-[#27272A] rounded px-2 py-1 text-[10px] text-[#A1A1AA]">
                        {l} <button onClick={() => setForm(f => ({ ...f, what_you_will_learn: f.what_you_will_learn.filter((_, idx) => idx !== i) }))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button data-testid="course-form-save" onClick={handleSave} disabled={saving} className="btn-gold px-6 py-2.5 text-xs disabled:opacity-50">
                    {saving ? 'Saving...' : editId ? 'Update Course' : 'Create Course'}
                  </button>
                  <button onClick={() => setShowForm(false)} className="btn-gold-outline px-6 py-2.5 text-xs">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
