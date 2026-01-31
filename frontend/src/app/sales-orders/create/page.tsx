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
    api.get('/finance/contacts/').then(res => setPartners(res.data));
    api.get('/finance/products/').then(res => setProducts(res.data));
  }, []);

  const updateLine = (index: number, field: string, value: any) => {
    const newLines: any = [...formData.lines];
    newLines[index][field] = value;
    if (field === 'product') {
      const p: any = products.find((prod: any) => prod.id == value);
      if (p) newLines[index].price_unit = p.price;
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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="text-green-400" /> New Sales Order
        </h1>
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center">
          <ArrowLeft className="mr-2" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl p-8 shadow-xl">
        {/* Header */}
        <div className="grid grid-cols-2 gap-6 mb-8 border-b border-slate-700 pb-6">
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Customer</label>
            <select 
              className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3"
              value={formData.partner}
              onChange={(e) => setFormData({...formData, partner: e.target.value})}
              required
            >
              <option value="">Select Customer</option>
              {partners.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Date</label>
            <input 
              type="date" 
              className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3"
              value={formData.date_order}
              onChange={(e) => setFormData({...formData, date_order: e.target.value})}
            />
          </div>
        </div>

        {/* Lines */}
        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-slate-300">Items</h3>
          {formData.lines.map((line, index) => (
            <div key={index} className="flex gap-4 items-end bg-[#0f172a] p-3 rounded border border-slate-800">
              <div className="flex-1">
                <select 
                  className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-sm"
                  value={line.product}
                  onChange={(e) => updateLine(index, 'product', e.target.value)}
                  required
                >
                  <option value="">Select Item</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="w-24">
                <input type="number" className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-sm"
                  value={line.quantity} onChange={(e) => updateLine(index, 'quantity', e.target.value)} />
              </div>
              <div className="w-32">
                <input type="number" className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-sm"
                  value={line.price_unit} onChange={(e) => updateLine(index, 'price_unit', e.target.value)} />
              </div>
              <button type="button" onClick={() => {
                const newLines = formData.lines.filter((_, i) => i !== index);
                setFormData({ ...formData, lines: newLines });
              }} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          ))}
          <button type="button" onClick={addLine} className="text-green-400 text-sm flex items-center font-bold mt-2">
            <Plus size={16} className="mr-1" /> Add Item
          </button>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-700">
          <button type="submit" className="px-8 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold shadow-lg flex items-center">
            <Save size={18} className="mr-2" /> Confirm Sale
          </button>
        </div>
      </form>
    </div>
  );
}