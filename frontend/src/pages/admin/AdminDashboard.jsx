import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { GraduationCap, Users, BookOpen, CreditCard, LogOut, BarChart3, TrendingUp, Calendar, CheckCircle2, FileText, Award, Clock, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';

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

function GrowthChart({ data }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => Math.max(d.students, d.enrollments)), 1);
  return (
    <div data-testid="growth-chart" className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#D4AF37]" /> Monthly Growth</h3>
        <div className="flex gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span> Students</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full"></span> Enrollments</span>
        </div>
      </div>
      <div className="flex items-end gap-2 h-36">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '120px' }}>
              <div className="w-3 bg-[#D4AF37] rounded-t transition-all" style={{ height: `${Math.max(4, (d.students / maxVal) * 100)}%` }}
                title={`Students: ${d.students}`} />
              <div className="w-3 bg-blue-400 rounded-t transition-all" style={{ height: `${Math.max(4, (d.enrollments / maxVal) * 100)}%` }}
                title={`Enrollments: ${d.enrollments}`} />
            </div>
            <span className="text-[8px] text-[#71717A] text-center leading-tight">{d.month.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
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

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
        <div className="md:hidden flex items-center justify-between mb-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span>
          </div>
          <div className="flex gap-1">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} className={`p-2 rounded-lg text-[10px] whitespace-nowrap ${to === '/admin' ? 'text-[#D4AF37] bg-white/5' : 'text-[#A1A1AA] hover:bg-white/5'}`}>{label}</Link>
            ))}
          </div>
        </div>

        <h1 className="text-xl font-bold text-white mb-6">Dashboard</h1>

        {/* Row 1: Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {[
            { label: 'Courses', value: stats?.total_courses || 0, icon: BookOpen, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Students', value: stats?.total_students || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Diploma Students', value: stats?.total_diploma_students || 0, icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Enrollments', value: stats?.total_enrollments || 0, icon: CreditCard, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Pending', value: stats?.total_pending_approval || 0, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Defaulters', value: stats?.defaulters_count || 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} data-testid={`stat-${label.toLowerCase().replace(/ /g, '-')}`} className="bg-[#111111] border border-[#27272A] rounded-xl p-4">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-[10px] text-[#A1A1AA] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Row 2: Revenue Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div data-testid="stat-admission-inst1" className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold text-[#A1A1AA]">Admission + 1st Installment</span>
            </div>
            <p className="text-2xl font-bold text-[#D4AF37]">PKR {(stats?.admission_plus_inst1 || 0).toLocaleString()}</p>
            <p className="text-[10px] text-[#A1A1AA] mt-1">Total collected</p>
          </div>
          <div data-testid="stat-2nd-installment" className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-[#A1A1AA]">2nd Installment</span>
            </div>
            <p className="text-2xl font-bold text-green-400">PKR {(stats?.inst2_total || 0).toLocaleString()}</p>
            <p className="text-[10px] text-[#A1A1AA] mt-1">Total collected</p>
          </div>
          <div data-testid="stat-monthly-revenue" className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold text-[#A1A1AA]">Monthly Revenue</span>
            </div>
            <p className="text-2xl font-bold text-[#D4AF37]">PKR {(stats?.monthly_revenue || 0).toLocaleString()}</p>
            <p className="text-[10px] text-[#A1A1AA] mt-1">{stats?.month_name || 'This month'}</p>
          </div>
          <div className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-[#A1A1AA]">New Students</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.students_this_month || 0}</p>
            <p className="text-[10px] text-[#A1A1AA] mt-1">{stats?.month_name || 'This month'}</p>
          </div>
        </div>

        {/* Row 3: Approvals + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-6">
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            <div data-testid="stat-approved" className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
              <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats?.approved_payments || 0}</p>
              <p className="text-[10px] text-[#A1A1AA] mt-0.5">Approved Students</p>
            </div>
            <div data-testid="stat-pending-approval" className="bg-[#111111] border border-[#27272A] rounded-xl p-5">
              <Clock className="w-5 h-5 text-yellow-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats?.total_pending_approval || 0}</p>
              <p className="text-[10px] text-[#A1A1AA] mt-0.5">Pending Approval</p>
            </div>
          </div>
          <div className="lg:col-span-3">
            <GrowthChart data={stats?.monthly_growth} />
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-sm font-bold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/admin/courses', label: 'Manage Courses', desc: 'Add, edit or remove', icon: BookOpen },
            { to: '/admin/diploma-students', label: 'Manage Diploma Tracks', desc: 'Diploma enrollments', icon: Award },
            { to: '/admin/students', label: 'Manage Students', desc: 'View & manage students', icon: Users },
            { to: '/admin/enrollments', label: 'Manage Payments', desc: 'Approve or reject', icon: CreditCard },
          ].map(({ to, label, desc, icon: Icon }) => (
            <Link key={to} to={to} data-testid={`quick-action-${label.toLowerCase().replace(/ /g, '-')}`}
              className="bg-[#111111] border border-[#27272A] rounded-xl p-4 sm:p-5 hover:border-[#D4AF37]/50 transition-all group">
              <Icon className="w-5 h-5 text-[#D4AF37] mb-2" />
              <h3 className="text-xs font-bold text-white mb-0.5 group-hover:text-[#D4AF37] transition-colors">{label}</h3>
              <p className="text-[10px] text-[#A1A1AA]">{desc}</p>
              <ArrowRight className="w-3 h-3 text-[#D4AF37] mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
