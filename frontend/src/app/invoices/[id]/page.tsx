"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Download, CreditCard, Check, AlertTriangle, X } from 'lucide-react';

export default function InvoiceDetail() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 🟢 Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);

  useEffect(() => { loadInvoice(); }, []);

  const loadInvoice = async () => {
    try {
        const res = await api.get(`/finance/invoices/${params.id}/`);
        setInvoice(res.data);
        // Default the payment input to the remaining amount
        setPayAmount(res.data.amount_residual !== undefined ? res.data.amount_residual : res.data.total_amount); 
    } catch (err) { alert("Error loading invoice"); } 
    finally { setLoading(false); }
  };

  const handleConfirm = async () => {
      try {
          await api.post(`/finance/invoices/${params.id}/confirm/`);
          loadInvoice();
      } catch (err: any) {
          alert("Failed to confirm: " + (err.response?.data?.details || "Unknown Error"));
      }
  };

  // 🟢 NEW: Submit Payment with Amount
  const submitPayment = async () => {
      try {
          await api.post(`/finance/invoices/${params.id}/pay/`, { amount: payAmount });
          setShowPayModal(false);
          alert("Payment Recorded!");
          loadInvoice(); 
      } catch (err: any) {
          alert("Payment failed: " + (err.response?.data?.error || "Error"));
      }
  };

  const handleDownload = () => {
      window.open(`http://localhost:8000/finance/invoices/${params.id}/download/`, '_blank');
  };

  if (loading || !invoice) return <div className="p-8 text-white">Loading...</div>;

  const isPaid = invoice.payment_state === 'paid';
  const isPartial = invoice.payment_state === 'partial';
  const isDraft = invoice.state === 'draft';
  const isCustomer = invoice.invoice_type === 'out_invoice';
  const colorClass = isCustomer ? 'green' : 'blue'; 

  // Fallback for older data that might not have amount_residual calculated yet
  const residual = invoice.amount_residual !== undefined ? invoice.amount_residual : invoice.total_amount;
  const total = invoice.amount_total !== undefined ? invoice.amount_total : invoice.total_amount;

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Nav */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center border border-slate-600 px-4 py-2 rounded-lg">
          <ArrowLeft className="mr-2" size={18} /> Back
        </button>
        <div className="flex gap-3">
            <button onClick={handleDownload} className="bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold border border-slate-600 flex items-center">
                <Download size={18} className="mr-2" /> PDF
            </button>
            
            {isDraft ? (
                <button onClick={handleConfirm} className={`bg-${colorClass}-600 hover:bg-${colorClass}-700 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-lg animate-pulse`}>
                    <Check size={18} className="mr-2" /> Confirm
                </button>
            ) : !isPaid ? (
                <button onClick={() => setShowPayModal(true)} className={`bg-${colorClass}-600 hover:bg-${colorClass}-700 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-lg`}>
                    <CreditCard size={18} className="mr-2" /> Register Payment
                </button>
            ) : null}
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-4xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Stamps */}
        {isPaid && <div className="absolute top-10 right-10 border-4 border-green-500/30 text-green-500 text-6xl font-black opacity-30 transform rotate-[-15deg] p-4 rounded-xl uppercase tracking-widest pointer-events-none">PAID</div>}
        {isPartial && <div className="absolute top-10 right-10 border-4 border-yellow-500/30 text-yellow-500 text-4xl font-black opacity-30 transform rotate-[-15deg] p-4 rounded-xl uppercase pointer-events-none">PARTIAL</div>}

        {/* Header */}
        <div className="border-b border-slate-700 pb-6 mb-6 flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    {isCustomer ? 'Invoice' : 'Vendor Bill'} <span className="text-slate-500">#{invoice.id}</span>
                </h1>
                <p className="text-slate-400">{isCustomer ? 'Customer' : 'Vendor'}: <span className="text-white font-bold">{invoice.partner_name || invoice.partner?.name}</span></p>
            </div>
            <div className="text-right">
                <p className="text-slate-400 text-sm">Amount Due</p>
                <p className="text-3xl font-bold text-white">₹{residual}</p>
                {isPartial && <p className="text-xs text-slate-500">Total: ₹{total}</p>}
            </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-2 mb-8 bg-[#0f172a] p-4 rounded-lg border border-slate-700">
            <div className={`flex-1 h-2 rounded-full ${!isDraft ? `bg-${colorClass}-500` : 'bg-slate-600'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${isPartial || isPaid ? 'bg-orange-500' : 'bg-slate-700'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${isPaid ? 'bg-green-500' : 'bg-slate-700'}`}></div>
            <span className="text-xs uppercase font-bold text-slate-400 ml-2">
                {invoice.payment_state.replace('_', ' ')}
            </span>
        </div>

        {/* ⚠️ Warning if Draft */}
        {isDraft && (
            <div className="mb-6 bg-amber-500/10 border border-amber-500/50 p-4 rounded-lg flex items-center text-amber-200 text-sm">
                <AlertTriangle size={18} className="mr-2" />
                This document is in Draft. Confirm it to post to the ledger and enable payment.
            </div>
        )}

        {/* Lines Table */}
        <table className="w-full text-left mb-8">
            <thead>
                <tr className="text-slate-500 text-sm border-b border-slate-700">
                    <th className="pb-4">Product</th>
                    <th className="pb-4 text-center">Qty</th>
                    <th className="pb-4 text-right">Unit Price</th>
                    <th className="pb-4 text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
                {invoice.lines.map((line: any) => (
                    <tr key={line.id}>
                        <td className="py-4 font-medium text-white">
                            {line.product_name || line.product?.name}
                            {/* Show auto-assigned account */}
                            {line.analytical_account && (
                                <span className="block text-[10px] text-slate-500 mt-1">
                                    Analytics: {line.analytical_account_name || line.analytical_account}
                                </span>
                            )}
                        </td>
                        <td className="py-4 text-center text-slate-400">{line.quantity}</td>
                        <td className="py-4 text-right text-slate-400">₹{line.price_unit}</td>
                        <td className="py-4 text-right font-bold text-white">₹{line.quantity * line.price_unit}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end border-t border-slate-700 pt-6 mt-8">
            <div className="w-64 space-y-2">
                <div className="flex justify-between items-center text-slate-400"><span>Subtotal</span><span>₹{total}</span></div>
                {/* Show how much has been paid if applicable */}
                {!isDraft && (total - residual > 0) && (
                     <div className="flex justify-between items-center text-green-400"><span>Paid</span><span>- ₹{total - residual}</span></div>
                )}
                <div className="flex justify-between items-center text-xl font-bold border-t border-slate-600 pt-4">
                    <span className={`text-${colorClass}-400`}>Amount Due</span>
                    <span>₹{residual}</span>
                </div>
            </div>
        </div>

      </div>

      {/* 🟢 Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#1e293b] p-8 rounded-xl border border-slate-600 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Register Payment</h3>
                    <button onClick={() => setShowPayModal(false)}><X className="text-slate-400 hover:text-white" /></button>
                </div>
                
                <div className="mb-6">
                    <label className="block text-slate-400 text-sm font-bold mb-2">Amount (₹)</label>
                    <input 
                        type="number" 
                        value={payAmount}
                        onChange={(e) => setPayAmount(parseFloat(e.target.value))}
                        className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-2xl font-bold text-white focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-2">Max Payable: ₹{residual}</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setShowPayModal(false)} className="flex-1 py-3 rounded-lg border border-slate-600 hover:bg-slate-800 font-bold">Cancel</button>
                    <button onClick={submitPayment} className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-700 font-bold text-white shadow-lg">Pay Now</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}