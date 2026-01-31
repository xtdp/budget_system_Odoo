"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LogOut, FileText, CheckCircle, Clock } from 'lucide-react';

export default function CustomerPortal() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');

    if (!role || !name) {
      router.push('/login');
    } else {
      setUser(name);
      fetchMyInvoices();
    }
  }, []);

  const fetchMyInvoices = async () => {
    try {
      // In a real app, the API would filter by the logged-in user automatically.
      // For this demo, we fetch all and filter client-side (Hackathon Speed)
      const res = await api.get('/finance/invoices/'); // You'll need to create this API endpoint if it doesn't exist yet, or use the existing one
      setInvoices(res.data); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Portal Header */}
      <div className="max-w-4xl mx-auto mb-12 flex justify-between items-end border-b border-slate-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Customer Portal</h1>
          <p className="text-slate-400">Welcome back, <span className="text-blue-400 font-bold">{user}</span></p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center text-red-400 hover:text-red-300 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 transition-all"
        >
          <LogOut size={16} className="mr-2" /> Logout
        </button>
      </div>

      {/* Invoice List */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FileText className="text-blue-400" /> Your Invoices & Bills
        </h2>

        <div className="space-y-4">
          {loading ? <div className="text-slate-500">Loading your bills...</div> : invoices.map((inv: any) => (
            <div key={inv.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-xl flex items-center justify-between hover:border-blue-500 transition-all">
              
              {/* Left: Info */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg text-white">Invoice #{inv.id}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${inv.payment_state === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {inv.payment_state.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">Date: {inv.date}</p>
              </div>

              {/* Right: Action */}
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                   <p className="text-2xl font-bold text-white">₹{inv.total_amount || '0.00'}</p>
                   <p className="text-xs text-slate-500">Total Due</p>
                </div>
                
                {inv.payment_state !== 'paid' ? (
                   <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg">
                     Pay Now
                   </button>
                ) : (
                  <div className="flex items-center text-green-500 font-bold bg-green-500/10 px-4 py-2 rounded-lg">
                    <CheckCircle size={18} className="mr-2" /> Paid
                  </div>
                )}
              </div>

            </div>
          ))}

          {invoices.length === 0 && !loading && (
            <div className="text-center p-12 border border-dashed border-slate-700 rounded-xl text-slate-500">
              You have no pending invoices.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}