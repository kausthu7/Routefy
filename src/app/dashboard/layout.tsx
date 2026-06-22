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
    { name: 'Simulator', href: '/dashboard/simulator', icon: MessageSquare },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen text-slate-200 flex flex-col md:flex-row font-sans bg-transparent relative p-4 md:p-6 gap-6">

      {/* Minimal Premium Dark Background */}
      <div className="fixed inset-0 z-[-10] bg-[#09090b] overflow-hidden">
        {/* Subtle top-left glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full mix-blend-screen" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 spatial-panel rounded-3xl sticky top-4 z-40">
        <RoutefyLogo iconSize="w-8 h-8" textSize="text-2xl" />
        <div className="flex items-center gap-2 font-medium text-slate-300">
          <Wallet className="w-4 h-4 text-blue-400" />
          ₹1,422
        </div>
      </header>

      {/* Desktop Floating Sidebar */}
      <aside className="hidden md:flex w-72 flex-col spatial-panel rounded-3xl sticky top-6 h-[calc(100vh-48px)] overflow-y-auto shrink-0 z-40">
        <div className="p-8 flex items-center justify-center border-b border-white/5">
           <RoutefyLogo />
        </div>

        <div className="p-6 flex-1">
          <div className="text-[11px] font-semibold text-slate-500 tracking-[0.2em] mb-4 uppercase ml-2">Main Menu</div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all ${isActive
                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-white/5 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-3.5 w-full text-left rounded-2xl text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0 min-h-[calc(100vh-48px)] relative flex flex-col gap-6">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 sticky top-6 z-30 spatial-panel rounded-3xl h-20">
          <div className="flex items-center gap-3 text-slate-400 w-96 bg-black/20 px-5 py-3 rounded-2xl border border-white/5 focus-within:border-white/20 focus-within:bg-black/40 transition-all shadow-inner">
            <span className="text-slate-400 text-sm">🔍</span>
            <input type="text" placeholder="Search orders, tracking..." className="bg-transparent border-0 focus:ring-0 text-sm w-full text-slate-200 placeholder:text-slate-500 outline-none" />
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-2xl spatial-button flex items-center justify-center text-slate-300 relative group">
              🔔
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 group-hover:scale-110 transition-transform"></span>
            </button>
            <div className="flex items-center gap-4 spatial-button py-2 px-3 rounded-2xl cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
                <span className="text-white text-xs font-bold tracking-wider">RM</span>
              </div>
              <div className="flex flex-col pr-2">
                <span className="text-sm font-semibold text-white leading-none mb-1">Routefy Merchant</span>
                <span className="text-[10px] text-slate-400 leading-none uppercase tracking-wider">Pro Plan</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 spatial-panel rounded-3xl overflow-hidden relative">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 spatial-panel rounded-3xl flex items-center justify-around z-50 p-2">
        {navItems.filter(i => ['Overview', 'Orders', 'Wallet', 'Settings'].includes(i.name)).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl gap-1.5 transition-all ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-wide">{item.name === 'Simulator' ? 'AI' : item.name}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
