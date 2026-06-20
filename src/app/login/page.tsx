'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Phone } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [mockOtpDisplay, setMockOtpDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setMockOtpDisplay(data.otp);
        setStep('OTP');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name }),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Dynamic Animated Gradient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-1000" />
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-600/20 blur-[100px] rounded-full mix-blend-screen" />

      {/* Glassmorphic Card */}
      <Card className="w-full max-w-md relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 shadow-2xl overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400 text-base">
            {step === 'PHONE' ? 'Enter your phone number to access the dashboard' : 'Enter the secure OTP sent to your device'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-10">
          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Your Name / Business Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Trendy Threads"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 bg-slate-950/50 border-slate-800/80 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="phone"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="pl-10 h-12 bg-slate-950/50 border-slate-800/80 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all rounded-xl font-medium text-lg group" 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Continue'}
                {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* Premium Notification style Mock OTP */}
              <div className="p-5 mb-6 bg-slate-800/40 border border-slate-700/50 rounded-xl backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <p className="text-xs font-medium tracking-widest text-indigo-400 uppercase mb-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse" />
                  Mock SMS Received
                </p>
                <div className="flex items-baseline justify-between">
                  <p className="text-slate-300 text-sm">Your login code is:</p>
                  <p className="text-3xl font-mono tracking-widest text-white font-bold">{mockOtpDisplay}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-300">Enter Security Code</Label>
                <Input
                  id="otp"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="h-14 bg-slate-950/50 border-slate-800/80 text-white text-center tracking-[0.5em] text-2xl font-mono focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all rounded-xl font-medium text-lg" 
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Secure Login'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
