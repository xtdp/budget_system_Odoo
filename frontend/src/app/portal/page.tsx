"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LogOut, FileText, CheckCircle, CreditCard } from 'lucide-react';

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
      const res = await api.get('/finance/invoices/');
      // Filtering out Vendor Bills so the customer only sees their Invoices
      const clientInvoices = res.data.filter((inv: any) => inv.invoice_type === 'out_invoice');
      setInvoices(clientInvoices); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 💳 NEW: The Payment Trigger
  const handlePay = async (invoiceId: number) => {
    try {
      const confirmPay = confirm("Proceed to pay this invoice?");
      if (!confirmPay) return;

      await api.post(`/finance/invoices/${invoiceId}/pay/`);
      alert("Payment Successful! Receipt generated.");
      fetchMyInvoices(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
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
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Customer Portal</h1>
          <p className="text-slate-400 font-medium">Welcome back, <span className="text-blue-400">{user}</span></p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center text-red-400 hover:text-red-300 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 transition-all font-bold text-sm"
        >
          <LogOut size={16} className="mr-2" /> Logout
        </button>
      </div>

      {/* Invoice List */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FileText className="text-blue-400" /> Your Outstanding Invoices
        </h2>

        <div className="space-y-4">
          {loading ? (
            <div className="text-slate-500 animate-pulse">Fetching your secure data...</div>
          ) : invoices.map((inv: any) => (
            <div key={inv.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl flex items-center justify-between hover:border-blue-500/50 transition-all shadow-lg">
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-white">INV-{inv.id.toString().padStart(3, '0')}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest ${inv.payment_state === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {inv.payment_state.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">Issued on: {inv.date}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                   <p className="text-2xl font-black text-white">₹{inv.total_amount || '0.00'}</p>
                   <p className="text-[10px] text-slate-500 uppercase font-bold">Amount Due</p>
                </div>
                
                {inv.payment_state !== 'paid' ? (
                   <button 
                     onClick={() => handlePay(inv.id)}
                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2"
                   >
                     <CreditCard size={18} /> Pay Now
                   </button>
                ) : (
                  <div className="flex items-center text-green-400 font-black bg-green-500/10 px-5 py-3 rounded-xl border border-green-500/20">
                    <CheckCircle size={20} className="mr-2" /> PAID
                  </div>
                )}
              </div>

            </div>
          ))}

          {invoices.length === 0 && !loading && (
            <div className="text-center p-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500">
              <CheckCircle className="mx-auto mb-4 text-slate-700" size={48} />
              <p className="text-lg font-medium">All caught up! No pending invoices.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}