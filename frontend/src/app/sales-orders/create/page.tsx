"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, Trash2, Save, DollarSign } from 'lucide-react';

export default function CreateSOPage() {
  const router = useRouter();
  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    partner: '',
    date_order: new Date().toISOString().split('T')[0],
    state: 'confirmed',
    lines: [{ product: '', quantity: 1, price_unit: 0 }]
  });

  useEffect(() => {
    // Load Master Data
    api.get('/finance/contacts/').then(res => setPartners(res.data));
    api.get('/finance/products/').then(res => setProducts(res.data));
  }, []);

  const updateLine = (index: number, field: string, value: any) => {
    const newLines: any = [...formData.lines];
    newLines[index][field] = value;
    
    // Auto-fetch Price Logic
    if (field === 'product') {
      const p: any = products.find((prod: any) => prod.id == value);
      if (p) {
          // Use 'sales_price' for Sales Orders!
          newLines[index].price_unit = p.sales_price || p.price || 0;
      }
    }
    setFormData({ ...formData, lines: newLines });
  };

  const addLine = () => {
    setFormData({ ...formData, lines: [...formData.lines, { product: '', quantity: 1, price_unit: 0 }] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/sales-orders/', formData);
      alert("Sales Order Confirmed!");
      router.push('/sales-orders');
    } catch (err) {
      console.error(err);
      alert("Failed to create SO");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center border border-slate-600 px-3 py-2 rounded-lg transition-colors">
            <ArrowLeft className="mr-2" size={20} /> Back
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="text-green-400" /> New Sales Order
            </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl p-8 shadow-xl">
        
        {/* Header Fields */}
        <div className="grid grid-cols-2 gap-8 mb-8 border-b border-slate-700 pb-8">
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Customer</label>
            <select 
              className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              value={formData.partner}
              onChange={(e) => setFormData({...formData, partner: e.target.value})}
              required
            >
              <option value="" className="text-slate-500">Select Customer...</option>
              {partners.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Order Date</label>
            <input 
              type="date" 
              className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-green-500"
              value={formData.date_order}
              onChange={(e) => setFormData({...formData, date_order: e.target.value})}
            />
          </div>
        </div>

        {/* Lines Table */}
        <div className="mb-8">
          <h3 className="font-bold text-slate-300 text-lg mb-4">Items to Sell</h3>
          
          <div className="space-y-3">
            {formData.lines.map((line, index) => (
                <div key={index} className="flex gap-4 items-end bg-[#0f172a] p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                
                <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block uppercase font-bold">Product</label>
                    <select 
                    className="w-full bg-transparent border-b border-slate-600 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                    value={line.product}
                    onChange={(e) => updateLine(index, 'product', e.target.value)}
                    required
                    >
                    <option value="" className="bg-[#0f172a]">Select Product</option>
                    {products.map((p: any) => <option key={p.id} value={p.id} className="bg-[#0f172a]">{p.name}</option>)}
                    </select>
                </div>
                
                <div className="w-24">
                    <label className="text-xs text-slate-500 mb-1 block uppercase font-bold">Qty</label>
                    <input type="number" className="w-full bg-transparent border-b border-slate-600 py-2 text-sm text-white focus:outline-none focus:border-green-500 text-center"
                    value={line.quantity || ''} onChange={(e) => updateLine(index, 'quantity', e.target.value)} />
                </div>
                
                <div className="w-32">
                    <label className="text-xs text-slate-500 mb-1 block uppercase font-bold">Unit Price</label>
                    <div className="relative">
                        <span className="absolute left-0 top-2 text-slate-500">₹</span>
                        <input type="number" className="w-full bg-transparent border-b border-slate-600 py-2 pl-4 text-sm text-white focus:outline-none focus:border-green-500"
                        value={line.price_unit || ''} onChange={(e) => updateLine(index, 'price_unit', e.target.value)} />
                    </div>
                </div>
                
                <button type="button" onClick={() => {
                    const newLines = formData.lines.filter((_, i) => i !== index);
                    setFormData({ ...formData, lines: newLines });
                }} className="p-2 text-slate-500 hover:text-red-500 transition-colors self-center">
                    <Trash2 size={18} />
                </button>
                </div>
            ))}
          </div>

          <button type="button" onClick={addLine} className="text-green-400 hover:text-green-300 text-sm flex items-center font-bold mt-4 px-2 py-1 rounded border border-green-500/30 bg-green-500/10">
            <Plus size={16} className="mr-1" /> Add Item
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 border-t border-slate-700 gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 text-slate-400 hover:text-white font-bold transition-colors">Cancel</button>
          <button type="submit" className="px-8 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold shadow-lg shadow-green-500/20 flex items-center transition-all">
            <Save size={18} className="mr-2" /> Confirm Sale
          </button>
        </div>
      </form>
    </div>
  );
}