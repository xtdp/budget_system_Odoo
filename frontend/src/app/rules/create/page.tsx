"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateRulePage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    product_category: '',
    target_account: '',
    priority: 10
  });

  // Fetch Accounts so we can select them in the dropdown
  useEffect(() => {
    api.get('/finance/accounts/').then(res => setAccounts(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/rules/', formData);
      alert("Rule Saved!");
      router.push('/rules');
    } catch (err) {
      alert("Error saving rule");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">New Automation Rule</h1>
        <button onClick={() => router.back()} className="flex items-center text-slate-400 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl p-8 shadow-xl">
        {/* Status Bar (Matching Image Style) */}
        <div className="flex items-center gap-4 border-b border-slate-700 pb-6 mb-8">
          <button className="bg-pink-500/20 text-pink-400 px-4 py-1 rounded border border-pink-500/50 text-sm font-bold">New</button>
          <button className="text-slate-500 px-4 py-1 text-sm font-bold">Confirm</button>
          <div className="flex-1 text-right text-slate-500 text-sm">Status: <span className="text-white">Draft</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-pink-400 text-sm font-bold mb-2">Rule Name</label>
                <input 
                  type="text" 
                  className="bg-transparent border-b border-slate-600 w-full py-2 text-white focus:outline-none focus:border-pink-500"
                  placeholder="e.g. Wood Purchase Rule"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-pink-400 text-sm font-bold mb-2">Product Category (If match)</label>
                <input 
                  type="text" 
                  className="bg-transparent border-b border-slate-600 w-full py-2 text-white focus:outline-none focus:border-pink-500"
                  placeholder="e.g. Raw Material"
                  value={formData.product_category}
                  onChange={e => setFormData({...formData, product_category: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
               <div>
                <label className="block text-pink-400 text-sm font-bold mb-2">Priority</label>
                <input 
                  type="number" 
                  className="bg-transparent border-b border-slate-600 w-full py-2 text-white focus:outline-none focus:border-pink-500"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>

          {/* Bottom Section - The "Action" */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-dashed border-slate-600 mt-8">
            <h3 className="text-slate-400 text-sm font-bold mb-4 uppercase tracking-wider">Auto Apply Analytical Model</h3>
            
            <div className="flex items-center gap-4">
              <label className="text-pink-400 font-bold whitespace-nowrap">Analytics to Apply?</label>
              <select 
                className="bg-[#0f172a] border border-slate-600 rounded px-4 py-2 w-full text-white focus:outline-none focus:border-pink-500"
                value={formData.target_account}
                onChange={e => setFormData({...formData, target_account: e.target.value})}
                required
              >
                <option value="">-- Select Analytical Account --</option>
                {accounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.code})</option>
                ))}
              </select>
            </div>
            
            <p className="text-xs text-slate-500 mt-4 italic">
              "The model is applied if any one field matches the transaction line... making the rule stricter."
            </p>
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg w-full">
            <Save size={18} className="inline mr-2" />
            Save Automation Rule
          </button>
        </form>
      </div>
    </div>
  );
}