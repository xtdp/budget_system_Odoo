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

  // 🪄 THE MAGIC: Convert PO to Bill
  const createBill = (po: any) => {
    // We send the PO data to the Invoice Create page via Query Params
    const query = new URLSearchParams({
        partner: po.partner,
        origin: po.name, // Link back to PO
        amount: po.amount_total
    }).toString();
    
    router.push(`/invoices/create?${query}`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="text-blue-400" /> Purchase Orders
          </h1>
        </div>
        <button 
          onClick={() => router.push('/purchase-orders/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-bold"
        >
          <Plus size={18} className="mr-2" /> New Order
        </button>
      </div>

      {/* List */}
      <div className="max-w-6xl mx-auto space-y-4">
        {loading ? <p>Loading Orders...</p> : orders.map((po: any) => (
          <div key={po.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-xl flex justify-between items-center hover:border-blue-500 transition-all">
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-xl text-white">{po.name}</h3>
                <span className="px-2 py-0.5 rounded text-xs uppercase font-bold bg-green-500/20 text-green-400">
                  {po.state}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Vendor: {po.partner_name} • Date: {po.date_order}</p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-white">₹{po.amount_total}</p>
              
              {/* THE "CREATE BILL" BUTTON from your diagram */}
              <button 
                onClick={() => createBill(po)}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center justify-end w-full font-bold"
              >
                <FileText size={14} className="mr-1" /> Create Bill
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}