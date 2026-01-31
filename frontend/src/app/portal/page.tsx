"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LogOut, FileText, CheckCircle, CreditCard, ShoppingBag, Download } from 'lucide-react';

export default function CustomerPortal() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  
  // 🟢 State for Tabs & Data
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' or 'orders'
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');

    if (!role || !name) {
      router.push('/login');
    } else {
      setUser(name);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Invoices
      const resInv = await api.get('/finance/invoices/');
      // Filter so customer only sees OUT invoices (Sales)
      const clientInvoices = resInv.data.filter((inv: any) => inv.invoice_type === 'out_invoice');
      setInvoices(clientInvoices);
      
      // 2. Fetch Sales Orders
      const resOrd = await api.get('/finance/sales-orders/');
      setOrders(resOrd.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 💳 RAZORPAY HELPER: Load the SDK script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 💳 REAL PAYMENT LOGIC
  const handlePay = async (invoiceId: number) => {
    // 1. Load Script
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Check your internet connection.");
      return;
    }

    try {
      // 2. Create Order on Server
      const result = await api.post(`/finance/invoices/${invoiceId}/create_razorpay_order/`);
      const { amount, order_id, key_id } = result.data;

      // 3. Open Razorpay Popup
      const options = {
        key: key_id,
        amount: amount.toString(),
        currency: "INR",
        name: "Shiv Furniture",
        description: `Payment for Invoice #${invoiceId}`,
        order_id: order_id,
        handler: async function (response: any) {
          // 4. Verify Payment on Server
          try {
             await api.post(`/finance/invoices/${invoiceId}/verify_razorpay_payment/`, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
             });
             alert("✅ Payment Successful!");
             fetchData(); // Refresh list to show 'PAID'
          } catch (err) {
             console.error(err);
             alert("❌ Payment Verification Failed");
          }
        },
        prefill: {
          name: user || "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#2563eb", // Blue color to match your UI
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert("Could not initiate payment. Make sure Backend is running.");
    }
  };

  const handleDownload = (id: number) => {
      window.open(`http://localhost:8000/finance/invoices/${id}/download/`, '_blank');
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Portal Header */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-end border-b border-slate-700 pb-6">
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

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'invoices' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            <FileText size={18}/> Invoices
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            <ShoppingBag size={18}/> My Orders
          </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto">
        {loading && <div className="text-center text-slate-500 animate-pulse mt-12">Loading secure data...</div>}

        {/* 🟢 TAB 1: INVOICES LIST */}
        {!loading && activeTab === 'invoices' && (
            <div className="space-y-4">
            {invoices.map((inv: any) => (
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

                <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                        <p className="text-2xl font-black text-white">₹{inv.total_amount}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Amount Due</p>
                    </div>
                    
                    {/* Download PDF Button */}
                    <button 
                        onClick={() => handleDownload(inv.id)}
                        className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
                        title="Download Invoice PDF"
                    >
                        <Download size={20} />
                    </button>

                    {inv.payment_state !== 'paid' ? (
                        <button 
                        onClick={() => handlePay(inv.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2"
                        >
                        <CreditCard size={18} /> Pay
                        </button>
                    ) : (
                        <div className="flex items-center text-green-400 font-black bg-green-500/10 px-5 py-3 rounded-xl border border-green-500/20">
                        <CheckCircle size={20} className="mr-2" /> PAID
                        </div>
                    )}
                </div>

                </div>
            ))}
            {invoices.length === 0 && (
                <div className="text-center p-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500">
                    <CheckCircle className="mx-auto mb-4 text-slate-700" size={48} />
                    <p className="text-lg font-medium">All caught up! No pending invoices.</p>
                </div>
            )}
            </div>
        )}

        {/* 🟢 TAB 2: SALES ORDERS LIST */}
        {!loading && activeTab === 'orders' && (
            <div className="space-y-4">
                {orders.map((ord: any) => (
                <div key={ord.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl flex items-center justify-between hover:border-purple-500/50 transition-all shadow-lg">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-white">{ord.name}</h3>
                            <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest">
                                {ord.state}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm">Ordered on: {ord.date_order}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-white">₹{ord.amount_total}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Total Value</p>
                    </div>
                </div>
                ))}
                {orders.length === 0 && (
                    <div className="text-center p-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500">
                        <ShoppingBag className="mx-auto mb-4 text-slate-700" size={48} />
                        <p className="text-lg font-medium">No orders found.</p>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
}