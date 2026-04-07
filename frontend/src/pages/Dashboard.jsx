import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { getMyCourses } from '../lib/api';
import { GraduationCap, BookOpen, BarChart3, User, LogOut, Shield, Clock, CheckCircle2, AlertCircle, ArrowRight, Home } from 'lucide-react';
import { Progress } from '../components/ui/progress';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCourses().then(r => { setEnrolledCourses(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const activeCourses = enrolledCourses.filter(e => e.enrollment.payment_status === 'completed');
  const pendingCourses = enrolledCourses.filter(e => e.enrollment.payment_status === 'pending');

  return (
    <div data-testid="student-dashboard" className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-6 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { to: '/dashboard', icon: BarChart3, label: 'Dashboard', active: true },
            { to: '/profile', icon: User, label: 'Profile' },
            { to: '/', icon: Home, label: 'Home' },
          ].map(({ to, icon: Icon, label, active }) => (
            <Link key={to} to={to} data-testid={`sidebar-${label.toLowerCase()}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" data-testid="sidebar-admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
              <Shield className="w-5 h-5" />
              Admin Panel
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-[#27272A]">
          <button onClick={handleLogout} data-testid="sidebar-logout" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">HDA</span>
          </Link>
          <div className="flex gap-2">
            {user?.role === 'admin' && (
              <Link to="/admin" className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg"><Shield className="w-5 h-5" /></Link>
            )}
            <Link to="/profile" className="p-2 text-[#A1A1AA] hover:bg-white/5 rounded-lg"><User className="w-5 h-5" /></Link>
            <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-[#A1A1AA]">Continue your learning journey. Track your progress and complete assignments.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Active Courses', value: activeCourses.length, icon: BookOpen },
            { label: 'Pending Payments', value: pendingCourses.length, icon: Clock },
            { label: 'Completed', value: activeCourses.filter(c => c.enrollment.progress === 100).length, icon: CheckCircle2 },
            { label: 'Total Enrolled', value: enrolledCourses.length, icon: BarChart3 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
              <Icon className="w-5 h-5 text-[#D4AF37] mb-2" />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-[#A1A1AA]">{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Active Courses */}
            {activeCourses.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-white mb-6">My Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeCourses.map(({ enrollment, course }) => (
                    <Link key={enrollment.enrollment_id} to={`/my-course/${enrollment.enrollment_id}`} data-testid={`enrolled-course-${enrollment.enrollment_id}`}
                      className="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all group">
                      <div className="aspect-[3/2] overflow-hidden bg-[#1A1A1A]">
                        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">{course.title}</h3>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-[#A1A1AA] mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2 bg-[#27272A]" />
                        </div>
                        <span className="text-xs text-[#D4AF37] flex items-center gap-1">
                          Continue Learning <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Payment */}
            {pendingCourses.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-white mb-6">Pending Payment</h2>
                <div className="space-y-4">
                  {pendingCourses.map(({ enrollment, course }) => (
                    <div key={enrollment.enrollment_id} className="bg-[#111111] border border-yellow-600/30 rounded-xl p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <div>
                          <h3 className="text-sm font-bold text-white">{course.title}</h3>
                          <p className="text-xs text-[#A1A1AA]">Payment via {enrollment.payment_method} - awaiting confirmation</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Courses */}
            {enrolledCourses.length === 0 && (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-[#27272A] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Courses Yet</h3>
                <p className="text-sm text-[#A1A1AA] mb-6">Start your learning journey by enrolling in a course.</p>
                <Link to="/courses" data-testid="browse-courses-btn" className="btn-gold px-6 py-3 text-sm">Browse Courses</Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
