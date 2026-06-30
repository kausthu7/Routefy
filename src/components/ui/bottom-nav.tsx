"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Sparkles, LayoutGrid, Wallet } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/ai-order", label: "AI", icon: Sparkles },
  { href: "/dashboard/products", label: "Products", icon: LayoutGrid },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between px-6 py-3 relative z-10 bg-[#30337A]/80 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isCenter = item.href === "/dashboard/ai-order";

          if (isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -translate-y-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent shadow-lg shadow-brand-accent/20 transition-transform active:scale-95">
                  <span className="text-3xl font-light text-brand-dark mb-1">+</span>
                </div>
              </Link>
            );
          }

          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 p-2"
            >
              <Icon
                className={isActive ? "h-6 w-6 text-white" : "h-6 w-6 text-white/50"}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
