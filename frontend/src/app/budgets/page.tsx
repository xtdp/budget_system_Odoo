"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus } from 'lucide-react';

export default function BudgetListPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/finance/budgets/');
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Helper: Smart Progress Bar Color
  const getProgressColor = (planned: number, actual: number) => {
    const percentage = (actual / planned) * 100;
    
    // Scenario 1: Income/Sales (Positive Plan) - Earning MORE is GOOD (Green/Gold)
    // Scenario 2: Expense (If you handle expenses as positive numbers in budget lines) - Spending MORE is BAD (Red)
    
    // Assuming standard "Expense Budget" behavior for now:
    if (percentage > 100) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]'; // 🚨 Over Budget
    if (percentage > 85) return 'bg-orange-500'; // ⚠️ Warning Zone
    return 'bg-green-500'; // ✅ Safe Zone
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold">Budget Management</h1>
        </div>
        <button 
          onClick={() => router.push('/budgets/create')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-bold"
        >
          <Plus size={18} className="mr-2" /> New Budget
        </button>
      </div>

      {/* Budget List */}
      <div className="max-w-6xl mx-auto space-y-6">
        {loading ? <p className="text-slate-500 animate-pulse">Loading financial data...</p> : budgets.map((budget: any) => (
          <div key={budget.id} className="bg-[#1e293b] border border-slate-700 rounded-xl p-6 shadow-xl hover:border-slate-600 transition-all">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{budget.name}</h2>
                <p className="text-slate-400 text-sm mt-1">📅 {budget.start_date} to {budget.end_date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                budget.state === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'
              }`}>
                {budget.state}
              </span>
            </div>

            <div className="space-y-4">
              {budget.lines.map((line: any) => {
                const actual = Math.abs(line.actual_amount); // Ensure positive for display
                const rawPercentage = (actual / line.planned_amount) * 100;
                // 🔒 CAP width at 100% so it never breaks the UI
                const visualWidth = Math.min(rawPercentage, 100);
                
                return (
                  <div key={line.id} className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-200">{line.account_name}</span>
                      <span className="text-sm font-mono text-slate-400">
                        {/* Show real numbers */}
                        <span className={actual > line.planned_amount ? "text-red-400 font-bold" : "text-slate-400"}>
                            ₹{actual.toLocaleString()}
                        </span> 
                        <span className="mx-2">/</span> 
                        ₹{line.planned_amount.toLocaleString()}
                      </span>
                    </div>
                    
                    {/* The Visual Bar Container */}
                    <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden relative">
                       {/* The Actual Bar */}
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${getProgressColor(line.planned_amount, actual)}`} 
                        style={{ width: `${visualWidth}%` }}
                      ></div>
                    </div>
                    
                    {/* Percentage Text below */}
                    <div className="text-right mt-1">
                        <span className="text-[10px] text-slate-500 font-bold">
                            {rawPercentage.toFixed(1)}% Used
                        </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
        
        {budgets.length === 0 && !loading && (
            <div className="text-center p-12 border-2 border-dashed border-slate-700 rounded-xl">
                <p className="text-slate-500 mb-4">No budgets found.</p>
                <button onClick={() => router.push('/budgets/create')} className="text-blue-400 underline">Create your first budget</button>
            </div>
        )}
      </div>
    </div>
  );
}