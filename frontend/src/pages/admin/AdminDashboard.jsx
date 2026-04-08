import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { GraduationCap, Users, BookOpen, CreditCard, Star, MessageSquare, ArrowRight, Shield, LogOut, Home, BarChart3, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

const NAV = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/enrollments', icon: CreditCard, label: 'Payments' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-[#050505] flex">
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-5 border-b border-[#27272A]">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">Admin <span className="text-[#D4AF37]">Panel</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} data-testid={`admin-nav-${label.toLowerCase()}`}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                to === '/admin' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#27272A]">
          <p className="text-[10px] text-[#A1A1AA] mb-2 px-3 truncate">{user?.name}</p>
          <button onClick={logout} data-testid="admin-logout-btn" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 w-full transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="md:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">Admin</span>
          </div>
          <div className="flex gap-1">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} className="p-2 text-[#A1A1AA] hover:bg-white/5 rounded-lg text-[10px]">{label}</Link>
            ))}
          </div>
        </div>

        <h1 className="text-xl font-bold text-white mb-6">Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Students', value: stats?.total_students || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Courses', value: stats?.total_courses || 0, icon: BookOpen, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Enrollments', value: stats?.total_enrollments || 0, icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Pending', value: stats?.pending_payments || 0, icon: CreditCard, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-[#111111] border border-[#27272A] rounded-xl p-4">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-[10px] text-[#A1A1AA] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <div className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold text-[#A1A1AA]">Monthly Revenue</span>
            </div>
            <p className="text-2xl font-bold text-[#D4AF37]">PKR {(stats?.monthly_revenue || 0).toLocaleString()}</p>
            <p className="text-[10px] text-[#A1A1AA] mt-1">This month</p>
          </div>
          <div className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-[#A1A1AA]">New Students</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.students_this_month || 0}</p>
            <p className="text-[10px] text-[#A1A1AA] mt-1">This month</p>
          </div>
          <div className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-[#A1A1AA]">Approved</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.approved_payments || 0}</p>
            <p className="text-[10px] text-[#A1A1AA] mt-1">Total approved</p>
          </div>
        </div>

        <h2 className="text-sm font-bold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { to: '/admin/courses', label: 'Manage Courses', desc: 'Add, edit or remove', icon: BookOpen },
            { to: '/admin/students', label: 'Students', desc: 'View & manage students', icon: Users },
            { to: '/admin/enrollments', label: 'Payments', desc: 'Approve or reject', icon: CreditCard },
          ].map(({ to, label, desc, icon: Icon }) => (
            <Link key={to} to={to} className="bg-[#111111] border border-[#27272A] rounded-xl p-5 hover:border-[#D4AF37]/50 transition-all group">
              <Icon className="w-5 h-5 text-[#D4AF37] mb-2" />
              <h3 className="text-xs font-bold text-white mb-0.5 group-hover:text-[#D4AF37] transition-colors">{label}</h3>
              <p className="text-[10px] text-[#A1A1AA]">{desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
