"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, History, PieChart } from 'lucide-react';

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

  const handleRevise = async (id: number) => {
      if(!confirm("Create a revision for this budget? The old one will be archived.")) return;
      try {
          await api.post(`/finance/budgets/${id}/revise/`);
          fetchBudgets(); // Refresh list
      } catch (err) {
          alert("Failed to revise budget");
      }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PieChart className="text-pink-400" /> Budget Management
          </h1>
        </div>
        <button 
          onClick={() => router.push('/budgets/create')} 
          className="bg-[#1e293b] border border-pink-500 text-pink-400 hover:bg-pink-900/20 px-6 py-2 rounded-lg flex items-center font-bold"
        >
          <Plus size={18} className="mr-2" /> New Budget
        </button>
      </div>

      {/* List Table matching image_da0a7c.png */}
      <div className="max-w-6xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden shadow-xl min-h-[500px]">
        
        {/* Table Header */}
        <div className="flex border-b border-slate-600 p-4 text-slate-400 text-sm font-bold uppercase tracking-wider">
            <div className="flex-1 text-pink-400">Budget Name</div>
            <div className="w-32 text-pink-400">Start Date</div>
            <div className="w-32 text-pink-400">End Date</div>
            <div className="w-32 text-center text-pink-400">Status</div>
            <div className="w-24 text-center text-pink-400">Pie Chart</div>
            <div className="w-24 text-right text-pink-400">Actions</div>
        </div>

        {/* Table Rows */}
        {loading ? (
            <div className="p-8 text-center text-slate-500">Loading budgets...</div>
        ) : budgets.map((budget: any) => (
            <div key={budget.id} className="flex items-center p-4 border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors group">
                <div className="flex-1 font-bold text-white text-lg cursor-pointer" onClick={() => router.push(`/budgets/edit/${budget.id}`)}>
                    {budget.name}
                    {budget.revision_number > 0 && (
                        <span className="ml-2 text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                            Rev {budget.revision_number}
                        </span>
                    )}
                </div>
                <div className="w-32 text-slate-400 text-sm">{budget.start_date}</div>
                <div className="w-32 text-slate-400 text-sm">{budget.end_date}</div>
                <div className="w-32 text-center">
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${
                        budget.state === 'confirmed' ? 'text-green-400' : 
                        budget.state === 'revised' ? 'text-slate-500' :
                        'text-blue-400'
                    }`}>
                        {budget.state}
                    </span>
                </div>
                <div className="w-24 text-center">
                    <button className="text-slate-500 hover:text-pink-400 transition-colors" title="View Chart">
                        <PieChart size={20} />
                    </button>
                </div>
                <div className="w-24 text-right">
                        {budget.state === 'confirmed' && (
                            <button 
                            onClick={() => handleRevise(budget.id)}
                            className="text-xs font-bold text-slate-500 hover:text-white flex items-center justify-end gap-1 ml-auto"
                            title="Revise Budget"
                            >
                            <History size={14} /> Revise
                            </button>
                        )}
                </div>
            </div>
        ))}

        {budgets.length === 0 && !loading && (
             <div className="p-12 text-center text-slate-500 italic">No budgets found.</div>
        )}
        
        {/* Empty Lines for aesthetic matching wireframe */}
        {[1,2,3,4].map(i => <div key={`e-${i}`} className="border-b border-slate-700/20 h-12"></div>)}

      </div>
    </div>
  );
}