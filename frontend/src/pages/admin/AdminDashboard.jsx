import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { GraduationCap, Users, BookOpen, CreditCard, Star, MessageSquare, ArrowRight, Shield, LogOut, Home, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats().then(r => setStats(r.data)).catch(console.error);
  }, []);

  const navItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard', active: true },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/enrollments', icon: CreditCard, label: 'Enrollments' },
    { to: '/dashboard', icon: Home, label: 'Student View' },
  ];

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-6 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">Admin <span className="text-[#D4AF37]">Panel</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, active }) => (
            <Link key={to} to={to} data-testid={`admin-nav-${label.toLowerCase()}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#27272A]">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {/* Mobile nav */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">Admin</span>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/courses" className="p-2 text-[#A1A1AA] hover:bg-white/5 rounded-lg text-xs">Courses</Link>
            <Link to="/admin/students" className="p-2 text-[#A1A1AA] hover:bg-white/5 rounded-lg text-xs">Students</Link>
            <Link to="/admin/enrollments" className="p-2 text-[#A1A1AA] hover:bg-white/5 rounded-lg text-xs">Payments</Link>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Students', value: stats?.total_students || 0, icon: Users, color: 'text-blue-400' },
            { label: 'Total Courses', value: stats?.total_courses || 0, icon: BookOpen, color: 'text-green-400' },
            { label: 'Total Enrollments', value: stats?.total_enrollments || 0, icon: CreditCard, color: 'text-purple-400' },
            { label: 'Pending Payments', value: stats?.pending_payments || 0, icon: CreditCard, color: 'text-yellow-400' },
            { label: 'Total Reviews', value: stats?.total_reviews || 0, icon: Star, color: 'text-[#D4AF37]' },
            { label: 'Messages', value: stats?.total_messages || 0, icon: MessageSquare, color: 'text-pink-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#111111] border border-[#27272A] rounded-xl p-6">
              <Icon className={`w-6 h-6 ${color} mb-3`} />
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-xs text-[#A1A1AA] mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/admin/courses', label: 'Manage Courses', desc: 'Add, edit or remove courses', icon: BookOpen },
            { to: '/admin/students', label: 'View Students', desc: 'See all registered students', icon: Users },
            { to: '/admin/enrollments', label: 'Manage Payments', desc: 'Approve or reject payments', icon: CreditCard },
          ].map(({ to, label, desc, icon: Icon }) => (
            <Link key={to} to={to} className="bg-[#111111] border border-[#27272A] rounded-xl p-6 hover:border-[#D4AF37]/50 transition-all group">
              <Icon className="w-6 h-6 text-[#D4AF37] mb-3" />
              <h3 className="text-sm font-bold text-white mb-1 group-hover:text-[#D4AF37] transition-colors">{label}</h3>
              <p className="text-xs text-[#A1A1AA]">{desc}</p>
              <ArrowRight className="w-4 h-4 text-[#D4AF37] mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
