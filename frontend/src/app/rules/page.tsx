"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, ArrowLeft, Zap } from 'lucide-react';

export default function RulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState([]);

  useEffect(() => {
    api.get('/finance/rules/').then(res => setRules(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Auto Analytical Models</h1>
            <p className="text-slate-400 text-sm">Automate cost center allocation based on conditions</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/rules/create')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center font-bold shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} className="mr-2" /> New Model
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-4">
        {rules.map((rule: any) => (
          <div key={rule.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-xl flex items-center justify-between hover:border-pink-500 transition-all group">
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-3 rounded-full text-pink-400 border border-slate-600 group-hover:border-pink-500 transition-colors">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{rule.name}</h3>
                <div className="text-sm text-slate-400 flex flex-wrap gap-2">
                    {rule.product_category && <span className="bg-slate-700 px-2 rounded">Category: <span className="text-pink-300">{rule.product_category}</span></span>}
                    {/* Add Partner/Tags here if you implement those fields later */}
                    <span className="text-slate-500">→</span>
                    <span className="text-green-400 font-bold border-b border-green-500/50">{rule.target_account_name}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Priority</span>
              <p className="text-2xl font-bold text-white">{rule.priority}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}