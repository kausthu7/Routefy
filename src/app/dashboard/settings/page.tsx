'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Phone, Mail, MapPin, MessageCircle, Link as LinkIcon, Loader2, Bot } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>({ shop_name: '', pickup_address: '', pickup_pincode: '', phone_number: '' });
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchProducts();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/merchant/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data || { shop_name: '', pickup_address: '', pickup_pincode: '', phone_number: '' });
      }
    } catch (e) {
      console.error("Failed to fetch profile from DB", e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/merchant/products');
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch('/api/merchant/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus({ type: 'success', message: 'Profile updated successfully!' });
      } else {
        setSaveStatus({ type: 'error', message: data.error || 'Failed to update profile.' });
      }
    } catch (error) {
      console.error(error);
      setSaveStatus({ type: 'error', message: 'An unexpected error occurred.' });
    }
    setSaving(false);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveStatus(current => current?.type === 'success' ? null : current);
    }, 3000);
  };

  const [newProduct, setNewProduct] = useState({ name: '', weight_kg: 1, length_cm: 10, breadth_cm: 10, height_cm: 10 });
  const [addingProduct, setAddingProduct] = useState(false);

  const [productStatus, setProductStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const addProduct = async () => {
    if (!newProduct.name) {
      setProductStatus({ type: 'error', message: 'Product name is required.' });
      return;
    }
    setAddingProduct(true);
    setProductStatus(null);
    try {
      const res = await fetch('/api/merchant/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setNewProduct({ name: '', weight_kg: 1, length_cm: 10, breadth_cm: 10, height_cm: 10 });
        fetchProducts();
        setProductStatus({ type: 'success', message: 'Product added successfully!' });
      } else {
        const data = await res.json();
        setProductStatus({ type: 'error', message: data.error || 'Failed to add product.' });
      }
    } catch (e) {
      setProductStatus({ type: 'error', message: 'An unexpected error occurred.' });
    }
    setAddingProduct(false);
    
    setTimeout(() => {
      setProductStatus(current => current?.type === 'success' ? null : current);
    }, 3000);
  };

  const deleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/merchant/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (e) {}
  };

  return (
    <div className="p-4 sm:p-[32px] max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10 pb-32">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-slate-900 drop-shadow-sm">Settings</h1>
        <p className="text-purple-100 md:text-slate-500 mt-1 text-sm font-medium">Manage your profile, locations, and integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar for settings (desktop) */}
        <div className="hidden md:flex flex-col space-y-2">
          <button className="flex items-center w-full px-4 py-3 rounded-xl bg-purple-50 text-purple-700 font-semibold shadow-[inset_2px_0_0_0_#9333ea] transition-all">
            <Store className="w-4 h-4 mr-3" /> Business Profile
          </button>
          <button className="flex items-center w-full px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <MapPin className="w-4 h-4 mr-3" /> Pickup Locations
          </button>
          <button className="flex items-center w-full px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <Bot className="w-4 h-4 mr-3" /> Telegram Setup
          </button>
          <button className="flex items-center w-full px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <LinkIcon className="w-4 h-4 mr-3" /> API & Integrations
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          <form onSubmit={handleSave}>
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 p-6">
                <h2 className="text-xl font-bold text-slate-900">Business Details</h2>
                <p className="text-sm text-slate-500 mt-1">This information will be displayed on shipping labels.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">Business Name *</Label>
                  <Input 
                    required
                    value={profile.shop_name || ''} 
                    onChange={e => setProfile({...profile, shop_name: e.target.value})}
                    className="bg-white border-slate-200 text-slate-900 focus-visible:ring-purple-500/50" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 flex items-center justify-between">
                      <span>Phone (Your Caller ID)</span>
                      <span className="text-xs text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded-full">Used for Bot Auth</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        value={profile.phone_number || ''} 
                        onChange={e => setProfile({...profile, phone_number: e.target.value})}
                        className="pl-10 bg-white border-slate-200 text-slate-900 focus-visible:ring-purple-500/50" 
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Email (Optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input placeholder="hello@trendythreads.com" className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-500/50" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-4">Security</h3>
                  <div className="space-y-2 md:w-1/2">
                    <Label className="text-slate-700">New Password (Leave blank to keep current)</Label>
                    <Input 
                      type="password"
                      value={profile.new_password || ''} 
                      onChange={e => setProfile({...profile, new_password: e.target.value})}
                      className="bg-white border-slate-200 text-slate-900 focus-visible:ring-purple-500/50" 
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-4">Default Pickup Location</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Full Address *</Label>
                      <Input 
                        required
                        value={profile.pickup_address || ''} 
                        onChange={e => setProfile({...profile, pickup_address: e.target.value})}
                        className="bg-white border-slate-200 text-slate-900 focus-visible:ring-purple-500/50" 
                      />
                    </div>
                    <div className="space-y-2 md:w-1/2">
                      <Label className="text-slate-700">Pincode *</Label>
                      <Input 
                        required
                        value={profile.pickup_pincode || ''} 
                        onChange={e => setProfile({...profile, pickup_pincode: e.target.value})}
                        className="bg-white border-slate-200 text-slate-900 focus-visible:ring-purple-500/50" 
                      />
                    </div>
                  </div>
                </div>

                {saveStatus && (
                  <div className={`p-3 text-sm rounded-xl text-center font-medium ${saveStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {saveStatus.message}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center"
                >
                  {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>

          {/* Products Management */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden mt-8">
            <div className="border-b border-slate-100 bg-slate-50 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Your Products</h2>
                <p className="text-sm text-slate-500 mt-1">Add your standard products here to avoid entering dimensions for every order.</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              
              {/* List of Products */}
              {products.length > 0 ? (
                <div className="space-y-3">
                  {products.map(p => (
                    <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-slate-900 font-bold">{p.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{p.weight_kg}kg • {p.length_cm}x{p.breadth_cm}x{p.height_cm} cm</p>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteProduct(p.id);
                        }}
                        className="text-red-500 hover:text-red-600 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                  <p className="text-slate-500">No products added yet.</p>
                </div>
              )}

              {/* Add New Product Form */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                <h4 className="text-slate-900 font-semibold mb-2">Add New Product</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 text-xs">Product Name</Label>
                    <Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Graphic T-Shirt" className="bg-white text-slate-900 border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 text-xs">Weight (kg)</Label>
                    <Input type="number" step="0.1" value={newProduct.weight_kg} onChange={e => setNewProduct({...newProduct, weight_kg: parseFloat(e.target.value) || 0})} className="bg-white text-slate-900 border-slate-200" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 text-xs">Length (cm)</Label>
                    <Input type="number" value={newProduct.length_cm} onChange={e => setNewProduct({...newProduct, length_cm: parseInt(e.target.value) || 0})} className="bg-white text-slate-900 border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 text-xs">Breadth (cm)</Label>
                    <Input type="number" value={newProduct.breadth_cm} onChange={e => setNewProduct({...newProduct, breadth_cm: parseInt(e.target.value) || 0})} className="bg-white text-slate-900 border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 text-xs">Height (cm)</Label>
                    <Input type="number" value={newProduct.height_cm} onChange={e => setNewProduct({...newProduct, height_cm: parseInt(e.target.value) || 0})} className="bg-white text-slate-900 border-slate-200" />
                  </div>
                </div>
                
                {productStatus && (
                  <div className={`p-3 text-sm rounded-xl text-center font-medium ${productStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {productStatus.message}
                  </div>
                )}

                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    addProduct();
                  }}
                  disabled={addingProduct || !newProduct.name}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                >
                  {addingProduct ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Add Product'}
                </button>
              </div>

            </div>
          </div>

          {/* Integrations - Centralized Bot Instructions */}
          <div className="bg-white shadow-sm rounded-2xl overflow-hidden mt-8 relative overflow-hidden border border-slate-100">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="border-b border-slate-100 bg-slate-50 p-6 relative z-10">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-[#0088cc]" />
                Telegram Bot Integration
              </h2>
              <p className="text-sm text-slate-500 mt-1">Connect your orders directly via Telegram.</p>
            </div>
            
            <div className="p-4 sm:p-6 relative z-10">
              <div className="flex flex-col gap-6 items-start bg-slate-50 border border-slate-200 p-4 sm:p-6 rounded-2xl">
                
                <div className="space-y-4 w-full">
                  <h3 className="text-xl font-bold text-slate-900">How it works</h3>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                    You do not need to scan any QR codes or set up APIs. Routefy provides a centralized AI bot that handles all your orders instantly.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-4 flex flex-col sm:flex-row items-start gap-4">
                    <Bot className="w-8 h-8 text-[#0088cc] shrink-0 mt-1" />
                    <div className="w-full">
                      <h4 className="font-bold text-slate-900 text-lg">Message the Routefy Bot</h4>
                      <p className="text-slate-600 text-sm mt-1">
                        Send screenshots, text, or voice notes to our central bot. Because you saved your phone number above, the bot automatically recognizes you as the sender and applies your catalog and pickup address!
                      </p>
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="font-mono bg-white border border-slate-200 px-4 py-2 rounded-lg text-[#0088cc] font-bold text-lg tracking-wider text-center sm:text-left">
                          @routefy_bot
                        </span>
                        <a href="https://t.me/routefy_bot" target="_blank" rel="noreferrer" className="bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm text-center w-full sm:w-auto">
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
