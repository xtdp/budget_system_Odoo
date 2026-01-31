// "use client";
// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { 
//   Users, Package, PieChart, Calculator, FileText, 
//   ShoppingCart, CreditCard, LogOut, Settings, 
//   Briefcase, TrendingUp, Layers, BadgeDollarSign 
// } from 'lucide-react';

// // 🎨 Component: Single App Icon (The "Odoo" Style)
// const AppCard = ({ label, href, icon: Icon, color, desc }: any) => (
//   <Link 
//     href={href}
//     className="group relative flex flex-col items-center p-6 bg-[#1e293b]/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10"
//   >
//     {/* Icon Container with Glow */}
//     <div className={`p-4 rounded-xl mb-4 ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
//       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
//       <Icon size={32} strokeWidth={1.5} />
//     </div>
    
//     {/* Text */}
//     <h3 className="text-lg font-bold text-slate-100 mb-1">{label}</h3>
//     <p className="text-xs text-slate-500 text-center font-medium">{desc}</p>

//     {/* Hover Arrow */}
//     <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
//       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M7 17l9.2-9.2M17 17V7H7"/>
//       </svg>
//     </div>
//   </Link>
// );

// // 🗂️ Component: Section Title
// const SectionTitle = ({ title }: { title: string }) => (
//   <div className="col-span-full flex items-center gap-4 my-4">
//     <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">{title}</h2>
//     <div className="h-[1px] bg-slate-800 flex-1"></div>
//   </div>
// );

// export default function Dashboard() {
//   const router = useRouter();
//   const [user, setUser] = useState<string | null>(null);

//   // 🔒 Security Check
//   useEffect(() => {
//     const role = localStorage.getItem('user_role');
//     const name = localStorage.getItem('user_name');
    
//     if (!role || !name) {
//       router.push('/login'); 
//     } else if (role !== 'admin') {
//       router.push('/portal');
//     } else {
//       setUser(name); 
//     }
//   }, []);

//   const handleLogout = () => {
//     localStorage.clear();
//     router.push('/login');
//   };

//   if (!user) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-500">Checking Access...</div>;

//   return (
//     <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-[#0f172a] p-8">
      
//       {/* 🟢 Header */}
//       <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
//         <div>
//           <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
//             Shiv Furniture
//           </h1>
//           <p className="text-slate-400 font-medium">
//             Financial Operating System • <span className="text-slate-200">Welcome, {user}</span>
//           </p>
//         </div>
//         <button 
//           onClick={handleLogout}
//           className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-5 py-2.5 rounded-full transition-all"
//         >
//           <LogOut size={16} /> Logout
//         </button>
//       </div>

//       {/* 🟢 App Grid */}
//       <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">

//         {/* --- OPERATIONS --- */}
//         <SectionTitle title="Daily Operations" />
        
//         <AppCard 
//           label="Purchase" 
//           desc="Orders & RFQs"
//           icon={ShoppingCart} 
//           color="bg-blue-500" 
//           href="/purchase-orders" 
//         />
//         <AppCard 
//           label="Sales" 
//           desc="Quotations & Orders"
//           icon={Briefcase} 
//           color="bg-green-500" 
//           href="/sales-orders" 
//         />
//         <AppCard 
//           label="Vendor Bills" 
//           desc="Payables"
//           icon={FileText} 
//           color="bg-indigo-500" 
//           href="/vendor-bills" 
//         />
//         <AppCard 
//           label="Invoices" 
//           desc="Receivables"
//           icon={BadgeDollarSign} 
//           color="bg-teal-500" 
//           href="/customer-invoices" 
//         />

//         {/* --- ACCOUNTING & ANALYSIS --- */}
//         <SectionTitle title="Finance & Budgeting" />

//         <AppCard 
//           label="Budgets" 
//           desc="Plan vs Actuals"
//           icon={PieChart} 
//           color="bg-pink-500" 
//           href="/budgets" 
//         />
//         <AppCard 
//           label="Analytics" 
//           desc="Cost Centers"
//           icon={Calculator} 
//           color="bg-purple-500" 
//           href="/analytical-accounts" 
//         />
//         <AppCard 
//           label="Rules" 
//           desc="Auto-Accounting"
//           icon={Layers} 
//           color="bg-orange-500" 
//           href="/rules" 
//         />

//         {/* --- MASTER DATA --- */}
//         <SectionTitle title="Master Data" />

