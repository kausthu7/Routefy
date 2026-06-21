'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Phone, Mail, MapPin, MessageCircle, Link as LinkIcon, Loader2, Bot } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>({ shop_name: '', pickup_address: '', pickup_pincode: '', phone_number: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      const res = await fetch('/api/merchant/profile', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.warn("Using mock profile due to DB timeout");
      setProfile({
        shop_name: 'Routefy Demo Store',
        pickup_address: 'Bangalore',
        pickup_pincode: '560001',
        phone_number: '+91 9876543210' // The merchant's own registered Caller ID
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/merchant/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Settings</h1>
        <p className="text-slate-400 mt-1 text-sm font-medium">Manage your business profile and integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar for settings (desktop) */}
        <div className="hidden md:flex flex-col space-y-2">
          <button className="flex items-center w-full px-4 py-3 rounded-xl bg-blue-500/10 text-blue-400 font-semibold shadow-[inset_2px_0_0_0_#3b82f6] transition-all">
            <Store className="w-4 h-4 mr-3" /> Business Profile
          </button>
          <button className="flex items-center w-full px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
            <MapPin className="w-4 h-4 mr-3" /> Pickup Locations
          </button>
          <button className="flex items-center w-full px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
            <MessageCircle className="w-4 h-4 mr-3" /> WhatsApp Setup
          </button>
          <button className="flex items-center w-full px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
            <LinkIcon className="w-4 h-4 mr-3" /> API & Integrations
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          <form onSubmit={handleSave}>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="border-b border-white/5 bg-white/5 p-6">
                <h2 className="text-xl font-bold text-white">Business Details</h2>
                <p className="text-sm text-slate-400 mt-1">This information will be displayed on shipping labels.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Business Name</Label>
                  <Input 
                    value={profile.shop_name || ''} 
                    onChange={e => setProfile({...profile, shop_name: e.target.value})}
                    className="bg-black/20 border-white/10 text-white focus-visible:ring-blue-500/50" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center justify-between">
                      <span>Phone (Your Caller ID)</span>
                      <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full">Used for Bot Auth</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        value={profile.phone_number || ''} 
                        onChange={e => setProfile({...profile, phone_number: e.target.value})}
                        className="pl-10 bg-black/20 border-white/10 text-white focus-visible:ring-blue-500/50" 
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Email (Optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input placeholder="hello@trendythreads.com" className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <h3 className="font-semibold text-white mb-4">Default Pickup Location</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Full Address</Label>
                      <Input 
                        value={profile.pickup_address || ''} 
                        onChange={e => setProfile({...profile, pickup_address: e.target.value})}
                        className="bg-black/20 border-white/10 text-white focus-visible:ring-blue-500/50" 
                      />
                    </div>
                    <div className="space-y-2 md:w-1/2">
                      <Label className="text-slate-300">Pincode</Label>
                      <Input 
                        value={profile.pickup_pincode || ''} 
                        onChange={e => setProfile({...profile, pickup_pincode: e.target.value})}
                        className="bg-black/20 border-white/10 text-white focus-visible:ring-blue-500/50" 
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center"
                >
                  {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>

          {/* Integrations - Centralized Bot Instructions */}
          <div className="glass-card rounded-2xl overflow-hidden mt-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="border-b border-white/5 bg-white/5 p-6 relative z-10">
              <h2 className="text-xl font-bold text-white flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-green-400" />
                WhatsApp Bot Integration
              </h2>
              <p className="text-sm text-slate-400 mt-1">Connect your orders directly via WhatsApp.</p>
            </div>
            
            <div className="p-6 relative z-10">
              <div className="flex flex-col gap-6 items-start bg-black/40 border border-white/5 p-6 rounded-2xl">
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">How it works</h3>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                    You do not need to scan any QR codes or set up APIs. Routefy provides a centralized AI bot that handles all your orders instantly.
                  </p>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mt-4 flex items-start gap-4">
                    <Bot className="w-8 h-8 text-blue-400 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white text-lg">Message the Routefy Bot</h4>
                      <p className="text-slate-400 text-sm mt-1">
                        Send screenshots, text, or voice notes to our central bot. Because you saved your phone number above, the bot automatically recognizes you as the sender and applies your catalog and pickup address!
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="font-mono bg-black/50 border border-white/10 px-4 py-2 rounded-lg text-green-400 font-bold text-lg tracking-wider">
                          +1 (555) ROUTEFY
                        </span>
                        <a href="https://wa.me/15550000000" target="_blank" rel="noreferrer" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg">
                          Message Now
                        </a>
                      </div>
                    </div>
                  </div>
                  
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
