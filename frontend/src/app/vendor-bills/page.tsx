"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, FileText, CreditCard } from 'lucide-react';

export default function VendorBillList() {
  const router = useRouter();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/finance/invoices/')
      .then(res => {
        // Filter for Vendor Bills ('in_invoice')
        setBills(res.data.filter((inv: any) => inv.invoice_type === 'in_invoice'));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="text-blue-400" /> Vendor Bills
          </h1>
        </div>
        <button 
          onClick={() => router.push('/invoices/create?type=in_invoice')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-bold"
        >
          <Plus size={18} className="mr-2" /> Create Bill
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-4">
        {loading ? <p>Loading...</p> : bills.map((inv: any) => (
          <div key={inv.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-xl flex justify-between items-center hover:border-blue-500 transition-all cursor-pointer"
               onClick={() => router.push(`/invoices/${inv.id}`)} // 👈 Opens Detail View
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-xl text-white">Bill #{inv.id}</h3>
                <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${inv.state === 'posted' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-600 text-slate-300'}`}>
                  {inv.state}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Vendor: <span className="text-white">{inv.partner_name}</span> • Date: {inv.date}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white mb-1">₹{inv.total_amount}</p>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  inv.payment_state === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                  {inv.payment_state.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
        {bills.length === 0 && !loading && <div className="text-center text-slate-500 mt-12">No bills found.</div>}
      </div>
    </div>
  );
}