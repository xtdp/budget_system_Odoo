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

  useEffect(() => {
    api.get('/finance/accounts/').then(res => setAccounts(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/rules/', formData);
      router.push('/rules');
    } catch (err) {
      alert("Error saving rule");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Auto Analytical Model</h1>
        <button onClick={() => router.back()} className="flex items-center text-slate-400 hover:text-white border border-slate-600 px-4 py-2 rounded-lg">
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl p-10 shadow-2xl">
        
        {/* Header Tabs matching Wireframe */}
        <div className="flex justify-between items-center border-b border-slate-600 pb-4 mb-10">
            <div className="flex gap-4">
                <button className="bg-pink-500/20 text-pink-400 px-6 py-1.5 rounded text-sm font-bold border border-pink-500/50">New</button>
                <button className="text-slate-500 hover:text-slate-300 font-bold text-sm px-4">Confirm</button>
                <button className="text-slate-500 hover:text-slate-300 font-bold text-sm px-4">Archived</button>
            </div>
            <div className="flex text-xs font-bold text-slate-500 uppercase tracking-widest gap-2">
                <span className="text-white">Draft</span> <span>›</span> <span>Confirm</span> <span>›</span> <span>Cancelled</span>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Rule Name */}
          <div>
             <label className="text-pink-400 font-bold text-sm block mb-2">Model Name</label>
             <input type="text" className="w-1/2 bg-transparent border-b border-slate-500 text-white py-1 focus:outline-none focus:border-pink-500"
                placeholder="e.g. Furniture Rule"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>

          {/* Conditions Grid matching Wireframe */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
             {/* Left Col */}
             <div className="space-y-6">
                <div>
                    <label className="text-pink-400 font-bold text-sm block mb-1">Partner Tag</label>
                    <input disabled className="w-full bg-transparent border-b border-slate-600 text-slate-500 py-1 cursor-not-allowed" placeholder="Many to One (from list)" />
                </div>
                <div>
                    <label className="text-pink-400 font-bold text-sm block mb-1">Product Category</label>
                    <input className="w-full bg-transparent border-b border-slate-500 text-white py-1 focus:outline-none focus:border-pink-500"
                        placeholder="e.g. Furniture"
                        value={formData.product_category} onChange={e => setFormData({...formData, product_category: e.target.value})} />
                </div>
             </div>

             {/* Right Col */}
             <div className="space-y-6">
                <div>
                    <label className="text-pink-400 font-bold text-sm block mb-1">Partner</label>
                    <input disabled className="w-full bg-transparent border-b border-slate-600 text-slate-500 py-1 cursor-not-allowed" placeholder="Many to One (from list)" />
                </div>
                <div>
                    <label className="text-pink-400 font-bold text-sm block mb-1">Product</label>
                    <input disabled className="w-full bg-transparent border-b border-slate-600 text-slate-500 py-1 cursor-not-allowed" placeholder="Many to One (from list)" />
                </div>
             </div>
          </div>

          {/* Auto Apply Section */}
          <div className="border-t border-slate-700 pt-8 mt-8">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6 block">Auto Apply Analytical Model</label>
            
            <div className="flex items-center gap-8">
                <label className="text-pink-400 font-bold whitespace-nowrap">Analytics to Apply?</label>
                <div className="flex-1">
                    <select 
                        className="w-full bg-transparent border-b border-pink-500 text-white py-2 focus:outline-none cursor-pointer"
                        value={formData.target_account}
                        onChange={e => setFormData({...formData, target_account: e.target.value})}
                        required
                    >
                        <option value="" className="bg-[#1e293b] text-slate-400">Select Analytic Account...</option>
                        {accounts.map((acc: any) => (
                            <option key={acc.id} value={acc.id} className="bg-[#1e293b]">{acc.name} ({acc.code})</option>
                        ))}
                    </select>
                </div>
                <div className="w-1/3">
                    <label className="text-slate-500 text-xs block mb-1">Priority</label>
                    <input type="number" className="w-20 bg-transparent border-b border-slate-500 text-white py-1 text-center"
                        value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})} />
                </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-lg border border-dashed border-slate-700 text-sm text-slate-400 italic leading-relaxed">
            "The model is applied if any one field matches the transaction line... Models with fewer matched fields are more generic, while more matches make them stricter."
          </div>

          <div className="flex justify-end pt-4">
             <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-10 rounded shadow-lg shadow-pink-500/20 transition-all">
                Confirm & Save
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}