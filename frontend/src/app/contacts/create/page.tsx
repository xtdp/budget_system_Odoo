"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, MapPin, Tag, User, Mail, Phone, Save } from 'lucide-react';

export default function CreateContact() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // We use 'province' for the Address State to avoid conflict with Status
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    street: '', city: '', province: '', country: '', pincode: '',
    tags: '' 
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        
        // 🟢 FIX: Map Address fields correctly
        data.append('street', formData.street);
        data.append('city', formData.city);
        data.append('province', formData.province); // Send to 'province' column
        // NOTE: We DO NOT send 'state' here. Backend defaults it to 'draft'.
        
        data.append('country', formData.country);
        data.append('pincode', formData.pincode);
        data.append('tags_str', formData.tags); 
        
        if (image) {
            data.append('image', image);
        }

        await api.post('/finance/contacts/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        router.push('/contacts');
    } catch (err: any) {
        console.error(err);
        // 🟢 DEBUG: This will tell you exactly what field is wrong
        alert("Error: " + JSON.stringify(err.response?.data || "Unknown Error"));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-white"><ArrowLeft /></button>
            <h1 className="text-3xl font-bold">Create Contact</h1>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COL: Basic Info & Address */}
        <div className="md:col-span-2 space-y-6">
            <div className="bg-[#1e293b] border border-slate-700 p-8 rounded-xl space-y-4 shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-400"><User size={20}/> Basic Details</h3>
                
                <div>
                    <label className="block text-slate-400 mb-1 text-sm font-bold">Contact Name</label>
                    <input className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 focus:border-pink-500 outline-none transition-colors" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Adani Enterprises"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm font-bold">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-500" size={18}/>
                            <input className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 pl-10 focus:border-pink-500 outline-none transition-colors" 
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="unique@email.com" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm font-bold">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-slate-500" size={18}/>
                            <input className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 pl-10 focus:border-pink-500 outline-none transition-colors" 
                                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91..." />
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Section */}
            <div className="bg-[#1e293b] border border-slate-700 p-8 rounded-xl space-y-4 shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-400"><MapPin size={20}/> Address Details</h3>
                
                <div>
                    <label className="block text-slate-400 mb-1 text-sm font-bold">Street</label>
                    <input className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 focus:border-pink-500 outline-none" 
                        value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} placeholder="123 Industrial Area"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm font-bold">City</label>
                        <input className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 focus:border-pink-500 outline-none" 
                            value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm font-bold">State / Province</label>
                        <input className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 focus:border-pink-500 outline-none" 
                            // 🟢 FIX: Bind to 'province'
                            value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} placeholder="e.g. Gujarat" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm font-bold">Country</label>
                        <input className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 focus:border-pink-500 outline-none" 
                            value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} placeholder="India" />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm font-bold">Pincode</label>
                        <input className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 focus:border-pink-500 outline-none" 
                            value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT COL: Image Upload */}
        <div className="space-y-6">
            <div className="bg-[#1e293b] border border-slate-700 p-8 rounded-xl text-center shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-white">Profile Image</h3>
                
                <div className="relative w-40 h-40 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-dashed border-slate-600 bg-[#0f172a] flex items-center justify-center group hover:border-pink-500 transition-colors">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center">
                            <Upload size={32} className="mx-auto text-slate-500 mb-2"/>
                            <span className="text-xs text-slate-500">Upload Image</span>
                        </div>
                    )}
                    
                    <label className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/50">
                        <Upload size={24} className="text-white mb-1" />
                        <span className="text-xs text-white font-bold">Change</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>
            </div>

            <div className="bg-[#1e293b] border border-slate-700 p-8 rounded-xl shadow-lg">
                 <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-pink-400"><Tag size={18}/> Tags</h3>
                 <input className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 placeholder:text-slate-600 focus:border-pink-500 outline-none" 
                    placeholder="e.g. B2B, Vendor, Retailer"
                    value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
                 />
                 <p className="text-xs text-slate-500 mt-2">Separate multiple tags with commas. We will create them automatically.</p>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-pink-600 hover:bg-pink-700 py-4 rounded-xl font-bold text-lg shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2">
                {loading ? 'Saving...' : <><Save size={20} /> Save Contact</>}
            </button>
        </div>

      </form>
    </div>
  );
}