"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save, User } from 'lucide-react';

export default function CreateContact() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/finance/contacts/', formData);
    router.push('/contacts');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-2xl mx-auto mb-8 flex items-center gap-4">
         <button onClick={() => router.back()} className="text-slate-400"><ArrowLeft /></button>
         <h1 className="text-3xl font-bold">Create Contact</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-[#1e293b] border border-slate-700 p-8 rounded-xl space-y-4">
        <div>
          <label className="block text-slate-400 mb-1">Name</label>
          <input className="w-full bg-[#0f172a] border border-slate-600 rounded p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Email</label>
          <input className="w-full bg-[#0f172a] border border-slate-600 rounded p-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold mt-4">Save Contact</button>
      </form>
    </div>
  );
}