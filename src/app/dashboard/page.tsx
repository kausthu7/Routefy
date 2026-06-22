'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Calculate chart data from orders
  const getChartData = () => {
    // Group last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toISOString().split('T')[0],
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Prepaid: 0,
        COD: 0
      };
    });

    orders.forEach(order => {
      if (!order.created_at) return;
      const d = new Date(order.created_at).toISOString().split('T')[0];
      const dayData = last7Days.find(x => x.date === d);
      if (dayData) {
        if (order.is_cod) {
          dayData.COD += parseFloat(order.price) || 0;
        } else {
          dayData.Prepaid += parseFloat(order.price) || 0;
        }
      }
    });
    return last7Days;
  };

  useEffect(() => {
    const init = async () => {
      let mockProfile = { shop_name: 'Routefy Demo Store', pickup_address: 'Bangalore' };
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
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

      try {
        const orderRes = await fetch('/api/merchant/orders');
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }

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

  const totalOrders = orders.length;
  const shippingSpent = orders.reduce((acc, o) => acc + (parseFloat(o.price) || 0), 0);
  const formattedSpent = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(shippingSpent);

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
              <span className="text-3xl font-semibold text-white tracking-tight">{totalOrders}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">All time orders</p>
          </div>
        </div>

        <div className="spatial-panel rounded-3xl p-6 flex flex-col justify-between h-36 border border-blue-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
          <p className="text-sm font-bold text-slate-300 relative z-10">Shipping Spent</p>
          <div className="relative z-10">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-semibold text-white tracking-tight">₹{formattedSpent}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Total shipping cost</p>
          </div>
        </div>

        <div className="spatial-panel rounded-3xl p-6 flex flex-col justify-between h-36">
          <p className="text-sm font-bold text-slate-300">Return / RTO Cost</p>
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-semibold text-white tracking-tight">₹0</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">No returns yet</p>
          </div>
        </div>

        <div className="spatial-panel rounded-3xl p-6 flex flex-col justify-between h-36 border border-blue-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
          <p className="text-sm font-bold text-slate-300 relative z-10">Wallet Balance</p>
          <div className="relative z-10">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-semibold text-white tracking-tight">₹0</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Add funds in Shiprocket</p>
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
          
          <div className="flex-1 mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrepaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCod" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A2235', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Prepaid" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPrepaid)" />
                <Area type="monotone" dataKey="COD" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorCod)" />
              </AreaChart>
            </ResponsiveContainer>
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
