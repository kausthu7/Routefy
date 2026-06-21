'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Store, Plus, Trash2, Package, MapPin, Hash, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  
  const [onboardingForm, setOnboardingForm] = useState({ 
    shop_name: '', 
    pickup_address: '', 
    pickup_pincode: '',
    products: [{ name: '', weight: '' }]
  });

  useEffect(() => {
    // Check if already onboarded
    const checkProfile = async () => {
      try {
        const res = await fetch('/api/merchant/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.pickup_address) {
            router.push('/dashboard'); // Already onboarded
          } else {
            setLoading(false); // Needs onboarding
          }
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    checkProfile();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/merchant/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...onboardingForm, default_product: JSON.stringify(onboardingForm.products)})
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert("Failed to save profile");
        setSavingProfile(false);
      }
    } catch (error) {
      console.error(error);
      setSavingProfile(false);
    }
  };

  const manageProduct = (action: 'add' | 'remove' | 'update', index?: number, field?: 'name'|'weight', value?: string) => {
    const newProducts = [...onboardingForm.products];
    if (action === 'add') {
      newProducts.push({ name: '', weight: '' });
    } else if (action === 'remove' && index !== undefined) {
      newProducts.splice(index, 1);
    } else if (action === 'update' && index !== undefined && field && value !== undefined) {
      newProducts[index][field] = value;
    }
    setOnboardingForm({ ...onboardingForm, products: newProducts });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-950 py-12 px-4">
      {/* Dynamic Animated Gradient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-1000" />
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[50%] h-[50%] bg-emerald-600/10 blur-[100px] rounded-full mix-blend-screen" />

      <div className="w-full max-w-2xl mb-8 flex flex-col items-center relative z-10">
        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] mb-6 border border-indigo-500/20">
          <Package className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-3 text-center">Welcome to Routefy.</h1>
        <p className="text-slate-400 text-center max-w-md text-lg">
          Let's setup your logistics engine. Tell us where to pick up your orders and what you're shipping.
        </p>
      </div>

      {/* Glassmorphic Card */}
      <Card className="w-full max-w-2xl relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 shadow-2xl overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        <CardHeader className="border-b border-slate-800/50 bg-slate-900/40 pb-6 pt-8 px-8">
          <CardTitle className="text-2xl flex items-center text-white">
            <Store className="w-6 h-6 mr-3 text-indigo-400" />
            Business Configuration
          </CardTitle>
          <CardDescription className="text-slate-400 mt-2">
            This information is shared with courier partners (Delhivery, XpressBees) to automatically generate pickup schedules.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSaveProfile} className="space-y-8">
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="shop_name" className="text-slate-300 font-medium text-sm flex items-center">
                  Store / Business Name
                </Label>
                <div className="relative group">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="shop_name"
                    placeholder="e.g. Trendy Threads"
                    required
                    value={onboardingForm.shop_name}
                    onChange={e => setOnboardingForm({...onboardingForm, shop_name: e.target.value})}
                    className="pl-12 h-14 bg-slate-950/50 border-slate-800/80 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl text-base"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="pickup_address" className="text-slate-300 font-medium text-sm">Default Pickup Address</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      id="pickup_address"
                      placeholder="e.g. Shop 12, Main Street"
                      required
                      value={onboardingForm.pickup_address}
                      onChange={e => setOnboardingForm({...onboardingForm, pickup_address: e.target.value})}
                      className="pl-12 h-14 bg-slate-950/50 border-slate-800/80 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl text-base"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="pickup_pincode" className="text-slate-300 font-medium text-sm">Pickup Pincode</Label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      id="pickup_pincode"
                      placeholder="e.g. 560001"
                      required
                      maxLength={6}
                      value={onboardingForm.pickup_pincode}
                      onChange={e => setOnboardingForm({...onboardingForm, pickup_pincode: e.target.value})}
                      className="pl-12 h-14 bg-slate-950/50 border-slate-800/80 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800/50">
              <div className="mb-6">
                <Label className="text-lg font-semibold text-white">Default Product Catalog</Label>
                <p className="text-sm text-slate-400 mt-1">If the WhatsApp bot cannot determine what the customer ordered, it will default to these weights for shipping calculation.</p>
              </div>
              
              <div className="space-y-4">
                {onboardingForm.products.map((product, index) => (
                  <div key={index} className="flex gap-4 items-start group">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Product Type (e.g. T-Shirt, Sneaker)"
                        required
                        value={product.name}
                        onChange={e => manageProduct('update', index, 'name', e.target.value)}
                        className="h-12 bg-slate-950/50 border-slate-800/80 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl"
                      />
                    </div>
                    <div className="w-32 space-y-2 relative">
                      <Input
                        placeholder="0.5"
                        required
                        type="number"
                        step="0.1"
                        value={product.weight}
                        onChange={e => manageProduct('update', index, 'weight', e.target.value)}
                        className="h-12 bg-slate-950/50 border-slate-800/80 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl pr-8"
                      />
                      <span className="absolute right-3 top-[1.1rem] text-sm text-slate-500 pointer-events-none">kg</span>
                    </div>
                    {onboardingForm.products.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => manageProduct('remove', index)}
                        className="h-12 w-12 text-slate-500 hover:text-red-400 hover:bg-red-500/10 shrink-0 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => manageProduct('add')}
                className="mt-6 border-dashed border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 w-full bg-transparent h-12 rounded-xl transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Another Product Configuration
              </Button>
            </div>

            <Button 
              type="submit" 
              disabled={savingProfile}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all rounded-xl font-medium text-lg mt-8 group"
            >
              {savingProfile ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Complete Routefy Setup
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
