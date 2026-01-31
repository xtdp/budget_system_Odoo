"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, DollarSign, FileText } from 'lucide-react';

export default function SalesOrderList() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/finance/sales-orders/')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // 🪄 Create Invoice from Sales Order logic
  const createInvoice = (so: any) => {
    const query = new URLSearchParams({
        partner: so.partner,
        origin: so.name, // Link SO reference
        amount: so.amount_total,
        type: 'out_invoice' // Important: Mark as Customer Invoice
    }).toString();
    
    router.push(`/invoices/create?${query}`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="text-green-400" /> Sales Orders
          </h1>
        </div>
        <button 
          onClick={() => router.push('/sales-orders/create')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center font-bold shadow-lg shadow-green-500/20"
        >
          <Plus size={18} className="mr-2" /> New Sale
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-4">
        {loading ? <p className="text-center text-slate-500 p-8">Loading Sales...</p> : orders.map((so: any) => (
          <div key={so.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-xl flex justify-between items-center hover:border-green-500 transition-all shadow-lg group">
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-xl text-white group-hover:text-green-400 transition-colors">{so.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      so.state === 'confirmed' || so.state === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {so.state}
                  </span>
              </div>
              <div className="text-slate-400 text-sm">
                  Customer: <span className="text-white font-medium">{so.partner_name}</span> • Date: {so.date_order}
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-green-400 mb-2">₹{so.amount_total}</p>
              
              {/* CREATE INVOICE BUTTON */}
              {(so.state === 'confirmed' || so.state === 'done') && (
                  <button 
                    onClick={() => createInvoice(so)}
                    className="bg-[#0f172a] hover:bg-slate-800 border border-slate-600 text-green-400 hover:text-green-300 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-end w-full transition-all"
                  >
                    <FileText size={14} className="mr-1" /> Create Invoice
                  </button>
              )}
            </div>

          </div>
        ))}
        {orders.length === 0 && !loading && (
            <div className="text-center text-slate-500 p-12 border border-dashed border-slate-700 rounded-xl">No active sales found.</div>
        )}
      </div>
    </div>
  );
}