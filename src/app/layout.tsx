import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

import { Inter } from "next/font/google";

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: 'swap',
});

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
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
