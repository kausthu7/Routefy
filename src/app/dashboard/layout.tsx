'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Package, LayoutDashboard, Wallet, Settings, MessageSquare, Menu, LogOut, ChevronRight, Boxes } from 'lucide-react';
import Link from 'next/link';

const RoutefyLogo = ({ className = "", iconSize = "w-10 h-10", textSize = "text-3xl" }: { className?: string, iconSize?: string, textSize?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <svg className={`${iconSize} -rotate-6 drop-shadow-[0_0_15px_rgba(0,210,255,0.4)]`} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cyanBlue" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="100%" stopColor="#005BEA" />
        </linearGradient>
        <linearGradient id="purpleMagenta" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8A2387" />
          <stop offset="50%" stopColor="#E94057" />
          <stop offset="100%" stopColor="#F27121" />
        </linearGradient>
        <linearGradient id="deepPurple" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A00E0" />
          <stop offset="100%" stopColor="#8E2DE2" />
        </linearGradient>
      </defs>
      <circle cx="58" cy="18" r="4.5" fill="#B157FF" />
      <circle cx="80" cy="15" r="4" fill="#D950F2" />
      <circle cx="72" cy="28" r="2.8" fill="#4BCCFF" />
      <path d="M15,60 C10,85 45,100 65,80 C80,65 85,45 75,35 C65,25 55,40 55,50 C55,65 35,80 25,65 Z" fill="url(#cyanBlue)" />
      <path d="M25,65 C5,45 15,20 40,15 C60,10 75,25 60,40 C50,50 35,35 30,45 C25,55 30,60 25,65 Z" fill="url(#deepPurple)" />
      <path d="M30,45 C40,30 65,30 60,45 C55,60 35,70 25,65 C15,60 20,55 30,45 Z" fill="#081A45" opacity="0.9"/>
      <path d="M35,25 C50,15 65,25 55,40 C45,55 35,45 35,25 Z" fill="url(#purpleMagenta)" opacity="0.8"/>
    </svg>
    <div className={`${textSize} font-medium tracking-wide text-white drop-shadow-md`} style={{ fontFamily: "'Playfair Display', serif", marginBottom: '4px' }}>Routefy.</div>
  </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/dashboard/orders', icon: Package },
    { name: 'Products', href: '/dashboard/products', icon: Boxes },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen text-slate-200 flex flex-col md:flex-row font-sans bg-transparent relative">

      {/* Motion Background Video */}
      <div className="fixed inset-0 z-[-10] bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        {/* Fallback dark overlay to ensure text remains readable */}
        <div className="absolute inset-0 bg-[#030712]/70" />
      </div>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 sidebar-glass border-b border-white/5 sticky top-0 z-40">
        <RoutefyLogo iconSize="w-8 h-8" textSize="text-2xl" />
        <div className="flex items-center gap-2 font-medium text-slate-300">
          <Wallet className="w-4 h-4 text-blue-500" />
          ₹1,422
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col sidebar-glass border-r border-white/5 sticky top-0 h-screen overflow-y-auto shrink-0 z-40 shadow-2xl">
        <div className="p-6 flex items-center justify-center">
           <RoutefyLogo />
        </div>

        <div className="px-6 pb-6">
          <div className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mb-4 uppercase">Main</div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                    ? 'bg-blue-500/10 text-white shadow-[inset_2px_0_0_0_#3b82f6]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <div className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mb-4 uppercase">Help</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full text-left rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5 text-slate-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto min-h-screen relative">
        {/* Topbar Search (Desktop) */}
        <header className="hidden md:flex items-center justify-between px-8 h-20 sticky top-0 z-30 sidebar-glass border-b border-white/5 border-r-0">
          <div className="flex items-center gap-3 text-slate-400 w-96 bg-white/5 px-4 py-2.5 rounded-full border border-white/5 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all shadow-inner">
            <span className="text-slate-500 text-sm">🔍</span>
            <input type="text" placeholder="Search..." className="bg-transparent border-0 focus:ring-0 text-sm w-full text-slate-200 placeholder:text-slate-500 outline-none" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 relative border border-white/5 shadow-sm">
              🔔
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0E17]"></span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 py-1.5 px-3 rounded-full border border-white/5 cursor-pointer hover:bg-white/10 transition-colors shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-400 p-[1px]">
                <div className="w-full h-full bg-[#0A0E17] rounded-full flex items-center justify-center text-xs font-bold">RM</div>
              </div>
              <div className="flex flex-col pr-2">
                <span className="text-xs font-bold text-white leading-none mb-1">Routefy Merchant</span>
                <span className="text-[10px] text-slate-400 leading-none">Administrator</span>
              </div>
              <span className="text-slate-500 text-xs">▼</span>
            </div>
          </div>
        </header>

        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 sidebar-glass border-t border-white/5 flex items-center justify-around z-50 px-2">
        {navItems.filter(i => ['Overview', 'Orders', 'Wallet', 'Settings'].includes(i.name)).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-blue-400' : 'text-slate-500'
                }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'fill-blue-500/20' : ''}`} />
              <span className="text-[10px] font-medium">{item.name === 'AI Inbox' ? 'AI' : item.name}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
