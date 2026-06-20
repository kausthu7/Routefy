'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Store, Plus, Trash2, Package } from 'lucide-react';

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md mb-4">
          <Package className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to Routefy!</h1>
        <p className="text-slate-500 text-center mt-2 max-w-md">
          Before you start booking deliveries, we need to know where our delivery partners should pick up your packages and what you ship.
        </p>
      </div>

      <Card className="w-full max-w-lg shadow-xl border-slate-200">
        <CardHeader className="bg-white rounded-t-xl border-b border-slate-100">
          <CardTitle className="text-xl flex items-center text-slate-800">
            <Store className="w-5 h-5 mr-2 text-primary" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white rounded-b-xl">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="shop_name">Store / Business Name</Label>
              <Input
                id="shop_name"
                placeholder="e.g. Trendy Threads"
                required
                value={onboardingForm.shop_name}
                onChange={e => setOnboardingForm({...onboardingForm, shop_name: e.target.value})}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup_address">Default Pickup Address</Label>
              <Input
                id="pickup_address"
                placeholder="e.g. Shop 12, Main Street Market, Bangalore"
                required
                value={onboardingForm.pickup_address}
                onChange={e => setOnboardingForm({...onboardingForm, pickup_address: e.target.value})}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup_pincode">Pickup Pincode</Label>
              <Input
                id="pickup_pincode"
                placeholder="e.g. 560001"
                required
                value={onboardingForm.pickup_pincode}
                onChange={e => setOnboardingForm({...onboardingForm, pickup_pincode: e.target.value})}
                className="bg-slate-50"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base text-slate-800">Products Catalog</Label>
              </div>
              
              <div className="space-y-3">
                {onboardingForm.products.map((product, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1 space-y-1.5">
                      <Input
                        placeholder="Product Name"
                        required
                        value={product.name}
                        onChange={e => manageProduct('update', index, 'name', e.target.value)}
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="w-24 space-y-1.5">
                      <Input
                        placeholder="Wt (kg)"
                        required
                        type="number"
                        step="0.1"
                        value={product.weight}
                        onChange={e => manageProduct('update', index, 'weight', e.target.value)}
                        className="bg-slate-50"
                      />
                    </div>
                    {onboardingForm.products.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => manageProduct('remove', index)}
                        className="border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => manageProduct('add')}
                className="mt-3 border-dashed border-slate-300 text-primary hover:text-primary hover:bg-primary/5 w-full bg-slate-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Product
              </Button>
            </div>

            <Button 
              type="submit" 
              disabled={savingProfile}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl mt-6 shadow-md"
            >
              {savingProfile ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
