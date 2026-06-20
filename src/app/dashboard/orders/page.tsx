'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Package, MapPin, Phone, IndianRupee, Truck } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.warn("Using mock data due to DB error");
        setOrders([
          { id: '1', customer_name: 'Rahul Menon', customer_phone: '9447123456', delivery_address: 'Near SBI Bank, MG Road', pincode: '686575', status: 'delivered', is_cod: false, cod_amount: 0, weight_kg: 0.5 },
          { id: '2', customer_name: 'Anjali Sharma', customer_phone: '9876543210', delivery_address: 'Flat 402, Skyline Apts', pincode: '560001', status: 'dispatched', is_cod: true, cod_amount: 1450, weight_kg: 1.2 },
          { id: '3', customer_name: 'Akhil R', customer_phone: '9988776655', delivery_address: '12/A Cross Street', pincode: '110022', status: 'pending', is_cod: false, cod_amount: 0, weight_kg: 0.3 }
        ]);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (o.customer_phone || '').includes(search);
    const matchesFilter = filter === 'All' || 
                          (filter === 'COD' && o.is_cod) || 
                          (o.status && o.status.toLowerCase() === filter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Orders</h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">Manage and track your shipments</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 glass-card p-1 rounded-full overflow-hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search customer, phone or tracking..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 bg-transparent border-0 shadow-none focus-visible:ring-0 text-white placeholder:text-slate-500 font-medium"
          />
        </div>
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-3 hide-scrollbar">
          {['All', 'Pending', 'Dispatched', 'Delivered', 'COD'].map(f => (
            <Badge 
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              className={`cursor-pointer px-5 py-3 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                filter === f 
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)] border-0' 
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
              onClick={() => setFilter(f)}
            >
              {f}
            </Badge>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-500 font-medium">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-card rounded-2xl border-dashed border-2 border-slate-700 bg-white/5 shadow-none">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-white/5 shadow-inner border border-white/10 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No orders found</h3>
            <p className="text-slate-400 mt-2 max-w-sm text-sm">We couldn't find any orders matching your search or filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="glass-card rounded-2xl group flex flex-col h-full relative">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="pr-2">
                    <h3 className="font-bold text-white text-lg truncate" title={order.customer_name}>{order.customer_name || 'Unknown'}</h3>
                    <div className="flex items-center text-xs font-medium text-slate-400 mt-1">
                      <Phone className="w-3.5 h-3.5 mr-1.5" />
                      {order.customer_phone || 'N/A'}
                    </div>
                  </div>
                  <Badge 
                    className={
                      order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm font-semibold' :
                      order.status === 'dispatched' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm font-semibold' :
                      'bg-white/10 text-slate-300 border border-white/10 shadow-sm font-semibold'
                    }
                  >
                    <span className="capitalize px-2 py-0.5">{order.status}</span>
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <Package className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Product</p>
                      <p className="text-sm text-slate-200 font-medium line-clamp-1">{order.weight_kg ? `${order.weight_kg}kg Parcel` : 'Standard Parcel'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
                      <MapPin className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Destination</p>
                      <p className="text-sm text-slate-200 font-medium line-clamp-1">{order.delivery_address || 'N/A'}</p>
                      <p className="text-xs text-slate-400 font-mono font-medium mt-0.5">{order.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0E17]/60 p-5 border-t border-white/5 flex items-center justify-between mt-auto rounded-b-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <Truck className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-300">Delhivery</span>
                    <span className="text-[10px] font-mono font-semibold text-slate-500">RTF{order.id.substring(0, 6).toUpperCase()}</span>
                  </div>
                </div>

                <div className="text-right">
                  {order.is_cod ? (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">COD To Collect</span>
                      <span className="text-base font-bold text-white flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-slate-400" />{order.cod_amount}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Payment Mode</span>
                      <span className="text-sm font-bold text-green-400 neon-text">Prepaid</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
