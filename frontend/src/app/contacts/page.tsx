"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Archive, Search, ArrowLeft, MoreHorizontal, MapPin } from 'lucide-react';

export default function ContactListPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/contacts/create')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-all shadow-lg shadow-blue-500/20"
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
        <div className="p-4 border-b border-slate-700 bg-[#1e293b]">
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
              <tr className="bg-[#0f172a]/50 text-slate-400 border-b border-slate-700 text-xs uppercase font-bold tracking-wider">
                <th className="p-4 w-12"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /></th>
                <th className="p-4">Contact Name</th>
                <th className="p-4">Email / Phone</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading contacts...</td></tr>
              ) : contacts.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No contacts found. Click 'New' to create one.</td></tr>
              ) : (
                contacts.map((contact: any) => (
                  <tr key={contact.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors group cursor-pointer">
                    <td className="p-4"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /></td>
                    
                    {/* Name & Image Column */}
                    <td className="p-4 font-medium text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600 shrink-0">
                        {contact.image ? (
                            <img 
                                src={contact.image.startsWith('http') ? contact.image : `http://localhost:8000${contact.image}`} 
                                alt={contact.name} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <span className="text-xs font-bold text-slate-300">
                                {contact.name.substring(0,2).toUpperCase()}
                            </span>
                        )}
                      </div>
                      <div>
                          <div className="font-bold text-sm">{contact.name}</div>
                          {/* Tags Mockup - Matching image style */}
                          <div className="flex gap-1 mt-1">
                             <span className="bg-slate-700 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-600">B2B</span>
                          </div>
                      </div>
                    </td>

                    <td className="p-4">
                        <div className="text-sm text-slate-200">{contact.email}</div>
                        <div className="text-xs text-slate-500">{contact.phone}</div>
                    </td>

                    <td className="p-4 text-slate-300">
                        {contact.city ? (
                            <span className="flex items-center gap-1.5 text-sm bg-slate-800/50 w-fit px-2 py-1 rounded text-slate-400">
                                <MapPin size={12}/> {contact.city}
                            </span>
                        ) : '-'}
                    </td>

                    <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                            contact.state === 'confirmed' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-slate-800 text-slate-400 border-slate-600'
                        }`}>
                            {contact.state || 'DRAFT'}
                        </span>
                    </td>

                    <td className="p-4 text-right">
                      <button className="text-slate-500 hover:text-white p-2 hover:bg-slate-700 rounded-full transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
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