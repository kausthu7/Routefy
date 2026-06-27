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

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/merchant/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [modalError, setModalError] = useState('');

  const handleAddProduct = async () => {
    if (!newProductName.trim()) return;
    setIsSaving(true);
    setModalError('');
    
    try {
      const res = await fetch('/api/merchant/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          weight_kg: parseFloat(newProductWeight) || 1,
          length_cm: parseFloat(newProductLength) || 10,
          breadth_cm: parseFloat(newProductWidth) || 10,
          height_cm: parseFloat(newProductHeight) || 10
        })
      });
      if (res.ok) {
        fetchProducts();
        setIsModalOpen(false);
        setNewProductName('');
        setNewProductWeight('');
        setNewProductLength('');
        setNewProductWidth('');
        setNewProductHeight('');
      } else {
        const data = await res.json();
        setModalError(data.error || 'Failed to save product');
      }
    } catch (e) {
      console.error("Failed to save product", e);
      setModalError('An unexpected error occurred.');
    }
    setIsSaving(false);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/merchant/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error("Failed to delete product", e);
    }
  };

  return (
    <div className="p-4 sm:p-[32px] max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10 pb-32">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-slate-900 drop-shadow-sm">Products</h1>
          <p className="text-purple-100 md:text-slate-500 mt-1 text-sm font-medium">Manage your catalog for faster AI processing</p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-500 font-medium">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="bg-slate-50 rounded-[24px] border-dashed border-2 border-slate-200 shadow-none w-full h-[320px] flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
              <Boxes className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No products added</h3>
            <p className="text-slate-500 mt-2 max-w-sm text-sm">Add your standard products so Routefy AI can automatically calculate weights and dimensions from chat.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 px-6 rounded-xl shadow-sm transition-all flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Product
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl group relative overflow-hidden">
              <div className="p-6">
                <div className="w-14 h-14 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                  <Boxes className="w-7 h-7" />
                </div>
                
                <h3 className="font-extrabold text-xl text-slate-900 mb-2">{product.name || 'Unnamed Product'}</h3>
                
                <div className="space-y-2 mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Weight</span>
                    <span className="font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">{product.weight_kg || '0'} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Dimensions</span>
                    <span className="font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">{product.length_cm}x{product.breadth_cm}x{product.height_cm} cm</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDeleteProduct(product.id)} className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 flex items-center justify-center transition-colors shadow-sm">
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
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 text-sm rounded-xl text-center font-medium bg-red-50 text-red-600 border border-red-100">
                  {modalError}
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-slate-700">Product Name *</Label>
                <Input 
                  autoFocus
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Premium T-Shirt" 
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Default Weight (kg)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={newProductWeight}
                  onChange={(e) => setNewProductWeight(e.target.value)}
                  placeholder="e.g. 0.5" 
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Dimensions (L x W x H in cm)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    value={newProductLength}
                    onChange={(e) => setNewProductLength(e.target.value)}
                    placeholder="L" 
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-center"
                  />
                  <div className="flex items-center text-slate-400 font-bold">x</div>
                  <Input 
                    type="number"
                    value={newProductWidth}
                    onChange={(e) => setNewProductWidth(e.target.value)}
                    placeholder="W" 
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-center"
                  />
                  <div className="flex items-center text-slate-400 font-bold">x</div>
                  <Input 
                    type="number"
                    value={newProductHeight}
                    onChange={(e) => setNewProductHeight(e.target.value)}
                    placeholder="H" 
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-center"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProduct}
                disabled={!newProductName.trim() || isSaving}
                className="flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold rounded-xl shadow-sm disabled:shadow-none transition-all"
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
