"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, DollarSign, FileText } from 'lucide-react';

export default function CustomerInvoiceList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all invoices
    api.get('/finance/invoices/')
      .then(res => {
        // Filter Client-Side for "out_invoice" (Customer Invoice)
        const customerInvoices = res.data.filter((inv: any) => inv.invoice_type === 'out_invoice');
        setInvoices(customerInvoices);
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
            <DollarSign className="text-green-400" /> Customer Invoices
          </h1>
        </div>
        <button 
          onClick={() => router.push('/invoices/create?type=out_invoice')} 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center font-bold"
        >
          <Plus size={18} className="mr-2" /> Create Invoice
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-4">
        {loading ? <p>Loading...</p> : invoices.map((inv: any) => (
          <div key={inv.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-xl flex justify-between items-center hover:border-green-500 transition-all">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-xl text-white">Invoice #{inv.id}</h3>
                <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${inv.state === 'posted' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300'}`}>
                  {inv.state}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Customer: {inv.partner_name} • Date: {inv.date}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">₹{inv.total_amount || '0.00'}</p>
              <p className="text-xs text-slate-500 uppercase">{inv.payment_state.replace('_', ' ')}</p>
            </div>
          </div>
        ))}
        {invoices.length === 0 && !loading && <div className="text-center text-slate-500 mt-12">No invoices found.</div>}
      </div>
    </div>
  );
}