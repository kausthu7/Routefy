'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, User, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, isSignup: false }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 my-12">
      <Card className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 shadow-2xl overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400 text-base">
            {step === 1 ? 'Log in to your Routefy dashboard' : 'Enter the code sent to your email'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-10">
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg text-center font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-slate-950/50 border-slate-800/80 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all rounded-xl font-medium text-lg mt-2 group" 
                disabled={loading}
              >
                {loading ? 'Sending Code...' : 'Send Login Code'}
                {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </Button>

              <div className="text-center mt-6">
                <p className="text-slate-400 text-sm">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Sign up here
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg text-center font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-300">6-Digit Code</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="pl-10 h-12 bg-slate-950/50 border-slate-800/80 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl tracking-[0.5em] font-mono text-lg text-center"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all rounded-xl font-medium text-lg mt-2" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Log In'}
              </Button>

              <div className="text-center mt-6">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Change Email Address
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
