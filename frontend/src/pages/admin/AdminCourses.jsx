import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminCourses, deleteCourse } from '../../lib/api';
import { toast } from 'sonner';
import { GraduationCap, BookOpen, Users, CreditCard, ArrowLeft, Trash2, Edit, BarChart3, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export default function AdminCourses() {
  const { logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = useCallback(() => {
    getAdminCourses().then(r => { setCourses(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(courseId);
      toast.success('Course deleted');
      loadCourses();
    } catch {
      toast.error('Failed to delete course');
    }
  };

  const navItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses', active: true },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/enrollments', icon: CreditCard, label: 'Enrollments' },
    { to: '/dashboard', icon: Home, label: 'Student View' },
  ];

  return (
    <div data-testid="admin-courses" className="min-h-screen bg-[#050505] flex">
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

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Manage Courses</h1>
          <span className="text-sm text-[#A1A1AA]">{courses.length} courses</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.course_id} className="bg-[#111111] border border-[#27272A] rounded-xl p-5 flex items-center gap-5">
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-[#1A1A1A] shrink-0">
                  <img src={course.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{course.title}</h3>
                  <p className="text-xs text-[#A1A1AA]">{course.category} - {course.duration} - {course.level}</p>
                  <p className="text-sm font-bold text-[#D4AF37] mt-1">PKR {course.price?.toLocaleString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    data-testid={`delete-course-${course.course_id}`}
                    onClick={() => handleDelete(course.course_id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
