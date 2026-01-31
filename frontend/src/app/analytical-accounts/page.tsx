"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, PieChart } from 'lucide-react';

export default function AnalyticMaster() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // FIX: Added 'code' to state to match backend model
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => { loadAccounts(); }, []);
  const loadAccounts = () => api.get('/finance/accounts/').then(res => setAccounts(res.data));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/accounts/', formData);
      setShowModal(false);
      loadAccounts();
      setFormData({ name: '', code: '' }); 
    } catch (err: any) {
      alert("Error saving account.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Header matching wireframe style */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PieChart className="text-pink-400" /> Analytics Master
          </h1>
        </div>
        <div className="flex gap-2">
             <button onClick={() => setShowModal(true)} className="bg-[#1e293b] border border-pink-500/50 text-pink-400 hover:bg-pink-900/20 px-4 py-2 rounded text-sm font-bold">New</button>
             <button className="bg-[#1e293b] border border-slate-600 text-slate-400 px-4 py-2 rounded text-sm font-bold">Confirm</button>
             <button className="bg-[#1e293b] border border-slate-600 text-slate-400 px-4 py-2 rounded text-sm font-bold">Archived</button>
        </div>
      </div>

      {/* List View matching image_e645d2.png */}
      <div className="max-w-4xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-slate-700 text-slate-400 text-sm font-bold uppercase tracking-wider">
            Analytic Name
        </div>
        
        {accounts.map((a: any) => (
          <div key={a.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-800/50 transition-all flex justify-between items-center group cursor-pointer">
            <span className="text-pink-400 font-medium text-lg">{a.name}</span>
            <span className="text-slate-600 text-xs font-mono group-hover:text-slate-400 transition-colors">[{a.code}]</span>
          </div>
        ))}
        
        {accounts.length === 0 && (
             <div className="p-8 text-center text-slate-500 italic">No analytic accounts found.</div>
        )}
        
        {/* Placeholder lines to match wireframe look */}
        {[1,2,3,4].map(i => (
            <div key={`empty-${i}`} className="p-4 border-b border-slate-700/30 h-[50px]"></div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-[#1e293b] p-8 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-pink-400">New Analytic Account</h2>
            
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-1">Analytic Name</label>
              <input className="w-full bg-[#0f172a] border-b border-pink-500 rounded-t p-2 text-white outline-none" 
                placeholder="e.g. Deepawali 2026" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>

            <div className="mb-8">
              <label className="block text-slate-400 text-sm mb-1">Short Code</label>
              <input className="w-full bg-[#0f172a] border-b border-pink-500 rounded-t p-2 uppercase text-white outline-none" 
                placeholder="e.g. FEST26" 
                value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white px-4">Cancel</button>
              <button type="submit" className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded font-bold shadow-lg shadow-pink-500/20">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}