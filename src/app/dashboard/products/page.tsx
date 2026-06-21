'use client';

import { useEffect, useState } from 'react';
import { Plus, Boxes, Edit2, Trash2, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductWeight, setNewProductWeight] = useState('');
  const [newProductLength, setNewProductLength] = useState('');
  const [newProductWidth, setNewProductWidth] = useState('');
  const [newProductHeight, setNewProductHeight] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/merchant/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.default_product) {
            try {
              const parsed = JSON.parse(data.default_product);
              if (Array.isArray(parsed)) {
                setProducts(parsed);
              } else {
                setProducts([{ name: data.default_product, weight: '0.5', dimensions: 'Standard' }]);
              }
            } catch (e) {
              setProducts([{ name: data.default_product, weight: '0.5', dimensions: 'Standard' }]);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    if (!newProductName.trim()) return;
    setIsSaving(true);
    
    let dimensionsStr = 'Standard';
    if (newProductLength && newProductWidth && newProductHeight) {
      dimensionsStr = `${newProductLength}x${newProductWidth}x${newProductHeight} cm`;
    }

    const newProductsList = [
      ...products, 
      { 
        name: newProductName, 
        weight: newProductWeight || '0.5',
        dimensions: dimensionsStr
      }
    ];

    try {
      await fetch('/api/merchant/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_product: JSON.stringify(newProductsList) })
      });
      
      setProducts(newProductsList);
      setIsModalOpen(false);
      setNewProductName('');
      setNewProductWeight('');
      setNewProductLength('');
      setNewProductWidth('');
      setNewProductHeight('');
    } catch (error) {
      console.error("Failed to save product", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (indexToDelete: number) => {
    const newProductsList = products.filter((_, index) => index !== indexToDelete);
    setProducts(newProductsList);
    try {
      await fetch('/api/merchant/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_product: JSON.stringify(newProductsList) })
      });
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Products</h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">Manage your catalog for faster AI processing</p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-500 font-medium">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="glass-card rounded-2xl border-dashed border-2 border-slate-700 bg-white/5 shadow-none">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-white/5 shadow-inner border border-white/10 rounded-full flex items-center justify-center mb-6 text-slate-400">
              <Boxes className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white">No products added</h3>
            <p className="text-slate-400 mt-2 max-w-sm text-sm">Add your standard products so Routefy AI can automatically calculate weights and dimensions from chat.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-6 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Product
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div key={index} className="glass-card rounded-2xl group relative overflow-hidden">
              <div className="p-6">
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                  <Boxes className="w-7 h-7" />
                </div>
                
                <h3 className="font-extrabold text-xl text-white mb-2">{product.name || 'Unnamed Product'}</h3>
                
                <div className="space-y-2 mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Weight</span>
                    <span className="font-bold text-slate-200 bg-black/40 px-2 py-1 rounded-md border border-white/5">{product.weight || '0'} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Dimensions</span>
                    <span className="font-bold text-slate-200 bg-black/40 px-2 py-1 rounded-md border border-white/5">{product.dimensions || 'Standard'}</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-9 h-9 rounded-full bg-black/40 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteProduct(index)} className="w-9 h-9 rounded-full bg-black/40 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 flex items-center justify-center transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      {products.length > 0 && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)] hover:scale-105 transition-all z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-card border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Add New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-300">Product Name</Label>
                <Input 
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Graphic T-Shirt" 
                  className="bg-black/20 border-white/10 text-white placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Default Weight (kg)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={newProductWeight}
                  onChange={(e) => setNewProductWeight(e.target.value)}
                  placeholder="e.g. 0.5" 
                  className="bg-black/20 border-white/10 text-white placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Dimensions (L x W x H in cm)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    value={newProductLength}
                    onChange={(e) => setNewProductLength(e.target.value)}
                    placeholder="L" 
                    className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 text-center"
                  />
                  <div className="flex items-center text-slate-500 font-bold">x</div>
                  <Input 
                    type="number"
                    value={newProductWidth}
                    onChange={(e) => setNewProductWidth(e.target.value)}
                    placeholder="W" 
                    className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 text-center"
                  />
                  <div className="flex items-center text-slate-500 font-bold">x</div>
                  <Input 
                    type="number"
                    value={newProductHeight}
                    onChange={(e) => setNewProductHeight(e.target.value)}
                    placeholder="H" 
                    className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 text-center"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProduct}
                disabled={!newProductName.trim() || isSaving}
                className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:shadow-none transition-all"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
