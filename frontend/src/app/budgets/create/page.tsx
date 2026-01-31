"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function CreateBudgetPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    state: 'confirmed', 
    lines: [
      { analytical_account: '', planned_amount: 0, type: 'Expense' } 
    ]
  });

  useEffect(() => {
    api.get('/finance/accounts/').then(res => setAccounts(res.data));
  }, []);

  const updateLine = (index: number, field: string, value: any) => {
    const newLines: any = [...formData.lines];
    newLines[index][field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  const addLine = () => {
    setFormData({ ...formData, lines: [...formData.lines, { analytical_account: '', planned_amount: 0, type: 'Expense' }] });
  };

  const removeLine = (index: number) => {
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/budgets/', formData);
      router.push('/budgets');
    } catch (err) {
      alert("Error creating budget");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Top Navigation */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budget Form</h1>
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center border border-slate-600 px-4 py-2 rounded-lg">
          <ArrowLeft className="mr-2" size={18} /> Back
        </button>
      </div>

      <div className="max-w-6xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl p-8 shadow-2xl">
        
        {/* Status Bar - Wireframe Match */}
        <div className="flex justify-between items-center border-b border-slate-600 pb-4 mb-8">
            <div className="flex gap-4">
                <button className="bg-pink-500/20 text-pink-400 px-6 py-1.5 rounded text-sm font-bold border border-pink-500/50">Confirm</button>
                <button className="text-slate-500 hover:text-slate-300 font-bold text-sm px-4">Revise</button>
                <button className="text-slate-500 hover:text-slate-300 font-bold text-sm px-4">Archived</button>
            </div>
            <div className="flex text-xs font-bold text-slate-500 uppercase tracking-widest gap-2 bg-slate-800 px-4 py-1 rounded">
                <span className="text-white">Draft</span> <span>›</span> 
                <span className="text-pink-400">Confirm</span> <span>›</span> 
                <span>Revised</span> <span>›</span> <span>Cancelled</span>
            </div>
        </div>

        <form onSubmit={handleSubmit}>
           
           {/* Header Fields */}
           <div className="space-y-6 mb-12">
                <div className="flex items-center gap-4">
                     <label className="text-pink-400 font-bold text-sm w-32">Budget Name</label>
                     <input type="text" className="flex-1 bg-transparent border-b border-slate-500 text-white py-1 focus:outline-none focus:border-pink-500"
                        placeholder="e.g. January 2026"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="flex items-center gap-4">
                     <label className="text-pink-400 font-bold text-sm w-32">Budget Period</label>
                     <div className="flex items-center gap-4">
                        <span className="text-slate-500 text-xs uppercase">Start Date</span>
                        <input type="date" className="bg-transparent border-b border-slate-500 text-slate-300 py-1 focus:outline-none"
                            value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                        <span className="text-slate-500 text-xs uppercase ml-4">To End Date</span>
                        <input type="date" className="bg-transparent border-b border-slate-500 text-slate-300 py-1 focus:outline-none"
                            value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
                     </div>
                </div>
           </div>

           {/* Lines Table Header */}
           <div className="flex text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-pink-500 pb-2 mb-4">
                <div className="flex-1 text-blue-300">Analytic Name</div>
                <div className="w-32 text-blue-300">Type</div>
                <div className="w-40 text-right text-blue-300">Budgeted Amount</div>
                <div className="w-32 text-right text-blue-300">Achieved Amount</div>
                <div className="w-12"></div>
           </div>

           {/* Lines */}
           <div className="space-y-2 mb-8 min-h-[200px]">
                {formData.lines.map((line, index) => (
                    <div key={index} className="flex items-center text-sm py-2 border-b border-slate-700/30">
                        <div className="flex-1 pr-4">
                            <select 
                                className="w-full bg-transparent border-none text-pink-300 focus:ring-0 focus:outline-none cursor-pointer"
                                value={line.analytical_account}
                                onChange={(e) => updateLine(index, 'analytical_account', e.target.value)}
                                required
                            >
                                <option value="" className="bg-[#1e293b] text-slate-500">Select Analytic...</option>
                                {accounts.map((a: any) => <option key={a.id} value={a.id} className="bg-[#1e293b]">{a.name}</option>)}
                            </select>
                        </div>
                        <div className="w-32">
                             <select 
                                className="bg-transparent text-slate-400 border-none focus:ring-0"
                                value={line.type}
                                onChange={(e) => updateLine(index, 'type', e.target.value)}
                             >
                                <option value="Income" className="bg-[#1e293b]">Income</option>
                                <option value="Expense" className="bg-[#1e293b]">Expense</option>
                             </select>
                        </div>
                        <div className="w-40">
                             <input type="number" 
                                className="w-full bg-transparent text-right text-white focus:outline-none border-b border-slate-700 focus:border-pink-500"
                                value={line.planned_amount}
                                onChange={(e) => updateLine(index, 'planned_amount', e.target.value)}
                             />
                        </div>
                        <div className="w-32 text-right text-green-400 font-mono">
                             {/* Placeholder for Achieved (Computed later) */}
                             0.00
                        </div>
                        <div className="w-12 text-right">
                            <button type="button" onClick={() => removeLine(index)} className="text-slate-600 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
           </div>

           <button type="button" onClick={addLine} className="text-slate-500 text-sm font-bold hover:text-white mb-8 block border border-dashed border-slate-600 w-full py-2 rounded">
               + Add Budget Line
           </button>

           <div className="flex justify-end">
             <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-10 rounded shadow-lg shadow-pink-500/20 transition-all">
                Confirm Budget
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}