'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/search-bar';
import { IconBadge } from "@/components/ui/icon-badge";
import { Package, Wallet, Truck, Undo2, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
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
      try {
        const res = await fetch('/api/merchant/profile');
        if (res.ok) {
          const data = await res.json();
          // If no shop name or pickup address, force them to set it up
          if (!data.pickup_address || !data.shop_name) {
            router.push('/dashboard/settings');
            return;
          }
          setProfile(data);
        } else if (res.status === 401) {
          router.push('/login');
          return;
        }
      } catch (e) {
        console.error("Failed to fetch profile");
      }

      try {
        const orderRes = await fetch('/api/merchant/orders');
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }

      try {
        const walletRes = await fetch('/api/merchant/wallet');
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.balance || 0);
        }
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
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
  
  const formattedBalance = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(walletBalance);

  const todayStr = new Date().toISOString().split('T')[0];
  const ordersToday = orders.filter(o => o.created_at && o.created_at.startsWith(todayStr)).length;
  
  const isNewAccount = totalOrders <= 1;

  // Status color mapper
  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100">{status}</Badge>;
      case 'dispatched':
        return <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100">{status}</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200">{status}</Badge>;
    }
  };

  return (
    <div className="p-[20px] md:p-[32px] max-w-7xl mx-auto space-y-[24px] animate-in fade-in duration-500 relative z-10 pb-32">
      
      {/* Mobile Search Box */}
      <div className="md:hidden w-full max-w-[353px] mx-auto mb-[24px]">
        <SearchBar />
      </div>

      <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Overview</h1>
          {!isNewAccount && (
            <div className="text-sm font-medium text-slate-500 flex items-center gap-2 cursor-pointer hover:text-slate-700 transition-colors">
              Show: <span className="text-slate-700">All Shipments</span> <span className="text-xs">▼</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {!isNewAccount && (
            <button className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-2 px-5 rounded-xl shadow-sm transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Generate Report
            </button>
          )}
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="w-full max-w-[353px] md:max-w-none mx-auto p-[24px] bg-white/92 backdrop-blur-xl rounded-[24px] flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#7C3AED]/10 to-[#5B21B6]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative z-10 mb-5">
          <div className="flex items-center gap-3 mb-2">
            <IconBadge icon={Sparkles} variant="purple" />
            <span className="text-lg font-semibold text-slate-900">AI Assistant</span>
          </div>
          <p className="text-[14px] font-[400] text-slate-500 mb-3">Ready to create your next shipment.</p>
          <div className="flex flex-wrap gap-2 text-[12px] text-slate-500 font-medium">
            <span className="bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/50">Paste text</span>
            <span className="bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/50">Upload Screenshot</span>
            <span className="bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/50">Voice</span>
          </div>
        </div>
        <Link href="/dashboard/ai-order" className="relative z-10 w-full h-[48px] bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-[14px] text-white flex items-center justify-center font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all text-[15px]">
          + New Shipment
        </Link>
      </div>

      {/* Premium Light Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[24px] relative w-full max-w-[353px] md:max-w-none mx-auto">
        {/* Orders Card */}
        <div className="bg-white/92 backdrop-blur-xl rounded-[24px] p-[24px] flex flex-col justify-between min-h-[160px] w-full group overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100/30 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <IconBadge icon={Package} variant="purple" />
            <span className="text-sm font-medium text-slate-600">Orders</span>
          </div>
          <div className="mt-auto relative z-10">
            <div className="flex items-baseline gap-3 mb-1">
              <div className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 leading-none">{totalOrders}</div>
            </div>
            <p className="text-[13px] text-emerald-500 font-medium flex items-center gap-1.5 bg-emerald-50 w-max px-2 py-0.5 rounded-md mt-2">
              +{ordersToday}% Today
            </p>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-white/92 backdrop-blur-xl rounded-[24px] p-[24px] flex flex-col justify-between min-h-[160px] w-full group overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <IconBadge icon={Wallet} variant="green" />
            <span className="text-sm font-medium text-slate-600">Wallet</span>
          </div>
          <div className="mt-auto relative z-10">
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 leading-none">₹{formattedBalance}</div>
            </div>
            <p className="text-[13px] text-emerald-500 font-medium flex items-center gap-1.5 bg-emerald-50 w-max px-2 py-0.5 rounded-md mt-2">
              +₹0 Today
            </p>
          </div>
        </div>

        {/* Shipping Spent Card */}
        <div className="bg-white/92 backdrop-blur-xl rounded-[24px] p-[24px] flex flex-col justify-between min-h-[160px] w-full group overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <IconBadge icon={Truck} variant="blue" />
            <span className="text-sm font-medium text-slate-600">Shipping</span>
          </div>
          <div className="mt-auto relative z-10">
            <div className="flex items-baseline gap-3 mb-1">
              <div className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 leading-none">₹{formattedSpent}</div>
            </div>
            <p className="text-[13px] text-slate-500 font-medium bg-slate-50 w-max px-2 py-0.5 rounded-md mt-2">
              Lifetime
            </p>
          </div>
        </div>

        {/* Return Cost Card */}
        <div className="bg-white/92 backdrop-blur-xl rounded-[24px] p-[24px] flex flex-col justify-between min-h-[160px] w-full group overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/30 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <IconBadge icon={Undo2} variant="neutral" />
            <span className="text-sm font-medium text-slate-600">Returns</span>
          </div>
          <div className="mt-auto relative z-10">
            <div className="flex items-baseline gap-3 mb-1">
              <div className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 leading-none">₹0</div>
            </div>
            <p className="text-[13px] text-emerald-500 font-medium bg-emerald-50 w-max px-2 py-0.5 rounded-md mt-2">
              No returns
            </p>
          </div>
        </div>
      </div>

      {/* Chart & Data Area */}
      <div className="flex flex-col xl:flex-row gap-[24px] xl:gap-6 mt-[24px] w-full max-w-[353px] md:max-w-none mx-auto">
        
        {/* Shipping Volume Card (Mobile) */}
        <div className="bg-white rounded-[22px] p-[22px] flex-1 min-h-[340px] md:min-h-[400px] flex flex-col shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-[24px]">
            <h3 className="text-[18px] md:text-[22px] font-[700] text-slate-900">Shipping Volume</h3>
            <div className="flex items-center justify-center w-[120px] h-[42px] rounded-[14px] bg-slate-50 border border-slate-100 text-slate-600 text-[14px]">
              Last 7 Days
            </div>
          </div>
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-[14px] font-[400] text-slate-500">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Prepaid
            </div>
            <div className="flex items-center gap-2 text-[14px] font-[400] text-slate-500">
              <div className="w-2 h-2 rounded-full bg-green-500" /> COD
            </div>
          </div>
          
          <div className="flex-1 h-[200px] w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: '500' }}
                />
                <Area type="monotone" dataKey="Prepaid" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPrepaid)" />
                <Area type="monotone" dataKey="COD" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorCod)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-[12px] text-slate-400 font-medium uppercase tracking-wider mb-1">Total</span>
              <span className="text-[20px] font-[700] text-slate-900 leading-none">{orders.length}</span>
            </div>
            <div className="w-[1px] h-[30px] bg-slate-100" />
            <div className="flex flex-col">
              <span className="text-[12px] text-slate-400 font-medium uppercase tracking-wider mb-1">Prepaid</span>
              <span className="text-[20px] font-[700] text-blue-600 leading-none">{orders.filter(o => !o.is_cod).length}</span>
            </div>
            <div className="w-[1px] h-[30px] bg-slate-100" />
            <div className="flex flex-col">
              <span className="text-[12px] text-slate-400 font-medium uppercase tracking-wider mb-1">COD</span>
              <span className="text-[20px] font-[700] text-green-500 leading-none">{orders.filter(o => o.is_cod).length}</span>
            </div>
          </div>
        </div>

        {/* Recent Shipments Card (Mobile) */}
        <div className="bg-white/92 backdrop-blur-xl rounded-[24px] p-[24px] w-full xl:w-[353px] min-h-[340px] md:min-h-[400px] flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[18px] md:text-[22px] font-[700] text-slate-900">Recent</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
             {orders.length === 0 ? (
               <>
                 <div className="w-[80px] h-[80px] mb-4 bg-gradient-to-br from-[#7C3AED]/10 to-[#5B21B6]/10 rounded-full flex items-center justify-center border border-purple-100">
                    <span className="text-3xl">📦</span>
                 </div>
                 <h4 className="text-[20px] font-[700] text-slate-900 leading-tight mb-2">No Shipments Yet</h4>
                 <p className="text-[14px] font-[400] text-slate-500 mb-6 px-4">Paste your first order or upload a screenshot to create a shipment.</p>
                 <Link href="/dashboard/ai-order" className="w-[200px] h-[48px] rounded-[16px] bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:shadow-lg hover:shadow-purple-500/30 text-white text-[15px] font-[600] flex items-center justify-center transition-all">
                    Create First Shipment
                 </Link>
               </>
             ) : (
                <div className="w-full h-full flex flex-col gap-4 overflow-y-auto pr-2">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="text-left">
                        <div className="font-[600] text-[15px] text-slate-900">{order.customer_name || 'N/A'}</div>
                        <div className="mt-1">{getStatusBadge(order.status)}</div>
                      </div>
                      <div className="font-[700] text-[16px] text-slate-900">₹{order.price || '0.00'}</div>
                    </div>
                  ))}
                  {orders.length > 3 && (
                    <button className="w-full h-[48px] mt-2 rounded-[16px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[16px] font-[600] transition-colors">
                      View All
                    </button>
                  )}
                </div>
             )}
          </div>
        </div>

      </div>

    </div>
  );
}
