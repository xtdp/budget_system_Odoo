"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // <--- Import Router
import { Users, Package, PieChart, Calculator, FileText, ShoppingCart, CreditCard, ArrowRight, LogOut } from 'lucide-react';
import Link from 'next/link';

// Reusable Card Component
const MenuCard = ({ title, icon: Icon, items, color }: any) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all">
    <div className={`flex items-center gap-3 mb-6 ${color}`}>
      <Icon size={32} />
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
    <div className="space-y-3">
      {items.map((item: any, idx: number) => (
        <Link 
          key={idx} 
          href={item.href}
          className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-700 border border-slate-700/50 hover:border-blue-500 group transition-all cursor-pointer"
        >
          <span className="text-gray-300 group-hover:text-white font-medium">{item.label}</span>
          <ArrowRight size={16} className="text-gray-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);

  // 🔒 SECURITY CHECK
  useEffect(() => {
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');
    
    if (!role || !name) {
      router.push('/login'); // No login? Go to Login.
    } else if (role !== 'admin') {
      router.push('/portal'); // Not Admin? Go to Portal. <--- SECURITY FIX
    } else {
      setUser(name); // All good, show Admin Dashboard.
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  // Prevent flash of dashboard content while checking auth
  if (!user) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-500">Checking Access...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Budget Accounting System</h1>
          <p className="text-slate-400">Shiv Furniture • Welcome, <span className="text-blue-400 font-bold capitalize">{user}</span></p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center text-red-400 hover:text-red-300 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 transition-all"
        >
          <LogOut size={16} className="mr-2" /> Logout
        </button>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: ACCOUNT */}
        <MenuCard 
          title="Account" 
          icon={Calculator} 
          color="text-orange-400"
          items={[
            { label: "Contacts", href: "/contacts" },
            { label: "Products", href: "/products" }, // <--- Make sure this route exists later
            { label: "Analytical Accounts", href: "/analytical-accounts" }, // <--- And this
            { label: "Auto Analytic Models", href: "/rules" },
            { label: "Budgets", href: "/budgets" },
            { label: "Create User", href: "/users/create" },
          ]}
        />

        {/* Column 2: PURCHASE */}
        <MenuCard 
          title="Purchase" 
          icon={ShoppingCart} 
          color="text-blue-400"
          items={[
            { label: "Purchase Orders", href: "/purchase-orders" },
            { label: "Create Vendor Bill", href: "/invoices/create" },
            { label: "Payments", href: "/payments?type=send" },
          ]}
        />

        {/* Column 3: SALE */}
        <MenuCard 
          title="Sale" 
          icon={PieChart} 
          color="text-green-400"
          items={[
            { label: "Sales Orders", href: "/sales-orders" },
            { label: "Customer Invoices", href: "/customer-invoices" },
            { label: "Receipts", href: "/payments?type=receive" },
          ]}
        />

      </div>
    </div>
  );
}