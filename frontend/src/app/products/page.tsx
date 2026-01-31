"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, Package, Save, X } from 'lucide-react';

export default function ProductMaster() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: 0, category: '' });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = () => api.get('/finance/products/').then(res => setProducts(res.data));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/finance/products/', formData);
    setShowModal(false);
    loadProducts();
    setFormData({ name: '', price: 0, category: 'furniture' });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full">
             <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Package className="text-purple-400" /> Products</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center font-bold">
          <Plus size={18} className="mr-2" /> New Product
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p: any) => (
          <div key={p.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-xl hover:border-purple-500 transition-all">
            <h3 className="font-bold text-xl">{p.name}</h3>
            <p className="text-slate-400 text-sm uppercase mt-1">{p.category}</p>
            <p className="text-2xl font-bold mt-4 text-purple-400">₹{p.price}</p>
          </div>
        ))}
      </div>

      {/* Modal for Quick Create */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-[#1e293b] p-8 rounded-xl border border-slate-700 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add Product</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Name</label>
                <input className="input-field w-full bg-[#0f172a] border border-slate-600 rounded p-2" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Price</label>
                <input type="number" className="input-field w-full bg-[#0f172a] border border-slate-600 rounded p-2" 
                  value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
              </div>
              <div>
                 <label className="block text-sm text-slate-400 mb-1">Category (Must match Auto-Rule)</label>
                 <input 
                   className="input-field w-full bg-[#0f172a] border border-slate-600 rounded p-2 focus:border-purple-500 outline-none transition-colors"
                   placeholder="e.g. Events, Raw Material, Silver"
                   value={formData.category} 
                   onChange={e => setFormData({...formData, category: e.target.value})} 
                   required
                 />
                 <p className="text-xs text-slate-500 mt-1">Tip: Copy this exactly from your Admin Auto-Rule.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold transition-colors">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}