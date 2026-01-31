"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save, History, CheckCircle, PieChart } from 'lucide-react';

export default function BudgetDetailView() {
  const router = useRouter();
  const params = useParams();
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Budget Data
  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      const res = await api.get(`/finance/budgets/${params.id}/`);
      setBudget(res.data);
    } catch (err) {
      alert("Error loading budget");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 NEW: Handle Input Changes (Edit Planned Amount)
  const handleLineChange = (index: number, val: string) => {
      const newBudget = { ...budget };
      newBudget.lines[index].planned_amount = val;
      setBudget(newBudget);
  };

  // 🟢 NEW: Save Changes (PUT Request)
  const handleSave = async () => {
      try {
          await api.put(`/finance/budgets/${budget.id}/`, budget);
          alert("Budget Saved!");
          loadBudget(); // Refresh
      } catch (err) {
          alert("Failed to save changes.");
      }
  };

  // Logic: Revise Budget
  const handleRevise = async () => {
    if (!confirm("Are you sure? This will Archive the current budget and create a new Draft Revision.")) return;
    try {
      const res = await api.post(`/finance/budgets/${budget.id}/revise/`);
      alert("Revision Created!");
      router.push(`/budgets/edit/${res.data.id}`);
    } catch (err) {
      alert("Failed to revise.");
    }
  };

  // Logic: Confirm Budget
  const handleConfirm = async () => {
    try {
      // First save any pending changes
      await api.put(`/finance/budgets/${budget.id}/`, budget);
      // Then confirm
      await api.patch(`/finance/budgets/${budget.id}/`, { state: 'confirmed' });
      loadBudget();
    } catch (err) {
      alert("Failed to confirm.");
    }
  };

  if (loading || !budget) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => router.push('/budgets')} className="text-slate-400 hover:text-white flex items-center border border-slate-600 px-4 py-2 rounded-lg">
            <ArrowLeft className="mr-2" size={18} /> Back to List
            </button>
            <h1 className="text-2xl font-bold">Budget: {budget.name}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl p-8 shadow-2xl">
        
        {/* Status Bar */}
        <div className="flex justify-between items-center border-b border-slate-600 pb-4 mb-8">
            <div className="flex gap-3">
                {/* 🟢 SAVE BUTTON (Only in Draft) */}
                {budget.state === 'draft' && (
                    <button onClick={handleSave} className="bg-[#0f172a] hover:bg-slate-800 text-blue-400 border border-blue-500/50 px-6 py-1.5 rounded text-sm font-bold flex items-center">
                        <Save size={16} className="mr-2"/> Save Draft
                    </button>
                )}

                {/* Confirm Button */}
                {budget.state === 'draft' && (
                    <button onClick={handleConfirm} className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-1.5 rounded text-sm font-bold shadow-lg">
                        Confirm
                    </button>
                )}
                
                {/* Revise Button */}
                {budget.state === 'confirmed' && (
                    <button onClick={handleRevise} className="bg-[#0f172a] border border-pink-500 text-pink-400 hover:bg-pink-900/20 px-6 py-1.5 rounded text-sm font-bold">
                        Revise
                    </button>
                )}
            </div>

            {/* Status Indicator */}
            <div className="flex text-xs font-bold text-slate-500 uppercase tracking-widest gap-2 bg-slate-800 px-4 py-2 rounded-full">
                <span className={budget.state === 'draft' ? "text-white" : ""}>Draft</span> 
                <span>›</span> 
                <span className={budget.state === 'confirmed' ? "text-green-400" : ""}>Confirm</span> 
                <span>›</span> 
                <span className={budget.state === 'revised' ? "text-slate-300" : ""}>Revised</span>
            </div>
        </div>

        {/* Budget Details */}
        <div className="space-y-8">
           <div className="grid grid-cols-2 gap-12">
                <div>
                     <label className="text-pink-400 font-bold text-sm block mb-1">Budget Name</label>
                     <div className="text-xl text-white border-b border-slate-600 pb-1">{budget.name}</div>
                </div>
                <div className="flex gap-8">
                     <div>
                        <label className="text-pink-400 font-bold text-sm block mb-1">Start Date</label>
                        <div className="text-lg text-slate-300 border-b border-slate-600 pb-1">{budget.start_date}</div>
                     </div>
                     <div>
                        <label className="text-pink-400 font-bold text-sm block mb-1">End Date</label>
                        <div className="text-lg text-slate-300 border-b border-slate-600 pb-1">{budget.end_date}</div>
                     </div>
                </div>
           </div>

           {/* Lines Table */}
           <div className="border border-slate-700 rounded-lg overflow-hidden">
               <div className="flex bg-slate-800/50 p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div className="flex-1">Analytic Name</div>
                    <div className="w-40 text-right">Budgeted</div>
                    <div className="w-40 text-right">Achieved (Actual)</div>
                    <div className="w-32 text-right">Performance</div>
               </div>

               {budget.lines.map((line: any, index: number) => {
                    const actual = Math.abs(line.actual_amount); 
                    const percent = line.planned_amount > 0 ? (actual / line.planned_amount) * 100 : 0;
                    
                    return (
                        <div key={line.id} className="flex items-center p-4 border-b border-slate-700/30 text-sm">
                            <div className="flex-1 font-medium text-pink-300">{line.account_name}</div>
                            
                            {/* 🟢 EDITABLE FIELD: If Draft, show Input. Else show Text. */}
                            <div className="w-40 text-right">
                                {budget.state === 'draft' ? (
                                    <input 
                                        type="number" 
                                        className="w-full bg-[#0f172a] border-b border-pink-500 text-right text-white focus:outline-none p-1"
                                        value={line.planned_amount}
                                        onChange={(e) => handleLineChange(index, e.target.value)}
                                    />
                                ) : (
                                    <span className="text-white">₹{parseFloat(line.planned_amount).toLocaleString()}</span>
                                )}
                            </div>

                            <div className="w-40 text-right text-slate-300">₹{actual.toLocaleString()}</div>
                            <div className="w-32 text-right">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    percent > 100 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                }`}>
                                    {percent.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    );
               })}
           </div>
        </div>

      </div>
    </div>
  );
}