//         <AppCard 
//           label="Contacts" 
//           desc="Customers & Vendors"
//           icon={Users} 
//           color="bg-sky-500" 
//           href="/contacts" 
//         />
//         <AppCard 
//           label="Products" 
//           desc="Items & Services"
//           icon={Package} 
//           color="bg-yellow-500" 
//           href="/products" 
//         />
//          <AppCard 
//           label="Users" 
//           desc="Access Control"
//           icon={Settings} 
//           color="bg-slate-600" 
//           href="/users/create" 
//         />

//       </div>
      
//       {/* Footer Branding */}
//       <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 text-center">
//          <p className="text-slate-600 text-sm">Powered by <span className="font-bold text-slate-500">Shiv ERP v1.0</span></p>
//       </div>

//     </div>
//   );
// }















"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api'; // Import your API helper
import { 
  Users, Package, PieChart, Calculator, FileText, 
  ShoppingCart, LogOut, Settings, Briefcase, 
  Layers, BadgeDollarSign, TrendingUp, Wallet, AlertCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, Legend 
} from 'recharts';

// Colors for the Pie Chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// 🎨 Component: Single App Icon
const AppCard = ({ label, href, icon: Icon, color, desc }: any) => (
  <Link 
    href={href}
    className="group relative flex flex-col items-center p-6 bg-[#1e293b]/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10 cursor-pointer"
  >
    <div className={`p-4 rounded-xl mb-4 ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <h3 className="text-lg font-bold text-slate-100 mb-1">{label}</h3>
    <p className="text-xs text-slate-500 text-center font-medium">{desc}</p>
  </Link>
);

// 📊 Component: KPI Card
const KPICard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-[#1e293b]/50 border border-slate-700/50 p-6 rounded-2xl flex items-center gap-4 hover:border-slate-500 transition-colors">
    <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-white mt-1">{value}</h3>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  </div>
);

// 🗂️ Component: Section Title
const SectionTitle = ({ title }: { title: string }) => (
  <div className="col-span-full flex items-center gap-4 my-6">
    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-[#0f172a] pr-4">{title}</h2>
    <div className="h-[1px] bg-slate-800 flex-1"></div>
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // 🟢 STATE FOR REAL DATA
  const [kpi, setKpi] = useState({ revenue: 0, pendingBills: 0, budgetUtil: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    
    // 1. Auth Check
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');
    if (!role || !name) { router.push('/login'); return; }
    if (role !== 'admin') { router.push('/portal'); return; }
    setUser(name); 

    // 2. Fetch Real Data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
        const [invRes, budgetRes] = await Promise.all([
            api.get('/finance/invoices/'),
            api.get('/finance/budgets/')
        ]);

        const invoices = invRes.data;
        const budgets = budgetRes.data;

        // --- CALCULATE KPI: REVENUE & PENDING BILLS ---
        let totalRevenue = 0;
        let pendingCount = 0;

        invoices.forEach((inv: any) => {
            if (inv.invoice_type === 'out_invoice' && inv.state === 'posted') {
                totalRevenue += parseFloat(inv.total_amount);
            }
            if (inv.invoice_type === 'in_invoice' && inv.payment_state !== 'paid' && inv.state !== 'cancelled') {
                pendingCount++;
            }
        });

        // --- CALCULATE KPI: BUDGET UTILIZATION & PIE CHART ---
        let totalPlanned = 0;
        let totalActual = 0;
        const budgetPieMap: any = {};

        budgets.forEach((b: any) => {
            if (b.state === 'confirmed') {
                b.lines.forEach((l: any) => {
                    totalPlanned += parseFloat(l.planned_amount);
                    totalActual += Math.abs(parseFloat(l.actual_amount));
                    
                    // Pie Chart Grouping
                    if (!budgetPieMap[l.account_name]) budgetPieMap[l.account_name] = 0;
                    budgetPieMap[l.account_name] += parseFloat(l.planned_amount);
                });
            }
        });
        
        const utilPercent = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

        // Convert Map to Array for Pie Chart
        const finalPieData = Object.keys(budgetPieMap).map(key => ({
            name: key, value: budgetPieMap[key]
        }));


        // --- CALCULATE BAR CHART (Cash Flow by Month) ---
        const monthMap: any = {};
        invoices.forEach((inv: any) => {
             const date = new Date(inv.date);
             const monthKey = date.toLocaleString('default', { month: 'short' }); // "Jan", "Feb"
             
             if (!monthMap[monthKey]) monthMap[monthKey] = { name: monthKey, income: 0, expense: 0 };
             
             const amount = parseFloat(inv.total_amount);
             if (inv.invoice_type === 'out_invoice' && inv.state === 'posted') {
                 monthMap[monthKey].income += amount;
             } else if (inv.invoice_type === 'in_invoice' && inv.state === 'posted') {
                 monthMap[monthKey].expense += amount;
             }
        });

        // Convert to Array & Sort (Simple approach: just Object.values)
        // For a hackathon, sorting by month index is cleaner, but this works if data is recent.
        const finalChartData = Object.values(monthMap);

        // SET STATE
        setKpi({ 
            revenue: totalRevenue, 
            pendingBills: pendingCount, 
            budgetUtil: utilPercent 
        });
        setBudgetData(finalPieData.length > 0 ? finalPieData : [{name: 'No Data', value: 1}]);
        setChartData(finalChartData.length > 0 ? finalChartData : [{name: 'No Data', income: 0, expense: 0}]);
        setLoading(false);

    } catch (err) {
        console.error("Dashboard Data Error", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!user || loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-500 animate-pulse">Loading Live Data...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-[#0f172a] p-8">
      
      {/* 🟢 Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            Shiv Furniture
          </h1>
          <p className="text-slate-400 font-medium">
            Financial Operating System • <span className="text-slate-200">Welcome, {user}</span>
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-5 py-2.5 rounded-full transition-all"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* 🟢 VISUAL INSIGHTS (REAL DATA) */}
      <div className="max-w-7xl mx-auto mb-12">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard 
                title="Total Revenue" 
                value={`₹${kpi.revenue.toLocaleString()}`} 
                sub="Recognized Revenue" 
                icon={Wallet} color="bg-green-500" 
            />
            <KPICard 
                title="Budget Utilized" 
                value={`${kpi.budgetUtil}%`} 
                sub="Of Total Planned Budget" 
                icon={PieChart} color="bg-blue-500" 
            />
            <KPICard 
                title="Pending Bills" 
                value={kpi.pendingBills} 
                sub="Unpaid Vendor Bills" 
                icon={AlertCircle} color="bg-pink-500" 
            />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Cash Flow (Real Data) */}
            <div className="bg-[#1e293b]/50 border border-slate-700/50 p-6 rounded-2xl">
                <h3 className="text-slate-200 font-bold mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-400"/> Cash Flow Analysis
                </h3>
                <div className="h-64 w-full">
                    {isClient && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{fill: '#334155', opacity: 0.2}}
                                />
                                <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} name="Income" />
                                <Bar dataKey="expense" fill="#f472b6" radius={[4, 4, 0, 0]} name="Expense" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Chart 2: Budget Allocation (Real Data) */}
            <div className="bg-[#1e293b]/50 border border-slate-700/50 p-6 rounded-2xl">
                <h3 className="text-slate-200 font-bold mb-6 flex items-center gap-2">
                    <PieChart size={18} className="text-blue-400"/> Active Budget Allocation
                </h3>
                <div className="h-64 w-full flex items-center justify-center">
                    {isClient && (
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={budgetData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {budgetData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </RePieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

        </div>
      </div>

      {/* 🟢 APP GRID (Navigation) */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-20">

        <SectionTitle title="Daily Operations" />
        
        <AppCard label="Purchase" desc="Orders" icon={ShoppingCart} color="bg-blue-500" href="/purchase-orders" />
        <AppCard label="Sales" desc="Invoices" icon={Briefcase} color="bg-green-500" href="/sales-orders" />
        <AppCard label="Vendor Bills" desc="Payables" icon={FileText} color="bg-indigo-500" href="/vendor-bills" />
        <AppCard label="Invoices" desc="Receivables" icon={BadgeDollarSign} color="bg-teal-500" href="/customer-invoices" />
        
        <SectionTitle title="Planning & Analysis" />

        <AppCard label="Budgets" desc="Planning" icon={PieChart} color="bg-pink-500" href="/budgets" />
        <AppCard label="Analytics" desc="Centers" icon={Calculator} color="bg-purple-500" href="/analytical-accounts" />
        <AppCard label="Rules" desc="Automation" icon={Layers} color="bg-orange-500" href="/rules" />
        
        <SectionTitle title="Master Data" />

        <AppCard label="Contacts" desc="Partners" icon={Users} color="bg-sky-500" href="/contacts" />
        <AppCard label="Products" desc="Items" icon={Package} color="bg-yellow-500" href="/products" />
        <AppCard label="Users" desc="Admin" icon={Settings} color="bg-slate-600" href="/users/create" />

      </div>
      
      {/* Footer Branding */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 text-center">
         <p className="text-slate-600 text-sm">Powered by <span className="font-bold text-slate-500">Shiv ERP v1.0</span></p>
      </div>

    </div>
  );
}