'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, IndianRupee, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

import { useEffect, useState } from 'react';

export default function WalletPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isToppingUp, setIsToppingUp] = useState(false);

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/merchant/wallet');
      if (res.ok) {
        const data = await res.json();
        
        const formattedTxs = (data.transactions || []).map((tx: any) => {
          const d = new Date(tx.created_at);
          const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
          return {
            id: tx.id,
            date: dateStr,
            type: tx.type,
            ref: tx.reference_id || `RTF${tx.id}`,
            amount: parseFloat(tx.amount),
            status: 'success'
          };
        });

        setTransactions(formattedTxs);
        setBalance(parseFloat(data.balance) || 0);
      }
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleTopup = async (amount: number) => {
    if (isToppingUp) return;
    setIsToppingUp(true);
    
    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsToppingUp(false);
        return;
      }

      // Create order
      const result = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      
      const order = await result.json();

      if (!result.ok) {
        alert(order.error || 'Failed to create order');
        setIsToppingUp(false);
        return;
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Routefy',
        description: 'Wallet Topup',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              await fetchWallet();
            } else {
              alert(verifyData.error || 'Payment verification failed');
            }
          } catch (e) {
            console.error(e);
            alert('Payment verification failed');
          }
        },
        theme: {
          color: '#3b82f6'
        }
      };
      
      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        alert(response.error.description);
      });
      
      paymentObject.open();
    } catch (error) {
      console.error('Topup failed:', error);
    }
    
    setIsToppingUp(false);
  };

  return (
    <div className="p-4 sm:p-[32px] max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10 pb-32">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-slate-900 drop-shadow-sm">Wallet</h1>
        <p className="text-purple-100 md:text-slate-500 mt-1 text-sm font-medium">Manage your prepaid shipping balance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Balance Card (Credit Card Style) */}
        <div className="md:col-span-2 bg-[#2F3273] rounded-[24px] overflow-hidden relative border border-[#4D50A2] group shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4D50A2] via-transparent to-[#2F3273] pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-110 z-0" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-main/40 rounded-full blur-[80px] -ml-20 -mb-20 transition-transform duration-700 group-hover:scale-110 z-0" />
          
          <div className="p-8 relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-white tracking-widest uppercase text-sm opacity-90">Routefy Prepaid</span>
              </div>
              <Badge className="bg-[#4D50A2]/50 text-white border border-[#4D50A2] shadow-sm font-bold uppercase tracking-wider text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">Active</Badge>
            </div>
            
            <div>
              <p className="text-[#F9DF77] text-xs font-bold tracking-[0.2em] uppercase mb-3">Available Balance</p>
              <div className="text-5xl md:text-6xl font-extrabold tracking-tight text-white flex items-center drop-shadow-xl">
                <IndianRupee className="w-10 h-10 md:w-12 md:h-12 mr-2 text-white/80" />
                {loading ? '...' : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(balance)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Funds */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-[24px] p-6 md:p-8 h-full flex flex-col justify-center">
          <h3 className="font-bold mb-6 uppercase tracking-wider text-sm text-center text-slate-500">Quick Topup</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[500, 1000, 2000, 5000].map(amt => (
              <button 
                key={amt} 
                onClick={() => handleTopup(amt)}
                disabled={isToppingUp}
                className="bg-slate-50 border border-slate-200 h-14 rounded-[16px] font-bold text-slate-700 hover:text-brand-main hover:bg-brand-main/5 transition-all disabled:opacity-50 hover:border-brand-main/30 flex items-center justify-center text-lg"
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <button 
             onClick={() => handleTopup(10000)}
             disabled={isToppingUp}
             className="w-full bg-[#4D50A2] hover:bg-[#2F3273] text-white font-bold h-14 rounded-[16px] shadow-sm transition-all flex items-center justify-center disabled:opacity-50 mt-auto"
          >
            <Plus className="w-5 h-5 mr-2 text-[#F9DF77]" /> Custom Amount
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 drop-shadow-sm uppercase tracking-wide text-sm">Transaction Ledger</h2>
        <div className="bg-white rounded-[24px] overflow-hidden h-[400px] flex flex-col border border-slate-100 shadow-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-500 font-medium">
              <div className="w-8 h-8 border-2 border-brand-main border-t-transparent rounded-full animate-spin mb-4" />
              Loading ledger...
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-100 sticky top-0 z-20">
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="font-bold text-slate-500 h-14 pl-8 uppercase text-xs tracking-wider">Transaction Details</TableHead>
                    <TableHead className="font-bold text-slate-500 h-14 uppercase text-xs tracking-wider">Reference</TableHead>
                    <TableHead className="font-bold text-slate-500 h-14 text-right pr-8 uppercase text-xs tracking-wider">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors group">
                      <TableCell className="py-5 pl-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 ${
                            tx.amount > 0 ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {tx.amount > 0 ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 tracking-wide">{tx.type}</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">{tx.date}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">{tx.ref}</span>
                      </TableCell>
                      <TableCell className="text-right py-5 pr-8">
                        <div className="flex flex-col items-end">
                          <span className={`font-extrabold text-xl tracking-tight ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                            {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                          </span>
                          <div className="flex items-center text-xs font-bold text-slate-500 mt-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                            Success
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
