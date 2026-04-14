import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getExpenses, addExpense, updateExpense, deleteExpense, getExpenseStats } from '../../lib/api';
import { toast } from 'sonner';
import { GraduationCap, Users, BookOpen, CreditCard, BarChart3, LogOut, FileText, Award, AlertTriangle, Video, Plus, Pencil, Trash2, X, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const NAV = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' }, { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/students', icon: Users, label: 'Students' }, { to: '/admin/enrollments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/admissions', icon: FileText, label: 'Admissions' }, { to: '/admin/diploma-students', icon: Award, label: 'Diploma' },
  { to: '/admin/defaulters', icon: AlertTriangle, label: 'Defaulters' }, { to: '/admin/assignments', icon: FileText, label: 'Assignments' },
  { to: '/admin/video-testimonials', icon: Video, label: 'Videos' }, { to: '/admin/expenses', icon: CreditCard, label: 'Expenses' },
];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AdminExpenses() {
  const { logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ category: 'Staff Salary', description: '', amount: '', month: MONTHS[new Date().getMonth()], year: new Date().getFullYear() });
  const [filterMonth, setFilterMonth] = useState(MONTHS[new Date().getMonth()]);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, statRes] = await Promise.all([getExpenses(), getExpenseStats()]);
      setExpenses(expRes.data);
      setStats(statRes.data);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    const payload = { ...form, amount: parseFloat(form.amount) };
    try {
      if (editItem) { await updateExpense(editItem.expense_id, payload); toast.success('Updated!'); }
      else { await addExpense(payload); toast.success('Added!'); }
      setShowAdd(false); setEditItem(null);
      setForm({ category: 'Staff Salary', description: '', amount: '', month: MONTHS[new Date().getMonth()], year: new Date().getFullYear() });
      load();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => { if (!window.confirm('Delete this expense?')) return; try { await deleteExpense(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } };

  const openEdit = (exp) => {
    setEditItem(exp);
    setForm({ category: exp.category, description: exp.description || '', amount: String(exp.amount), month: exp.month, year: exp.year });
    setShowAdd(true);
  };

  const filtered = expenses.filter(e => e.month === filterMonth && e.year === filterYear);
  const filteredTotal = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const currentMonthStats = stats?.monthly?.find(m => m.month === filterMonth && m.year === filterYear);

  // Simple bar chart
  const chartData = stats?.monthly?.slice(-6) || [];
  const maxVal = Math.max(...chartData.map(d => Math.max(d.total_expenses, d.total_revenue)), 1);

  return (
    <div data-testid="admin-expenses-page" className="min-h-screen bg-[#050505] flex">
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#27272A] hidden md:flex flex-col">
        <div className="p-5 border-b border-[#27272A]"><Link to="/" className="flex items-center gap-2"><GraduationCap className="w-6 h-6 text-[#D4AF37]" /><span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span></Link></div>
        <nav className="flex-1 p-3 space-y-1">{NAV.map(({ to, icon: Icon, label }) => (<Link key={to} to={to} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${to === '/admin/expenses' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}`}><Icon className="w-4 h-4" /> {label}</Link>))}</nav>
        <div className="p-3 border-t border-[#27272A]"><button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 w-full"><LogOut className="w-4 h-4" /> Logout</button></div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
        <div className="md:hidden flex items-center justify-between mb-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0"><GraduationCap className="w-5 h-5 text-[#D4AF37]" /><span className="text-sm font-bold text-white">OEC <span className="text-[#D4AF37]">Tech</span></span></div>
          <div className="flex gap-1">{NAV.map(({ to, label }) => (<Link key={to} to={to} className={`p-2 rounded-lg text-[10px] whitespace-nowrap ${to === '/admin/expenses' ? 'text-[#D4AF37] bg-white/5' : 'text-[#A1A1AA] hover:bg-white/5'}`}>{label}</Link>))}</div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#D4AF37]" /> Expenses Management</h1>
          <button data-testid="add-expense-btn" onClick={() => { setEditItem(null); setForm({ category: 'Staff Salary', description: '', amount: '', month: filterMonth, year: filterYear }); setShowAdd(true); }} className="btn-gold px-4 py-2 text-xs flex items-center gap-1"><Plus className="w-4 h-4" /> Add Expense</button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#111] border border-[#27272A] rounded-xl p-4"><DollarSign className="w-5 h-5 text-[#D4AF37] mb-2" /><p className="text-xl font-bold text-white">PKR {stats.current_total_expenses?.toLocaleString()}</p><p className="text-[10px] text-[#A1A1AA]">This Month Expenses</p></div>
            <div className="bg-[#111] border border-[#27272A] rounded-xl p-4"><TrendingUp className="w-5 h-5 text-green-400 mb-2" /><p className="text-xl font-bold text-white">PKR {(currentMonthStats?.total_revenue||0).toLocaleString()}</p><p className="text-[10px] text-[#A1A1AA]">Revenue ({filterMonth.slice(0,3)})</p></div>
            <div className="bg-[#111] border border-[#27272A] rounded-xl p-4"><TrendingDown className="w-5 h-5 text-red-400 mb-2" /><p className="text-xl font-bold text-white">PKR {filteredTotal.toLocaleString()}</p><p className="text-[10px] text-[#A1A1AA]">Expenses ({filterMonth.slice(0,3)})</p></div>
            <div className="bg-[#111] border border-[#27272A] rounded-xl p-4"><BarChart3 className="w-5 h-5 text-blue-400 mb-2" /><p className={`text-xl font-bold ${((currentMonthStats?.total_revenue||0)-filteredTotal)>=0?'text-green-400':'text-red-400'}`}>PKR {((currentMonthStats?.total_revenue||0)-filteredTotal).toLocaleString()}</p><p className="text-[10px] text-[#A1A1AA]">Profit/Loss</p></div>
          </div>
        )}

        {/* Revenue vs Expenses Chart */}
        {chartData.length > 0 && (
          <div className="bg-[#111] border border-[#27272A] rounded-xl p-5 mb-6">
            <h3 className="text-sm font-bold text-white mb-4">Revenue vs Expenses (Last 6 Months)</h3>
            <div className="flex items-end gap-3 h-40">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex gap-1 items-end w-full h-32">
                    <div className="flex-1 bg-green-500/20 rounded-t-md relative group" style={{ height: `${(d.total_revenue / maxVal) * 100}%`, minHeight: '4px' }}>
                      <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500/90 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap">PKR {d.total_revenue.toLocaleString()}</div>
                    </div>
                    <div className="flex-1 bg-red-500/20 rounded-t-md relative group" style={{ height: `${(d.total_expenses / maxVal) * 100}%`, minHeight: '4px' }}>
                      <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500/90 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap">PKR {d.total_expenses.toLocaleString()}</div>
                    </div>
                  </div>
                  <span className="text-[9px] text-[#A1A1AA]">{d.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 justify-center"><span className="flex items-center gap-1 text-[10px] text-[#A1A1AA]"><div className="w-3 h-3 rounded bg-green-500/20" /> Revenue</span><span className="flex items-center gap-1 text-[10px] text-[#A1A1AA]"><div className="w-3 h-3 rounded bg-red-500/20" /> Expenses</span></div>
          </div>
        )}

        {/* Category Breakdown */}
        {stats?.current_breakdown && Object.keys(stats.current_breakdown).length > 0 && (
          <div className="bg-[#111] border border-[#27272A] rounded-xl p-5 mb-6">
            <h3 className="text-sm font-bold text-white mb-3">Category Breakdown ({stats.current_month})</h3>
            <div className="space-y-2">{Object.entries(stats.current_breakdown).map(([cat, amt]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-xs text-[#A1A1AA]">{cat}</span>
                <div className="flex items-center gap-3"><div className="w-24 h-2 bg-[#27272A] rounded-full overflow-hidden"><div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${(amt / stats.current_total_expenses) * 100}%` }} /></div><span className="text-xs text-white font-medium w-24 text-right">PKR {amt.toLocaleString()}</span></div>
              </div>
            ))}</div>
          </div>
        )}

        {/* Filter & List */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          <select data-testid="expense-month-filter" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="bg-[#111] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))} className="bg-[#111] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="text-xs text-[#A1A1AA]">{filtered.length} expenses | Total: <strong className="text-white">PKR {filteredTotal.toLocaleString()}</strong></span>
        </div>

        {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div> :
        filtered.length === 0 ? <div className="text-center py-16 text-[#A1A1AA] text-sm">No expenses for {filterMonth} {filterYear}</div> :
        <div className="space-y-3">
          {filtered.map(exp => (
            <div key={exp.expense_id} data-testid={`expense-${exp.expense_id}`} className="bg-[#111] border border-[#27272A] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center"><DollarSign className="w-5 h-5 text-[#D4AF37]" /></div>
                <div>
                  <p className="text-sm font-semibold text-white">{exp.category}</p>
                  {exp.description && <p className="text-[10px] text-[#A1A1AA]">{exp.description}</p>}
                  <p className="text-[10px] text-[#71717A]">{exp.month} {exp.year}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-red-400">PKR {exp.amount?.toLocaleString()}</span>
                <button onClick={() => openEdit(exp)} className="p-2 text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(exp.expense_id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>}
      </main>

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onClick={() => { setShowAdd(false); setEditItem(null); }}>
          <div className="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-white">{editItem ? 'Edit' : 'Add'} Expense</h3><button onClick={() => { setShowAdd(false); setEditItem(null); }}><X className="w-5 h-5 text-[#A1A1AA]" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Category</label>
                <select data-testid="expense-category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none appearance-none">
                  {(stats?.categories || ['Staff Salary','Building Rent','Electricity Bill','Internet Bill','Sweeper Salary','Admin Salary','Other Expenses']).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Amount (PKR)</label><input data-testid="expense-amount" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="Enter amount" className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none" /></div>
              <div><label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional details" className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Month</label><select value={form.month} onChange={e => setForm({...form, month: e.target.value})} className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none appearance-none">{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                <div><label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Year</label><select value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none appearance-none">{[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}</select></div>
              </div>
              <button data-testid="save-expense-btn" type="submit" className="btn-gold w-full py-2.5 text-sm">{editItem ? 'Update' : 'Add'} Expense</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
