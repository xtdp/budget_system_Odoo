"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, ArrowLeft, Zap, Trash2 } from 'lucide-react';

export default function RulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState([]);

  useEffect(() => {
    api.get('/finance/rules/').then(res => setRules(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-800 rounded-full">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Auto Analytical Models</h1>
            <p className="text-slate-400 text-sm">Define rules to automate cost center allocation</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/rules/create')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center font-bold"
        >
          <Plus size={18} className="mr-2" /> New Rule
        </button>
      </div>

      {/* Rules List (Matching the 'List View' concept) */}
      <div className="max-w-5xl mx-auto space-y-4">
        {rules.map((rule: any) => (
          <div key={rule.id} className="bg-[#1e293b] border border-slate-700 p-6 rounded-xl flex items-center justify-between hover:border-blue-500 transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-full text-blue-400">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{rule.name}</h3>
                <p className="text-slate-400 text-sm mt-1">
                  If Category is <span className="text-pink-400 font-bold">{rule.product_category}</span> 
                  {' '} → Assign to <span className="text-green-400 font-bold">{rule.target_account_name}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Priority</span>
              <p className="text-2xl font-bold text-white">{rule.priority}</p>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="text-center p-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
            No rules found. Click "New Rule" to train your robot.
          </div>
        )}
      </div>
    </div>
  );
}