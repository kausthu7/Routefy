'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      let mockProfile = { shop_name: 'Routefy Demo Store', pickup_address: 'Bangalore' };
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        const res = await fetch('/api/merchant/profile', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (!data.pickup_address) {
            router.push('/onboarding');
            return;
          }
          mockProfile = data;
        }
      } catch (e) {
        console.warn("Using mock profile due to DB timeout");
      }
      setProfile(mockProfile);

      setOrders([
        { id: '1', customer_name: 'Rahul Menon', status: 'delivered', price: 1450 },
        { id: '2', customer_name: 'Anjali Sharma', status: 'dispatched', price: 890 },
        { id: '3', customer_name: 'Akhil R', status: 'pending', price: 2100 }
      ]);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">
      
      {/* Overview Header exactly like Vexel */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white tracking-wide">Overview</h1>
          <div className="text-sm font-medium text-slate-500 flex items-center gap-2 cursor-pointer hover:text-slate-300 transition-colors">
            Show: <span className="text-slate-300">All Shipments</span> <span className="text-xs">▼</span>
          </div>
        </div>
        <button className="bg-white hover:bg-slate-200 text-black text-sm font-semibold py-2 px-5 rounded-xl shadow-sm transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Generate Report
        </button>
      </div>

      {/* Vexel style Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative">

        <div className="spatial-panel rounded-3xl p-6 flex flex-col justify-between h-36">
          <p className="text-sm font-bold text-slate-300">Number of Orders</p>
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-semibold text-white tracking-tight">1,248</span>
              <span className="text-sm font-medium text-emerald-400">+12.5%↑</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Compared to (1,109 last month)</p>
          </div>
        </div>

        <div className="spatial-panel rounded-3xl p-6 flex flex-col justify-between h-36 border border-blue-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
          <p className="text-sm font-bold text-slate-300 relative z-10">Shipping Spent</p>
          <div className="relative z-10">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-semibold text-white tracking-tight">₹20,199</span>
              <span className="text-sm font-medium text-emerald-400">+0.5%↑</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Compared to (₹19,000 last month)</p>
          </div>
        </div>

        <div className="spatial-panel rounded-3xl p-6 flex flex-col justify-between h-36">
          <p className="text-sm font-bold text-slate-300">Return / RTO Cost</p>
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-semibold text-white tracking-tight">₹4,110</span>
              <span className="text-sm font-medium text-rose-400">-1.5%↓</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Compared to (₹4,165 last month)</p>
          </div>
        </div>

        <div className="spatial-panel rounded-3xl p-6 flex flex-col justify-between h-36 border border-blue-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
          <p className="text-sm font-bold text-slate-300 relative z-10">Wallet Balance</p>
          <div className="relative z-10">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-semibold text-white tracking-tight">₹1,422</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Available for prepaid shipping</p>
          </div>
        </div>

      </div>

      {/* Chart & Data Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        
        {/* Shipping Volume Mock Chart Area */}
        <div className="spatial-panel rounded-3xl p-6 xl:col-span-2 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-300">Shipping Volume</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" /> Prepaid
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" /> COD
              </div>
            </div>
          </div>
          
          <div className="flex-1 border-b border-l border-slate-800/50 relative">
            {/* Y-axis labels */}
            <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-600 font-mono py-2">
              <span>1k</span>
              <span>800</span>
              <span>600</span>
              <span>400</span>
              <span>200</span>
              <span>0</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[1,2,3,4,5].map(i => <div key={i} className="w-full border-t border-slate-800/30" />)}
            </div>

            {/* Mock CSS SVG Chart lines */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
               <path d="M0,80 Q10,70 20,90 T40,60 T60,80 T80,30 T100,50" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
               <path d="M0,95 Q15,85 25,95 T45,75 T65,90 T85,50 T100,80" fill="none" stroke="#22c55e" strokeWidth="1.5" />
            </svg>

            {/* Mock Tooltip overlay exactly as in Vexel image */}
            <div className="absolute top-[20%] left-[75%] -translate-x-1/2 -translate-y-1/2">
              <div className="bg-[#1A2235] border border-slate-700/50 rounded-lg p-2.5 shadow-xl flex flex-col items-center">
                <span className="text-white font-bold text-sm">₹27,632</span>
                <span className="text-slate-400 text-[10px] font-medium">August</span>
              </div>
              <div className="w-px h-full bg-slate-700/50 absolute left-1/2 top-full -translate-x-1/2 -z-10 h-64" />
              <div className="w-3 h-3 bg-[#1A2235] border-2 border-blue-500 rounded-full absolute left-1/2 -bottom-2 -translate-x-1/2 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            </div>
          </div>
        </div>

        {/* Recent Shipments List (Modified to match Vexel dark theme) */}
        <div className="spatial-panel rounded-3xl p-0 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-800/50">
             <h3 className="text-sm font-bold text-slate-300">Recent Shipments</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <Table>
              <TableHeader className="invisible h-0">
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                    <TableCell className="py-4 px-4">
                      <div className="font-bold text-slate-200">{order.customer_name || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">{order.status}</div>
                    </TableCell>
                    <TableCell className="text-right py-4 px-4">
                      <div className="font-bold text-white">₹{order.price || '0.00'}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>

    </div>
  );
}
