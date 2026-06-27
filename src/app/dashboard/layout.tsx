'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Package, LayoutDashboard, Wallet, Settings, MessageSquare, Menu, LogOut, ChevronRight, Boxes } from 'lucide-react';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/search-bar';
import { BottomNav } from '@/components/ui/bottom-nav';
import { useState, useRef, useEffect } from 'react';

const RoutefyLogo = ({ className = "", iconSize = "w-48 h-auto" }: { className?: string, iconSize?: string, textSize?: string, textWeight?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <img src="/logo.png" alt="Routefy Logo" className={`${iconSize} object-contain`} />
  </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Smart Book', href: '/dashboard/ai-order', icon: MessageSquare },
    { name: 'Orders', href: '/dashboard/orders', icon: Package },
    { name: 'Products', href: '/dashboard/products', icon: Boxes },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const [showNotifications, setShowNotifications] = useState(false);
  const [shopName, setShopName] = useState("Routefy Merchant");
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    fetch('/api/merchant/profile')
      .then(res => res.json())
      .then(data => {
        if (data && data.shop_name) {
          setShopName(data.shop_name);
        }
      })
      .catch(err => console.error("Failed to fetch merchant profile:", err));

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col md:flex-row font-sans bg-[#F4F6F9] relative md:p-6 gap-[16px] md:gap-6">

      {/* Mobile Purple Header Background */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-[260px] bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-b-[40px] z-0 shadow-[0_10px_30px_rgba(124,58,237,0.3)]">
        <div className="absolute inset-0 bg-white/5 blur-2xl rounded-b-[40px]" />
      </div>

      {/* Deep Midnight Background for Desktop (keep dark sidebar for contrast or change to light? Let's make it fully light) */}
      <div className="hidden md:block fixed inset-0 z-[-10] bg-[#F4F7FF] overflow-hidden"></div>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between z-40 relative px-6 pt-[56px] pb-4">
        <RoutefyLogo iconSize="h-14 w-auto" />
        <div className="flex items-center gap-[12px]">
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="w-[40px] h-[40px] rounded-[12px] bg-white/10 backdrop-blur-md flex items-center justify-center text-white relative border border-white/20 hover:scale-[1.02] transition-all">
              🔔
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#5B21B6]"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-[50px] w-[280px] bg-white rounded-[20px] p-4 shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-900 font-bold text-sm">Notifications</h3>
                  <button className="text-xs text-purple-600 hover:text-purple-700">Mark all read</button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">📦</div>
                    <div>
                      <p className="text-sm text-slate-800 font-medium">Order #1024 Delivered</p>
                      <p className="text-xs text-slate-500">2 mins ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div onClick={() => router.push('/dashboard/settings')} className="w-[40px] h-[40px] rounded-[12px] bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/30 transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      {/* Desktop Dark Sidebar */}
      <aside className="hidden md:flex w-[240px] flex-col bg-slate-900 rounded-3xl sticky top-6 h-[calc(100vh-48px)] overflow-y-auto shrink-0 z-40 shadow-xl border border-slate-800">
        <div className="p-8 flex items-center justify-center border-b border-slate-800">
          <RoutefyLogo iconSize="w-24 h-auto" />
        </div>

        <div className="p-6 flex-1">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-4 ml-2">Main Menu</div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all ${isActive
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-3.5 w-full text-left rounded-2xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0 min-h-[calc(100vh-48px)] relative flex flex-col gap-6 z-10 px-4 md:px-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 sticky top-6 z-30 bg-white/80 backdrop-blur-md rounded-3xl h-[72px] shadow-sm border border-slate-100">
          <div className="flex-1 max-w-[400px]">
            <SearchBar />
          </div>
          <div className="flex items-center gap-4 relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 relative group transition-colors">
              🔔
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
            </button>
            <div onClick={() => router.push('/dashboard/settings')} className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100 py-2 px-3 rounded-2xl cursor-pointer transition-colors border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                <Settings className="w-5 h-5" />
              </div>
              <div className="flex flex-col pr-2">
                <span className="text-sm font-semibold text-slate-800 leading-none mb-1">{shopName}</span>
                <span className="text-[10px] text-slate-500 leading-none uppercase tracking-wider">Pro Plan</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 rounded-3xl overflow-hidden relative">
          {children}
        </div>
      </main>

      <BottomNav />


    </div>
  );
}
