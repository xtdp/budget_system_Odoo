"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, PieChart, Trash2 } from 'lucide-react';

export default function AnalyticMaster() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // FIX: Added 'code' to state
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => { loadAccounts(); }, []);
  const loadAccounts = () => api.get('/finance/accounts/').then(res => setAccounts(res.data));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // FIX: Sending both name AND code now
      await api.post('/finance/accounts/', formData);
      setShowModal(false);
      loadAccounts();
      setFormData({ name: '', code: '' }); // Reset form
    } catch (err: any) {
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PieChart className="text-pink-400" /> Analytical Accounts
          </h1>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg flex items-center font-bold">
          <Plus size={18} className="mr-2" /> New Account
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid gap-4">
        {accounts.map((a: any) => (
          <div key={a.id} className="bg-[#1e293b] border border-slate-700 p-4 rounded-xl flex justify-between items-center hover:border-pink-500 transition-all">
            <div>
              <span className="font-bold text-lg block">{a.name}</span>
              <span className="text-pink-400 text-xs font-bold uppercase tracking-wider">{a.code}</span>
            </div>
            <span className="text-slate-500 text-sm">ID: {a.id}</span>
          </div>
        ))}
        {accounts.length === 0 && <p className="text-slate-500 text-center">No accounts found.</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-[#1e293b] p-8 rounded-xl border border-slate-700 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Create Analytical Account</h2>
            
            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-1">Account Name</label>
              <input 
                className="input-field w-full bg-[#0f172a] border border-slate-600 rounded p-2" 
                placeholder="e.g. Furniture Expo 2026" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>

            {/* FIX: Code Input Added */}
            <div className="mb-6">
              <label className="block text-slate-400 text-sm mb-1">Short Code</label>
              <input 
                className="input-field w-full bg-[#0f172a] border border-slate-600 rounded p-2 uppercase" 
                placeholder="e.g. EXPO26" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                required 
              />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">Cancel</button>
              <button type="submit" className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}