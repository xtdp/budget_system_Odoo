"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, Trash2, PieChart, AlertTriangle, CheckCircle, Save } from 'lucide-react';

function CreateInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Master Data
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  // Budget Check State
  const [budgetStatus, setBudgetStatus] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    invoice_type: 'in_invoice', 
    partner: '',
    date: new Date().toISOString().split('T')[0],
    state: 'draft',
    lines: [
      { product: '', quantity: 1, price_unit: 0, analytical_account: '' }
    ]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cRes, pRes, aRes] = await Promise.all([
          api.get('/finance/contacts/'),
          api.get('/finance/products/'),
          api.get('/finance/accounts/')
        ]);
        setContacts(cRes.data);
        setProducts(pRes.data);
        setAccounts(aRes.data);
        
        // 🟢 FIX: Handle URL Params correctly (Partner AND Type)
        const partnerParam = searchParams.get('partner');
        const typeParam = searchParams.get('type');
        
        if (partnerParam) {
           setFormData(prev => ({
             ...prev,
             partner: partnerParam,
             // If type is provided (e.g. out_invoice), use it. Otherwise default to Vendor Bill.
             invoice_type: typeParam || 'in_invoice' 
           }));
        }
      } catch (err) {
        console.error("Error loading data", err);
      }
    };
    loadData();
  }, [searchParams]);

  // Smart Price Logic
  const updateLine = (index: number, field: string, value: any) => {
    const newLines: any = [...formData.lines];
    newLines[index][field] = value;

    if (field === 'product') {
      const product: any = products.find((p: any) => p.id == value);
      if (product) {
         if (formData.invoice_type === 'in_invoice') {
             newLines[index].price_unit = product.purchase_price; 
         } else {
             newLines[index].price_unit = product.sales_price;
         }
      }
    }
    setFormData({ ...formData, lines: newLines });
  };

  const addLine = () => {
    setFormData({ ...formData, lines: [...formData.lines, { product: '', quantity: 1, price_unit: 0, analytical_account: '' }] });
  };

  const removeLine = (index: number) => {
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  // 🟢 FIX: Better Budget Check Error Handling
  const handleCheckBudget = async () => {
    const line = formData.lines.find(l => l.analytical_account);
    if (!line || !line.analytical_account) {
        alert("Please select an Analytical Account on the lines first.");
        return;
    }
    try {
        const res = await api.post('/finance/budgets/check_availability/', {
            account_id: line.analytical_account,
            amount: line.quantity * line.price_unit,
            date: formData.date
        });
        setBudgetStatus(res.data);
    } catch (err: any) {
        console.error(err);
        // Show the ACTUAL error from backend
        alert("Budget Check Failed: " + (err.response?.data?.message || err.message || "Unknown Error"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/finance/invoices/', formData);
      await api.post(`/finance/invoices/${res.data.id}/confirm/`);
      alert("Transaction Posted!");
      router.push('/budgets'); // Or invoice list
    } catch (err: any) {
      console.error(err);
      alert("Error saving transaction: " + (err.response?.data?.error || "Unknown Error"));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Transaction</h1>
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center">
          <ArrowLeft className="mr-2" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl p-8 shadow-xl">
        
        {/* Status Bar */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-6 mb-8">
            <div className="flex gap-4">
                <button type="button" className="bg-pink-500/20 text-pink-400 px-6 py-1.5 rounded text-sm font-bold border border-pink-500/50">Draft</button>
                <button 
                    type="button"
                    onClick={handleCheckBudget}
                    className="bg-[#0f172a] hover:bg-slate-800 text-white px-4 py-1.5 rounded text-sm font-bold border border-slate-600 flex items-center gap-2 transition-all"
                >
                    <PieChart size={16} className="text-yellow-400" /> Check Budget
                </button>
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
               Status: <span className="text-white">Draft</span>
            </div>
        </div>

        {/* Budget Warning Banner */}
        {budgetStatus && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${
                budgetStatus.is_exceeded 
                ? 'bg-red-500/10 border-red-500/50 text-red-200' 
                : 'bg-green-500/10 border-green-500/50 text-green-200'
            }`}>
                <div className="flex items-center gap-3">
                    {budgetStatus.is_exceeded ? <AlertTriangle /> : <CheckCircle />}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wide">{budgetStatus.budget_name || 'Budget Analysis'}</h4>
                        <p className="text-xs opacity-90 mt-1">{budgetStatus.warning || "Budget is within limits."}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase font-bold opacity-70">Remaining</p>
                    <p className="text-xl font-mono font-bold">₹{budgetStatus.remaining?.toLocaleString()}</p>
                </div>
            </div>
        )}

        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-slate-700 pb-8">
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Transaction Type</label>
            <select 
              className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3"
              value={formData.invoice_type}
              onChange={(e) => setFormData({...formData, invoice_type: e.target.value})}
            >
              <option value="in_invoice">Vendor Bill (Purchase)</option>
              <option value="out_invoice">Customer Invoice (Sale)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Partner</label>
            <select 
              className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3"
              value={formData.partner}
              onChange={(e) => setFormData({...formData, partner: e.target.value})}
              required
            >
              <option value="">-- Select Partner --</option>
              {contacts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Date</label>
            <input 
              type="date" 
              className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        {/* Lines */}
        <div className="mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm border-b border-slate-700">
                <th className="pb-3 w-1/3">Product</th>
                <th className="pb-3 w-24">Qty</th>
                <th className="pb-3 w-32">Price</th>
                <th className="pb-3">Account (Auto)</th>
                <th className="pb-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {formData.lines.map((line, index) => (
                <tr key={index}>
                  <td className="p-2">
                    <select 
                      className="w-full bg-[#0f172a] border border-slate-600 rounded p-2 text-sm"
                      value={line.product}
                      onChange={(e) => updateLine(index, 'product', e.target.value)}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      className="w-full bg-[#0f172a] border border-slate-600 rounded p-2 text-sm"
                      // 🟢 FIX: Allow 0 to be shown (removed || '')
                      value={line.quantity} 
                      onChange={(e) => updateLine(index, 'quantity', e.target.value)} 
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      className="w-full bg-[#0f172a] border border-slate-600 rounded p-2 text-sm"
                      // 🟢 FIX: Allow 0 to be shown
                      value={line.price_unit} 
                      onChange={(e) => updateLine(index, 'price_unit', e.target.value)} 
                    />
                  </td>
                  <td className="p-2">
                      <select 
                      className="w-full bg-[#0f172a] border border-slate-600 rounded p-2 text-sm text-slate-300"
                      value={line.analytical_account}
                      onChange={(e) => updateLine(index, 'analytical_account', e.target.value)}
                    >
                      <option value="">(Auto-Detect)</option>
                      {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <button type="button" onClick={() => removeLine(index)} className="text-slate-600 hover:text-red-500"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addLine} className="mt-4 flex items-center text-blue-400 font-medium">
            <Plus size={18} className="mr-2" /> Add Line
          </button>
        </div>

        <div className="flex justify-end gap-4 border-t border-slate-700 pt-6">
          <button type="submit" className="px-8 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold shadow-lg flex items-center">
            <Save size={18} className="mr-2" /> Save & Confirm
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateInvoiceContent />
    </Suspense>
  );
}