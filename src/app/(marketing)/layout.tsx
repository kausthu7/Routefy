import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const RoutefyLogo = ({ className = "", iconSize = "w-40 h-auto" }: { className?: string, iconSize?: string, textSize?: string, textWeight?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <img src="/logo.png" alt="Routefy Logo" className={`${iconSize} object-contain`} />
  </div>
);

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-slate-200 flex flex-col font-sans relative bg-slate-950 overflow-hidden">
      
      {/* Premium Animated Background shared across Landing and Login */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-1000" />
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full mix-blend-screen" />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 max-w-[1400px] mx-auto w-full">
        <Link href="/" className="hover:scale-105 transition-transform">
          <RoutefyLogo />
        </Link>
        <nav className="hidden lg:flex items-center gap-8 text-[14px] font-[400] text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#integrations" className="hover:text-white transition-colors">Integrations</Link>
          <button className="flex items-center hover:text-white transition-colors">
            Resources <span className="ml-1 text-[10px]">▼</span>
          </button>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:flex text-[14px] font-[400] text-white hover:text-slate-300 px-4 py-2 border border-white/10 rounded-full bg-white/5 hover:bg-white/10 transition-all">
            Log in
          </Link>
          <Link href="/login" className="bg-[#6D4AFF] hover:bg-[#5B3DF5] text-white text-[14px] font-[600] py-2.5 px-6 rounded-lg transition-all flex items-center shadow-[0_0_20px_rgba(109,74,255,0.4)]">
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-medium">
          <p>© 2026 Routefy Logistics. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
