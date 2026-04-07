import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStudents } from '../../lib/api';
import { GraduationCap, Users, BookOpen, CreditCard, ArrowLeft, Mail, BarChart3, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export default function AdminStudents() {
  const { logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStudents().then(r => { setStudents(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const navItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { to: '/admin/students', icon: Users, label: 'Students', active: true },
    { to: '/admin/enrollments', icon: CreditCard, label: 'Enrollments' },
    { to: '/dashboard', icon: Home, label: 'Student View' },
  ];

  return (
    <div data-testid="admin-students" className="min-h-screen bg-[#050505] flex">
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
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <span className="text-sm text-[#A1A1AA]">{students.length} students</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-[#27272A] mx-auto mb-4" />
            <p className="text-[#A1A1AA]">No students registered yet.</p>
          </div>
        ) : (
          <div className="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#27272A]">
                    <th className="text-left text-xs text-[#A1A1AA] font-semibold px-6 py-4">Student</th>
                    <th className="text-left text-xs text-[#A1A1AA] font-semibold px-6 py-4">Email</th>
                    <th className="text-left text-xs text-[#A1A1AA] font-semibold px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.user_id} className="border-b border-[#27272A] last:border-0 hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {student.picture ? (
                            <img src={student.picture} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
                              {student.name?.charAt(0)}
                            </div>
                          )}
                          <span className="text-sm text-white font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#A1A1AA] flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {student.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-[#A1A1AA]">
                          {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
