"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, Package, X, Tag, Search, Filter } from 'lucide-react';

export default function ProductMaster() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({ 
      name: '', 
      category: '', 
      sales_price: '', 
      purchase_price: '' 
  });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
        const res = await api.get('/finance/products/');
        setProducts(res.data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.post('/finance/products/', formData);
        setShowModal(false);
        loadProducts(); // Refresh List
        setFormData({ name: '', category: '', sales_price: '', purchase_price: '' });
    } catch (err) {
        alert("Failed to save product.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
             <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="text-purple-400" /> Price List
          </h1>
        </div>
        
        <button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center font-bold shadow-lg shadow-purple-500/20 transition-all">
            <Plus size={18} className="mr-2" /> New Product
        </button>
      </div>

      {/* Main List Card (Table View) */}
      <div className="max-w-6xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl shadow-xl overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700 flex gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                <input 
                  placeholder="Search products..." 
                  className="w-full bg-[#0f172a] border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors">
                <Filter size={16} className="text-slate-400"/> Filter
            </button>
        </div>

        {/* PRICE LIST TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f172a]/50 text-slate-400 border-b border-slate-700 text-sm uppercase tracking-wider">
                <th className="p-4 w-12"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /></th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Sales Price</th>
                <th className="p-4 text-right">Cost Price</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading price list...</td></tr>
              ) : products.length === 0 ? (
                 <tr><td colSpan={6} className="p-8 text-center text-slate-500">No products found.</td></tr>
              ) : (
                products.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /></td>
                    
                    {/* Name */}
                    <td className="p-4 font-bold text-white">
                        {p.name}
                    </td>

                    {/* Category */}
                    <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/50 border border-slate-600 text-xs font-medium text-slate-300">
                           <Tag size={12} className="text-slate-400"/> {p.category || 'General'}
                        </span>
                    </td>

                    {/* Sales Price */}
                    <td className="p-4 text-right font-mono text-purple-400 font-bold">
                        ₹{p.sales_price}
                    </td>

                    {/* Purchase Price */}
                    <td className="p-4 text-right font-mono text-slate-400">
                        ₹{p.purchase_price}
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest ${
                            p.state === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                            {p.state}
                        </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Quick Create */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-[#1e293b] p-8 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl relative">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X /></button>
            
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Package className="text-purple-400"/> New Product</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Product Name</label>
                <input className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white focus:border-purple-500 outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Silver Ring" />
              </div>

              <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Category</label>
                  <input 
                    className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                    placeholder="e.g. Jewelry (Created automatically)"
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                  />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Sales Price</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-slate-500">₹</span>
                        <input type="number" className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 pl-8 text-white focus:border-purple-500 outline-none" 
                        value={formData.sales_price} onChange={e => setFormData({...formData, sales_price: e.target.value})} required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Cost Price</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-slate-500">₹</span>
                        <input type="number" className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 pl-8 text-white focus:border-purple-500 outline-none" 
                        value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: e.target.value})} required />
                    </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
              <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg text-slate-400 hover:text-white font-bold transition-colors">Cancel</button>
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-8 py-2 rounded-lg text-white font-bold shadow-lg shadow-purple-500/25 transition-all">Save Product</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}