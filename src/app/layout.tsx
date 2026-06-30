import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

import { AnimatedRays } from "@/components/ui/animated-rays";

export const metadata: Metadata = {
  title: "Routefy",
  description: "Next-gen logistics platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans antialiased bg-[#14152e] text-slate-100">
        <AnimatedRays>
          {children}
        </AnimatedRays>
      </body>
    </html>
  );
}
