"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

export default function CreateBudgetPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    state: 'confirmed', // Auto-confirm for hackathon speed
    lines: [
      { analytical_account: '', planned_amount: 0 } // Start with 1 empty line
    ]
  });

  useEffect(() => {
    // Fetch Analytical Accounts so user can select them
    api.get('/finance/accounts/').then(res => setAccounts(res.data));
  }, []);

  // Handle Form Changes
  const updateLine = (index: number, field: string, value: any) => {
    const newLines: any = [...formData.lines];
    newLines[index][field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { analytical_account: '', planned_amount: 0 }]
    });
  };

  const removeLine = (index: number) => {
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/budgets/', formData);
      alert("Budget Created Successfully!");
      router.push('/budgets');
    } catch (err) {
      console.error(err);
      alert("Error creating budget");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">New Budget Plan</h1>
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center">
          <ArrowLeft className="mr-2" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl p-8 shadow-xl">
        
        {/* Budget Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-slate-700 pb-8">
          <div className="md:col-span-2">
            <label className="block text-slate-400 text-sm font-bold mb-2">Budget Name</label>
            <input 
              type="text" 
              className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3"
              placeholder="e.g. IT Department 2026"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Start Date</label>
            <input 
              type="date" 
              className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">End Date</label>
            <input 
              type="date" 
              className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3"
              value={formData.end_date}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              required
            />
          </div>
        </div>

        {/* Budget Lines */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-slate-300">Budget Targets</h3>
          <div className="space-y-4">
            {formData.lines.map((line, index) => (
              <div key={index} className="flex gap-4 items-end bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Analytical Account</label>
                  <select 
                    className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-sm text-white"
                    value={line.analytical_account}
                    onChange={(e) => updateLine(index, 'analytical_account', e.target.value)}
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                
                <div className="w-48">
                  <label className="text-xs text-slate-500 mb-1 block">Target Amount (₹)</label>
                  <input 
                    type="number" 
                    className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-sm text-white"
                    value={line.planned_amount}
                    onChange={(e) => updateLine(index, 'planned_amount', e.target.value)}
                    required
                  />
                </div>

                <button type="button" onClick={() => removeLine(index)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <button type="button" onClick={addLine} className="mt-4 flex items-center text-blue-400 hover:text-blue-300 font-medium text-sm">
            <Plus size={16} className="mr-2" /> Add Target Line
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 border-t border-slate-700 pt-6">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg border border-slate-600 hover:bg-slate-800">
            Cancel
          </button>
          <button type="submit" className="px-8 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold shadow-lg flex items-center">
            <Save size={18} className="mr-2" /> Confirm Budget
          </button>
        </div>

      </form>
    </div>
  );
}