"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreatePayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'send';
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ payment_type: type, partner: '', amount: 0, date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    api.get('/finance/contacts/').then(res => setContacts(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/finance/payments/', formData);
    router.push(`/payments?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-xl mx-auto mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-slate-400"><ArrowLeft /></button>
        <h1 className="text-3xl font-bold capitalize">Register {type === 'send' ? 'Payment' : 'Receipt'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-[#1e293b] border border-slate-700 p-8 rounded-xl space-y-6">
         <div>
            <label className="block text-slate-400 mb-1">Partner</label>
            <select className="input-field w-full bg-[#0f172a] border border-slate-600 rounded p-3" 
               value={formData.partner} onChange={e => setFormData({...formData, partner: e.target.value})} required>
               <option value="">Select Partner</option>
               {contacts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
         </div>
         <div>
            <label className="block text-slate-400 mb-1">Amount</label>
            <input type="number" className="input-field w-full bg-[#0f172a] border border-slate-600 rounded p-3 text-xl font-bold" 
               value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required />
         </div>
         <div>
            <label className="block text-slate-400 mb-1">Date</label>
            <input type="date" className="input-field w-full bg-[#0f172a] border border-slate-600 rounded p-3" 
               value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
         </div>
         <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold text-lg">Confirm</button>
      </form>
    </div>
  );
}