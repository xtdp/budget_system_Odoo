"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Archive, Search, ArrowLeft, MoreHorizontal } from 'lucide-react';

export default function ContactListPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data on Load
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/finance/contacts/');
      setContacts(res.data);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Top Navigation */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold">Contact Master</h1>
        </div>
        
        {/* Action Buttons (Matches Mockup) */}
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/contacts/create')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-all"
          >
            <Plus size={18} className="mr-2" /> New
          </button>
          <button className="bg-[#1e293b] border border-slate-600 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg flex items-center font-medium transition-all">
            <Archive size={18} className="mr-2" /> Archived
          </button>
        </div>
      </div>

      {/* Main List Card */}
      <div className="max-w-6xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl shadow-xl overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="w-full bg-[#0f172a] border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f172a]/50 text-slate-400 border-b border-slate-700">
                <th className="p-4 w-12"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /></th>
                <th className="p-4">Contact Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading contacts...</td></tr>
              ) : contacts.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No contacts found. Click 'New' to create one.</td></tr>
              ) : (
                contacts.map((contact: any) => (
                  <tr key={contact.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors group cursor-pointer">
                    <td className="p-4"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /></td>
                    <td className="p-4 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                        {contact.name.substring(0,2).toUpperCase()}
                      </div>
                      {contact.name}
                    </td>
                    <td className="p-4 text-slate-300">{contact.email}</td>
                    <td className="p-4 text-slate-300">{contact.phone || '-'}</td>
                    <td className="p-4 text-right">
                      <MoreHorizontal className="inline text-slate-500 hover:text-white" size={20} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}