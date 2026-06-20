'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, IndianRupee, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export default function WalletPage() {
  
  const transactions = [
    { id: 1, date: 'Today, 10:42 AM', type: 'Shipment Deduction', ref: 'RTF83921', amount: -78, status: 'success' },
    { id: 2, date: 'Today, 09:15 AM', type: 'Shipment Deduction', ref: 'RTF83920', amount: -112, status: 'success' },
    { id: 3, date: 'Yesterday, 04:30 PM', type: 'Wallet Topup', ref: 'UPI/123456789', amount: 1000, status: 'success' },
    { id: 4, date: '16 Jun, 11:20 AM', type: 'Shipment Deduction', ref: 'RTF83850', amount: -65, status: 'success' },
    { id: 5, date: '15 Jun, 02:10 PM', type: 'Wallet Topup', ref: 'UPI/987654321', amount: 2000, status: 'success' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Wallet</h1>
        <p className="text-slate-400 mt-1 text-sm font-medium">Manage your prepaid shipping balance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Balance Card */}
        <div className="md:col-span-2 glass-card rounded-2xl overflow-hidden relative border border-blue-500/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none z-0" />
          <div className="p-8 relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-400" />
                </div>
                <span className="font-bold text-white tracking-wide text-lg">Routefy Prepaid</span>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm font-bold">Active</Badge>
            </div>
            
            <div>
              <p className="text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Current Balance</p>
              <div className="text-5xl font-extrabold tracking-tight text-white flex items-center">
                <IndianRupee className="w-10 h-10 mr-1 text-slate-300" />
                1,422.00
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Funds */}
        <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-center">
          <h3 className="font-bold text-white mb-6">Quick Topup</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {['₹500', '₹1000', '₹2000', '₹5000'].map(amt => (
              <button key={amt} className="border border-white/10 bg-white/5 text-slate-300 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white h-12 rounded-xl font-bold transition-all">
                {amt}
              </button>
            ))}
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center">
            <Plus className="w-5 h-5 mr-2" /> Custom Amount
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 mt-4 drop-shadow-sm">Transaction History</h2>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5 border-b border-white/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-slate-400 h-14 pl-6">Transaction Details</TableHead>
                  <TableHead className="font-bold text-slate-400 h-14">Reference</TableHead>
                  <TableHead className="font-bold text-slate-400 h-14 text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-white/5 border-b border-white/5 transition-colors">
                    <TableCell className="py-5 pl-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          tx.amount > 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-slate-400 border-white/10'
                        }`}>
                          {tx.amount > 0 ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{tx.type}</p>
                          <p className="text-xs font-medium text-slate-400 mt-1">{tx.date}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">{tx.ref}</span>
                    </TableCell>
                    <TableCell className="text-right py-5 pr-6">
                      <div className="flex flex-col items-end">
                        <span className={`font-extrabold text-lg ${tx.amount > 0 ? 'text-green-400 neon-text' : 'text-white'}`}>
                          {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                        </span>
                        <div className="flex items-center text-xs font-bold text-slate-500 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-500" />
                          Success
                        </div>
                      </div>
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
