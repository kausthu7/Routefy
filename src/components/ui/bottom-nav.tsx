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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-between px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-1"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 ${
                  isActive ? "bg-purple-100" : ""
                }`}
              >
                <Icon
                  className={isActive ? "h-[18px] w-[18px] text-purple-600" : "h-[18px] w-[18px] text-neutral-400"}
                  strokeWidth={2}
                />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-purple-600" : "text-neutral-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
