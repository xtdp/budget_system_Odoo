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

  const getProgressColor = (planned: number, actual: number) => {
    // Logic: Red if over budget, Green if safe
    const percentage = (Math.abs(actual) / planned) * 100;
    if (percentage > 100) return 'bg-red-500'; 
    if (percentage > 80) return 'bg-orange-500';
    return 'bg-green-500';
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
          onClick={() => router.push('/budgets/create')} // <--- ADD THIS LINK
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={18} className="mr-2" /> New Budget
        </button>
      </div>

      {/* Budget List */}
      <div className="max-w-6xl mx-auto space-y-6">
        {loading ? <p>Loading...</p> : budgets.map((budget: any) => (
          <div key={budget.id} className="bg-[#1e293b] border border-slate-700 rounded-xl p-6 shadow-xl">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{budget.name}</h2>
                <p className="text-slate-400 text-sm">{budget.start_date} to {budget.end_date}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 uppercase">
                {budget.state}
              </span>
            </div>

            <div className="space-y-4">
              {budget.lines.map((line: any) => {
                // Calculate percentage for bar width
                const actual = Math.abs(line.actual_amount);
                const percent = Math.min((actual / line.planned_amount) * 100, 100);
                
                return (
                  <div key={line.id} className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-200">{line.account_name}</span>
                      <span className="text-sm text-slate-400">
                        Spent: ₹{actual} / Target: ₹{line.planned_amount}
                      </span>
                    </div>
                    
                    {/* The Visual Bar */}
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColor(line.planned_amount, actual)} transition-all duration-500`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
        
        {budgets.length === 0 && !loading && (
            <div className="text-center text-slate-500 mt-12">No Budgets Found. Create one in Admin Panel first!</div>
        )}
      </div>
    </div>
  );
}