"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateUserPage() {
  const router = useRouter();
  
  // 1. Define the missing state variables
  const [formData, setFormData] = useState({
    name: '',
    role: 'portal', 
    username: '',
    password: '',
    email: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // <--- Added this fixed the ReferenceError

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Now this exists!

    // Password Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      // 2. Simplified Logic (No 'isLogin' check needed here)
      const res = await api.post('/core/signup/', {
        ...formData,
        // Ensure email is set even if user left it blank (Hackathon logic)
        email: formData.email || `${formData.username}@shivfurniture.com`
      });

      if (res.data.status === 'success') {
        alert("User Created Successfully!");
        router.push('/'); // Go back to Dashboard
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create User</h1>
        <button onClick={() => router.back()} className="flex items-center text-slate-400 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto bg-[#1e293b] border border-slate-700 rounded-xl p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
              <input 
                type="text" 
                required
                className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Login ID</label>
              <input 
                type="text" 
                required
                className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email ID</label>
              <input 
                type="email" 
                required
                className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
              <select 
                className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="admin">Admin</option>
                <option value="portal">Portal User</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
              <input 
                type="password" 
                required
                className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Re-Enter Password</label>
              <input 
                type="password" 
                required
                className="input-field w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="md:col-span-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="md:col-span-2 flex gap-4 mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg flex items-center transition-colors"
            >
              <Save size={18} className="mr-2" />
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button 
              type="button"
              onClick={() => router.back()}
              className="bg-transparent border border-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-8 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}