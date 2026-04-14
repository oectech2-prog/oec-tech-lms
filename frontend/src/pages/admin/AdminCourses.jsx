import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminCourses, deleteCourse, createCourse, updateCourse, updateCourseOutline } from '../../lib/api';
import { toast } from 'sonner';
import { GraduationCap, BookOpen, Users, CreditCard, Trash2, Edit, BarChart3, LogOut, Plus, X, Save, FileText, Award, AlertTriangle , Video} from 'lucide-react';
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
  const [outlineId, setOutlineId] = useState(null);
  const [weeks, setWeeks] = useState([]);

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

  const openOutline = (course) => {
    setOutlineId(course.course_id);
    setWeeks(JSON.parse(JSON.stringify(course.weeks || [])));
  };
  const addWeek = () => {
    const num = weeks.length + 1;
    setWeeks([...weeks, { week_number: num, title: `Week ${num}`, description: '', lessons: [], assignment: null }]);
  };
  const removeWeek = (idx) => setWeeks(weeks.filter((_, i) => i !== idx));
  const updateWeek = (idx, field, val) => { const w = [...weeks]; w[idx] = { ...w[idx], [field]: val }; setWeeks(w); };
  const addLesson = (wIdx) => {
    const w = [...weeks];
    const num = (w[wIdx].lessons?.length || 0) + 1;
    w[wIdx].lessons = [...(w[wIdx].lessons || []), { lesson_id: `l_${Date.now()}_${num}`, title: `Lesson ${num}`, video_type: 'youtube', video_url: '', duration: '20 min' }];
    setWeeks(w);
  };
  const removeLesson = (wIdx, lIdx) => { const w = [...weeks]; w[wIdx].lessons = w[wIdx].lessons.filter((_, i) => i !== lIdx); setWeeks(w); };
  const updateLesson = (wIdx, lIdx, field, val) => { const w = [...weeks]; w[wIdx].lessons[lIdx] = { ...w[wIdx].lessons[lIdx], [field]: val }; setWeeks(w); };
  const toggleAssignment = (wIdx) => {
    const w = [...weeks];
    if (w[wIdx].assignment) { w[wIdx].assignment = null; }
    else { w[wIdx].assignment = { assignment_id: `a_${Date.now()}`, title: 'Assignment', description: '', is_final_project: false }; }
    setWeeks(w);
  };
  const updateAssignment = (wIdx, field, val) => { const w = [...weeks]; w[wIdx].assignment = { ...w[wIdx].assignment, [field]: val }; setWeeks(w); };
  const saveOutline = async () => {
    setSaving(true);
    try { await updateCourseOutline(outlineId, { weeks }); toast.success('Outline saved!'); setOutlineId(null); loadCourses(); }
    catch { toast.error('Failed to save outline'); }
    setSaving(false);
  };

  return (
    <div data-testid="admin-courses-page" className="min-h-screen bg-[#050505] flex">
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-5 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
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

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
        <div className="md:hidden flex items-center justify-between mb-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
          </div>
          <div className="flex gap-1">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} className={`p-2 rounded-lg text-[10px] whitespace-nowrap ${to === '/admin/courses' ? 'text-[#D4AF37] bg-white/5' : 'text-[#A1A1AA] hover:bg-white/5'}`}>{label}</Link>
            ))}
          </div>
        </div>
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
                    <button data-testid={`outline-course-${c.course_id}`} onClick={() => openOutline(c)} className="flex-1 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20 transition-colors text-center">
                      Outline
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

        {/* Course Outline Editor Modal */}
        {outlineId && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setOutlineId(null)}>
            <div className="bg-[#111111] border border-[#27272A] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Edit Course Outline</h3>
                <button onClick={() => setOutlineId(null)} className="text-[#A1A1AA] hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4 mb-6">
                {weeks.map((w, wIdx) => (
                  <div key={wIdx} className="bg-[#0A0A0A] border border-[#27272A] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="w-8 h-8 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center text-xs font-bold">{w.week_number}</span>
                        <input data-testid={`week-title-${wIdx}`} value={w.title} onChange={e => updateWeek(wIdx, 'title', e.target.value)} className="flex-1 bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none" placeholder="Week title" />
                      </div>
                      <button onClick={() => removeWeek(wIdx)} className="ml-2 p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <textarea value={w.description} onChange={e => updateWeek(wIdx, 'description', e.target.value)} placeholder="Week description (optional)" rows={2} className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none mb-3" />

                    {/* Lessons */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Lessons</span>
                        <button data-testid={`add-lesson-${wIdx}`} onClick={() => addLesson(wIdx)} className="text-[10px] text-[#D4AF37] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Lesson</button>
                      </div>
                      {(w.lessons || []).map((l, lIdx) => (
                        <div key={lIdx} className="bg-[#111111] border border-[#27272A] rounded-lg p-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                            <input value={l.title} onChange={e => updateLesson(wIdx, lIdx, 'title', e.target.value)} placeholder="Lesson title" className="bg-[#050505] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                            <input value={l.video_url} onChange={e => updateLesson(wIdx, lIdx, 'video_url', e.target.value)} placeholder="Video URL" className="bg-[#050505] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                            <div className="flex gap-2">
                              <select value={l.video_type} onChange={e => updateLesson(wIdx, lIdx, 'video_type', e.target.value)} className="bg-[#050505] border border-[#27272A] rounded-lg px-2 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none flex-1">
                                <option value="youtube">YouTube</option>
                                <option value="upload">Upload</option>
                                <option value="link">Link</option>
                              </select>
                              <input value={l.duration} onChange={e => updateLesson(wIdx, lIdx, 'duration', e.target.value)} placeholder="Duration" className="bg-[#050505] border border-[#27272A] rounded-lg px-2 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none w-20" />
                              <button onClick={() => removeLesson(wIdx, lIdx)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Assignment */}
                    <div className="border-t border-[#27272A] pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Assignment</span>
                        <button onClick={() => toggleAssignment(wIdx)} className={`text-[10px] px-3 py-1 rounded-lg ${w.assignment ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                          {w.assignment ? 'Remove Assignment' : '+ Add Assignment'}
                        </button>
                      </div>
                      {w.assignment && (
                        <div className="mt-2 space-y-2">
                          <input value={w.assignment.title} onChange={e => updateAssignment(wIdx, 'title', e.target.value)} placeholder="Assignment title" className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
                          <textarea value={w.assignment.description} onChange={e => updateAssignment(wIdx, 'description', e.target.value)} placeholder="Assignment description" rows={2} className="w-full bg-[#050505] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none" />
                          <label className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                            <input type="checkbox" checked={w.assignment.is_final_project || false} onChange={e => updateAssignment(wIdx, 'is_final_project', e.target.checked)} className="accent-[#D4AF37]" />
                            Final Project
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button data-testid="add-week-btn" onClick={addWeek} className="btn-gold-outline px-4 py-2 text-xs flex items-center gap-1"><Plus className="w-4 h-4" /> Add Week</button>
                <button data-testid="save-outline-btn" onClick={saveOutline} disabled={saving} className="btn-gold px-6 py-2 text-xs flex items-center gap-1 disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Outline'}</button>
                <button onClick={() => setOutlineId(null)} className="px-4 py-2 text-xs text-[#A1A1AA] hover:text-white">Cancel</button>
              </div>
            </div>
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
