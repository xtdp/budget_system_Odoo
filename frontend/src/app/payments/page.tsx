"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function PaymentList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'send'; // 'send' or 'receive'
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get('/finance/payments/').then(res => {
      // Filter based on type (simulated backend filter)
      const filtered = res.data.filter((p: any) => p.payment_type === type);
      setPayments(filtered);
    });
  }, [type]);

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full"><ArrowLeft size={24} className="text-slate-400" /></button>
          <h1 className="text-3xl font-bold capitalize">{type === 'send' ? 'Vendor Payments' : 'Customer Receipts'}</h1>
        </div>
        <button onClick={() => router.push(`/payments/create?type=${type}`)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold flex items-center">
          <Plus size={18} className="mr-2" /> New {type === 'send' ? 'Payment' : 'Receipt'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-4">
        {payments.map((p: any) => (
          <div key={p.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-xl flex justify-between items-center">
             <div>
                <h3 className="font-bold text-xl">{p.name}</h3>
                <p className="text-slate-400 text-sm">{p.partner_name} • {p.date}</p>
             </div>
             <div className={`text-2xl font-bold flex items-center gap-2 ${type === 'send' ? 'text-red-400' : 'text-green-400'}`}>
                {type === 'send' ? <ArrowUpRight /> : <ArrowDownLeft />}
                ₹{p.amount}
             </div>
          </div>
        ))}
        {payments.length === 0 && <div className="text-center text-slate-500 mt-12">No records found.</div>}
      </div>
    </div>
  );
}