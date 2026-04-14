// Admin Expenses
function renderAdminExpensesPage() {
  let expenses = [], stats = null, filterMonth = new Date().toLocaleString('en',{month:'long'}), filterYear = new Date().getFullYear();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function render() {
    const filtered = expenses.filter(e => e.month === filterMonth && e.year === filterYear);
    const filteredTotal = filtered.reduce((s, e) => s + (e.amount||0), 0);
    const curStats = stats?.monthly?.find(m => m.month === filterMonth && m.year === filterYear);
    const chartData = stats?.monthly?.slice(-6) || [];
    const maxVal = Math.max(...chartData.map(d => Math.max(d.total_expenses, d.total_revenue)), 1);

    renderDashboardPage(`<div data-testid="admin-expenses-page" class="min-h-screen bg-[#050505] flex">${Components.adminSidebar('/admin/expenses')}<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">${Components.adminMobileNav('/admin/expenses')}
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-xl font-bold text-white flex items-center gap-2"><i data-lucide="dollar-sign" class="w-5 h-5 text-[#D4AF37]"></i>Expenses Management</h1>
        <button data-testid="add-expense-btn" onclick="document.getElementById('exp-modal').classList.remove('hidden');initIcons()" class="btn-gold px-4 py-2 text-xs"><i data-lucide="plus" class="w-4 h-4 inline mr-1"></i>Add Expense</button>
      </div>

      ${stats ? `<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-[#111] border border-[#27272A] rounded-xl p-4"><i data-lucide="dollar-sign" class="w-5 h-5 text-[#D4AF37] mb-2"></i><p class="text-xl font-bold text-white">PKR ${(stats.current_total_expenses||0).toLocaleString()}</p><p class="text-[10px] text-[#A1A1AA]">This Month Expenses</p></div>
        <div class="bg-[#111] border border-[#27272A] rounded-xl p-4"><i data-lucide="trending-up" class="w-5 h-5 text-green-400 mb-2"></i><p class="text-xl font-bold text-white">PKR ${(curStats?.total_revenue||0).toLocaleString()}</p><p class="text-[10px] text-[#A1A1AA]">Revenue</p></div>
        <div class="bg-[#111] border border-[#27272A] rounded-xl p-4"><i data-lucide="trending-down" class="w-5 h-5 text-red-400 mb-2"></i><p class="text-xl font-bold text-white">PKR ${filteredTotal.toLocaleString()}</p><p class="text-[10px] text-[#A1A1AA]">Expenses (${filterMonth.slice(0,3)})</p></div>
        <div class="bg-[#111] border border-[#27272A] rounded-xl p-4"><i data-lucide="bar-chart-3" class="w-5 h-5 text-blue-400 mb-2"></i><p class="text-xl font-bold ${((curStats?.total_revenue||0)-filteredTotal)>=0?'text-green-400':'text-red-400'}">PKR ${((curStats?.total_revenue||0)-filteredTotal).toLocaleString()}</p><p class="text-[10px] text-[#A1A1AA]">Profit/Loss</p></div>
      </div>` : ''}

      ${chartData.length > 0 ? `<div class="bg-[#111] border border-[#27272A] rounded-xl p-5 mb-6">
        <h3 class="text-sm font-bold text-white mb-4">Revenue vs Expenses (Last 6 Months)</h3>
        <div class="flex items-end gap-3 h-40">${chartData.map(d => `<div class="flex-1 flex flex-col items-center gap-1"><div class="flex gap-1 items-end w-full h-32"><div class="flex-1 bg-green-500/20 rounded-t-md" style="height:${(d.total_revenue/maxVal)*100}%;min-height:4px" title="Revenue: PKR ${d.total_revenue.toLocaleString()}"></div><div class="flex-1 bg-red-500/20 rounded-t-md" style="height:${(d.total_expenses/maxVal)*100}%;min-height:4px" title="Expenses: PKR ${d.total_expenses.toLocaleString()}"></div></div><span class="text-[9px] text-[#A1A1AA]">${d.label}</span></div>`).join('')}</div>
        <div class="flex gap-4 mt-3 justify-center"><span class="flex items-center gap-1 text-[10px] text-[#A1A1AA]"><div class="w-3 h-3 rounded bg-green-500/20"></div>Revenue</span><span class="flex items-center gap-1 text-[10px] text-[#A1A1AA]"><div class="w-3 h-3 rounded bg-red-500/20"></div>Expenses</span></div>
      </div>` : ''}

      <div class="flex flex-wrap gap-3 mb-4 items-center">
        <i data-lucide="calendar" class="w-4 h-4 text-[#D4AF37]"></i>
        <select data-testid="expense-month-filter" id="exp-month" class="bg-[#111] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none">${MONTHS.map(m=>`<option value="${m}" ${m===filterMonth?'selected':''}>${m}</option>`).join('')}</select>
        <select id="exp-year" class="bg-[#111] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none">${[2024,2025,2026,2027].map(y=>`<option value="${y}" ${y===filterYear?'selected':''}>${y}</option>`).join('')}</select>
        <span class="text-xs text-[#A1A1AA]">${filtered.length} expenses | Total: <strong class="text-white">PKR ${filteredTotal.toLocaleString()}</strong></span>
      </div>

      ${filtered.length===0?`<div class="text-center py-16 text-[#A1A1AA] text-sm">No expenses for ${filterMonth} ${filterYear}</div>`:
      `<div class="space-y-3">${filtered.map(exp=>`<div data-testid="expense-${exp.expense_id}" class="bg-[#111] border border-[#27272A] rounded-xl p-4 flex items-center justify-between">
        <div class="flex items-center gap-3"><div class="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center"><i data-lucide="dollar-sign" class="w-5 h-5 text-[#D4AF37]"></i></div>
          <div><p class="text-sm font-semibold text-white">${exp.category}</p>${exp.description?`<p class="text-[10px] text-[#A1A1AA]">${exp.description}</p>`:''}<p class="text-[10px] text-[#71717A]">${exp.month} ${exp.year}</p></div></div>
        <div class="flex items-center gap-3"><span class="text-base font-bold text-red-400">PKR ${(exp.amount||0).toLocaleString()}</span>
          <button onclick="if(confirm('Delete?'))Api.deleteExpense('${exp.expense_id}').then(()=>{showToast('Deleted');loadExp()}).catch(()=>showToast('Failed','error'))" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>
      </div>`).join('')}</div>`}

      <!-- Add Modal -->
      <div id="exp-modal" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onclick="if(event.target===this)this.classList.add('hidden')">
        <div class="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-md p-6" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between mb-4"><h3 class="text-sm font-bold text-white">Add Expense</h3><button onclick="document.getElementById('exp-modal').classList.add('hidden')"><i data-lucide="x" class="w-5 h-5 text-[#A1A1AA]"></i></button></div>
          <form id="exp-form" class="space-y-3">
            <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Category</label>
              <select data-testid="expense-category" name="category" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none">${(stats?.categories||['Staff Salary','Building Rent','Electricity Bill','Internet Bill','Sweeper Salary','Admin Salary','Other Expenses']).map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
            <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Amount (PKR)</label><input data-testid="expense-amount" name="amount" type="number" placeholder="Enter amount" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
            <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Description</label><input name="description" placeholder="Optional details" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Month</label><select name="month" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none">${MONTHS.map(m=>`<option value="${m}" ${m===filterMonth?'selected':''}>${m}</option>`).join('')}</select></div>
              <div><label class="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Year</label><select name="year" class="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none">${[2024,2025,2026,2027].map(y=>`<option value="${y}" ${y===filterYear?'selected':''}>${y}</option>`).join('')}</select></div>
            </div>
            <button data-testid="save-expense-btn" type="submit" class="btn-gold w-full py-2.5 text-sm">Add Expense</button>
          </form>
        </div>
      </div>
    </main></div>`);

    document.getElementById('exp-month')?.addEventListener('change', (e) => { filterMonth = e.target.value; render(); });
    document.getElementById('exp-year')?.addEventListener('change', (e) => { filterYear = parseInt(e.target.value); render(); });
    document.getElementById('exp-form')?.addEventListener('submit', async (e) => {
      e.preventDefault(); const fd = new FormData(e.target);
      const d = { category: fd.get('category'), description: fd.get('description')||'', amount: parseFloat(fd.get('amount')), month: fd.get('month'), year: parseInt(fd.get('year')) };
      if (!d.amount || d.amount <= 0) { showToast('Enter valid amount', 'error'); return; }
      try { await Api.addExpense(d); showToast('Added!'); document.getElementById('exp-modal').classList.add('hidden'); loadExp(); } catch { showToast('Failed', 'error'); }
    });
  }

  function loadExp() { Promise.all([Api.getExpenses(), Api.getExpenseStats()]).then(([e, s]) => { expenses = e; stats = s; render(); }).catch(() => render()); }
  window.loadExp = loadExp;
  loadExp();
}
