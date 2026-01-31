"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, ShoppingCart, FileText } from 'lucide-react';

export default function PurchaseOrderList() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/finance/purchase-orders/');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🪄 THE REAL MAGIC: Call Backend to Convert PO to Bill
  const createBill = async (po: any) => {
    if (!confirm(`Create Vendor Bill from Order ${po.name}?`)) return;

    try {
        // 1. Trigger the Backend Logic (Copies lines, prices, applies accounts)
        const res = await api.post(`/finance/purchase-orders/${po.id}/create_bill/`);
        
        // 2. Success! Redirect to the NEW Bill
        alert("Bill Created Successfully!");
        
        // The backend returns { invoice_id: 123 }
        if (res.data.invoice_id) {
            router.push(`/invoices/${res.data.invoice_id}`);
        } else {
            // Fallback if ID missing (should not happen with current backend)
            router.push('/vendor-bills');
        }
        
    } catch (err: any) {
        console.error(err);
        alert("Failed to create bill: " + (err.response?.data?.error || "Unknown Error"));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="text-blue-400" /> Purchase Orders
          </h1>
        </div>
        <button 
          onClick={() => router.push('/purchase-orders/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-bold shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus size={18} className="mr-2" /> New Order
        </button>
      </div>

      {/* List */}
      <div className="max-w-6xl mx-auto space-y-4">
        {loading ? (
            <div className="p-8 text-center text-slate-500">Loading Orders...</div>
        ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 italic border border-dashed border-slate-700 rounded-xl">No purchase orders found. Create one to get started.</div>
        ) : (
            orders.map((po: any) => (
            <div key={po.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-xl flex justify-between items-center hover:border-blue-500 transition-all shadow-lg group">
                
                <div>
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors">{po.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        po.state === 'confirmed' || po.state === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                    {po.state}
                    </span>
                </div>
                <div className="text-slate-400 text-sm flex gap-4">
                    <span>Vendor: <span className="text-white">{po.partner_name}</span></span>
                    <span>•</span>
                    <span>Date: {po.date_order}</span>
                </div>
                </div>

                <div className="text-right">
                <p className="text-2xl font-bold text-white mb-2">₹{po.amount_total}</p>
                
                {/* CREATE BILL BUTTON */}
                {(po.state === 'confirmed') && (
                    <button 
                        onClick={() => createBill(po)}
                        className="bg-[#0f172a] hover:bg-slate-800 border border-slate-600 text-blue-400 hover:text-blue-300 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-end w-full transition-all shadow-sm hover:shadow-blue-900/20"
                    >
                        <FileText size={14} className="mr-1" /> Create Bill
                    </button>
                )}
                
                {po.state === 'done' && (
                    <span className="text-xs text-slate-500 font-medium">Bill Created ✅</span>
                )}
                </div>

            </div>
            ))
        )}
      </div>
    </div>
  );
}