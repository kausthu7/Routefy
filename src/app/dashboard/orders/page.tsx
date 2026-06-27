'use client';

import { useEffect, useState } from 'react';
// Removed supabase import
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Package, MapPin, Phone, IndianRupee, Truck, Store, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      const orderRes = await fetch('/api/merchant/orders');
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const deleteOrder = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/merchant/orders?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete order");
      }
    } catch (e) {
      console.error("Error deleting order:", e);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (o.customer_phone || '').includes(search);
    const matchesFilter = filter === 'All' || 
                          (filter === 'COD' && o.is_cod) || 
                          (o.status && o.status.toLowerCase() === filter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-[32px] max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10 pb-32">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-slate-900 drop-shadow-sm">Orders</h1>
          <p className="text-purple-100 md:text-slate-500 mt-1 text-sm font-medium">Manage and track your shipments</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 bg-white border border-slate-200 shadow-sm p-1 rounded-full overflow-hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search customer, phone or tracking..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 bg-transparent border-0 shadow-none focus-visible:ring-0 text-slate-800 placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-3 hide-scrollbar">
          {['All', 'Pending', 'Dispatched', 'Delivered', 'COD'].map(f => (
            <Badge 
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              className={`cursor-pointer px-5 py-3 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                filter === f 
                  ? 'bg-purple-600 text-white shadow-sm border-0' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
        <div className="bg-slate-50 rounded-[24px] border-dashed border-2 border-slate-200 shadow-none w-full h-[320px] flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No orders found</h3>
            <p className="text-slate-500 mt-2 max-w-sm text-sm">We couldn't find any orders matching your search or filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white shadow-sm border border-slate-100 rounded-3xl group flex flex-col h-full relative">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="pr-2">
                    <h3 className="font-bold text-slate-900 text-lg truncate" title={order.customer_name}>{order.customer_name || 'Unknown'}</h3>
                    <div className="flex items-center text-xs font-medium text-slate-500 mt-1">
                      <Phone className="w-3.5 h-3.5 mr-1.5" />
                      {order.customer_phone || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm font-semibold' :
                        order.status === 'dispatched' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm font-semibold' :
                        'bg-slate-100 text-slate-600 border border-slate-200 shadow-sm font-semibold'
                      }
                    >
                      <span className="capitalize px-2 py-0.5">{order.status}</span>
                    </Badge>
                    {['pending', 'draft', 'failed', 'unsuccessful'].includes(order.status) && (
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-100"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                      <Package className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Product</p>
                      <p className="text-sm text-slate-700 font-medium line-clamp-1">{order.weight_kg ? `${order.weight_kg}kg Parcel` : 'Standard Parcel'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                      <Store className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Origin</p>
                      <p className="text-sm text-slate-700 font-medium line-clamp-1">{order.pickup_address || 'N/A'}</p>
                      <p className="text-xs text-slate-500 font-mono font-medium mt-0.5">{order.pickup_pincode}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                      <MapPin className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Destination</p>
                      <p className="text-sm text-slate-700 font-medium line-clamp-1">{order.delivery_address || 'N/A'}</p>
                      <p className="text-xs text-slate-500 font-mono font-medium mt-0.5">{order.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 border-t border-slate-100 flex items-center justify-between mt-auto rounded-b-3xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <Truck className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-600">Delhivery</span>
                    <span className="text-[10px] font-mono font-semibold text-slate-400">RTF{order.id.toString().substring(0, 6).toUpperCase()}</span>
                  </div>
                </div>

                <div className="text-right">
                  {order.is_cod ? (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">COD To Collect</span>
                      <span className="text-base font-bold text-slate-900 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-slate-500" />{order.cod_amount}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Payment Mode</span>
                      <span className="text-sm font-bold text-green-600">Prepaid</span>
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
